import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"
import { isFolderPath, slugifyFilePath } from "@quartz-community/utils"
import { ObsidianFlavoredMarkdown } from "@quartz-community/obsidian-flavored-markdown"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import YAML from "yaml"
import remarkParse from "remark-parse"

/** @typedef {{ file: string, code: string, message: string }} ValidationError */
/**
 * @typedef {{
 *   filePath: string,
 *   relativePath: string,
 *   frontmatter: Record<string, unknown>,
 *   body: string,
 *   markdownLinks: Array<{ target: string, image: boolean }>,
 *   wikiLinks: Array<{ target: string, embed: boolean }>
 * }} ContentDocument
 */

async function walkFiles(root) {
  const entries = await fs.readdir(root, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(root, entry.name)
      return entry.isDirectory() ? walkFiles(filePath) : [filePath]
    }),
  )
  return nested.flat().sort()
}

function parseFrontmatter(source, relativePath) {
  const lines = source.replaceAll("\r\n", "\n").split("\n")
  if (lines[0] !== "---") {
    throw new Error("缺少 frontmatter 起始分隔符")
  }
  const closing = lines.findIndex((line, index) => index > 0 && line === "---")
  if (closing === -1) {
    throw new Error("缺少 frontmatter 结束分隔符")
  }
  const parsed = YAML.parse(lines.slice(1, closing).join("\n"))
  if (parsed == null || Array.isArray(parsed) || typeof parsed !== "object") {
    throw new Error("frontmatter 必须是 YAML 对象")
  }
  return { frontmatter: parsed, body: lines.slice(closing + 1).join("\n"), relativePath }
}

function isStringArray(value, { allowEmpty = false } = {}) {
  return (
    Array.isArray(value) &&
    (allowEmpty || value.length > 0) &&
    value.every((item) => typeof item === "string" && item.trim())
  )
}

function validateFrontmatter(document) {
  const errors = []
  const homepage = document.relativePath === "index.md"
  const meta = document.frontmatter
  if (typeof meta.title !== "string" || !meta.title.trim()) {
    errors.push({
      file: document.relativePath,
      code: "frontmatter.title.required",
      message: "title 必须是非空字符串",
    })
  }
  if (!homepage && (typeof meta.description !== "string" || !meta.description.trim())) {
    errors.push({
      file: document.relativePath,
      code: "frontmatter.description.required",
      message: "普通主题必须包含 description",
    })
  }
  if (!homepage && !isStringArray(meta.tags)) {
    errors.push({
      file: document.relativePath,
      code: "frontmatter.tags.type",
      message: "普通主题的 tags 必须是非空字符串数组",
    })
  }
  if (meta.aliases !== undefined && !isStringArray(meta.aliases, { allowEmpty: true })) {
    errors.push({
      file: document.relativePath,
      code: "frontmatter.aliases.type",
      message: "aliases 必须是字符串数组",
    })
  }
  return errors
}

function normalizeIdentityKey(value) {
  return value
    .normalize("NFC")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/^\//, "")
    .replace(/\.md$/i, "")
    .replace(/\/index$/i, "")
    .trim()
    .toLocaleLowerCase("zh-CN")
}

function canonicalOutputKey(relativePath) {
  return slugifyFilePath(relativePath)
}

function withoutFencedCode(body) {
  let fenced = false
  return body
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced
        return ""
      }
      return fenced ? "" : line
    })
    .join("\n")
}

const [obsidianRemarkPlugin, obsidianRemarkOptions] = ObsidianFlavoredMarkdown({
  wikilinks: true,
}).markdownPlugins({})[0]
const markdownParser = unified().use(remarkParse).use(obsidianRemarkPlugin, obsidianRemarkOptions)

function extractReferences(body) {
  const markdownLinks = []
  const wikiLinks = []
  const definitions = new Map()
  const references = []
  const tree = markdownParser.parse(body)
  visit(tree, (node) => {
    if (node.type === "definition" && !definitions.has(node.identifier)) {
      definitions.set(node.identifier, node.url)
    }
    if (node.type === "link") {
      markdownLinks.push({ target: node.url, image: false })
    }
    if (node.type === "image") {
      markdownLinks.push({ target: node.url, image: true })
    }
    if (node.type === "linkReference" || node.type === "imageReference") {
      references.push({ identifier: node.identifier, image: node.type === "imageReference" })
    }
    if (node.type === "wikilink") {
      wikiLinks.push({ target: node.path, embed: node.embedded })
    }
  })
  for (const reference of references) {
    const target = definitions.get(reference.identifier)
    if (target !== undefined) markdownLinks.push({ target, image: reference.image })
  }
  return { markdownLinks, wikiLinks }
}

function validateStructure(document) {
  const visible = withoutFencedCode(document.body)
  const errors = []
  const lines = visible.split("\n")
  for (let index = 0; index < lines.length; index += 1) {
    if (/^#{1,6}\s*$/.test(lines[index])) {
      errors.push({
        file: document.relativePath,
        code: "structure.heading.empty",
        message: "标题缺少文本",
      })
    }
    if (/^\s*(待补充|待完善)\s*[:：]?\s*$/.test(lines[index])) {
      errors.push({
        file: document.relativePath,
        code: "structure.placeholder",
        message: "存在未完成占位内容",
      })
    }
    const currentHeading = /^(#{1,6})\s+\S/.exec(lines[index])
    if (currentHeading) {
      let next = index + 1
      while (next < lines.length && !lines[next].trim()) next += 1
      const nextHeading = next < lines.length ? /^(#{1,6})\s+\S/.exec(lines[next]) : null
      const nestedSection =
        nextHeading !== null && nextHeading[1].length > currentHeading[1].length
      const heading = /^#\s+(.+)$/.exec(lines[index])
      const documentTitle =
        heading &&
        typeof document.frontmatter.title === "string" &&
        heading[1].trim() === document.frontmatter.title.trim()
      if (!documentTitle && (next >= lines.length || (nextHeading !== null && !nestedSection))) {
        errors.push({
          file: document.relativePath,
          code: "structure.section.empty",
          message: "章节没有正文",
        })
      }
    }
  }
  return errors
}

function addIndexEntry(index, key, document) {
  if (!key) return
  const documents = index.get(key) ?? new Set()
  documents.add(document)
  index.set(key, documents)
}

function createDocumentIndex(documents) {
  const identities = new Map()
  const fullSlugs = new Map()
  const slugBasenames = new Map()
  for (const document of documents) {
    addIndexEntry(identities, normalizeIdentityKey(document.relativePath), document)
    addIndexEntry(identities, normalizeIdentityKey(path.basename(document.relativePath)), document)
    if (typeof document.frontmatter.title === "string" && document.frontmatter.title.trim()) {
      addIndexEntry(identities, normalizeIdentityKey(document.frontmatter.title), document)
    }
    if (isStringArray(document.frontmatter.aliases, { allowEmpty: true })) {
      for (const alias of document.frontmatter.aliases) {
        addIndexEntry(identities, normalizeIdentityKey(alias), document)
      }
    }
    const fullSlug = slugifyFilePath(document.relativePath)
    addIndexEntry(fullSlugs, fullSlug, document)
    addIndexEntry(slugBasenames, path.posix.basename(fullSlug), document)
  }
  return { identities, fullSlugs, slugBasenames }
}

function duplicateErrors(documents, getKeys, code, message) {
  const matches = new Map()
  for (const document of documents) {
    for (const key of getKeys(document)) {
      if (!key) continue
      const matchingDocuments = matches.get(key) ?? new Set()
      matchingDocuments.add(document)
      matches.set(key, matchingDocuments)
    }
  }
  return [...matches.values()].flatMap((matchingDocuments) =>
    matchingDocuments.size > 1
      ? [...matchingDocuments].map((document) => ({
          file: document.relativePath,
          code,
          message,
        }))
      : [],
  )
}

function validateIdentities(documents) {
  const identities = new Map()
  for (const document of documents) {
    const keys = []
    if (typeof document.frontmatter.title === "string" && document.frontmatter.title.trim()) {
      keys.push(normalizeIdentityKey(document.frontmatter.title))
    }
    if (isStringArray(document.frontmatter.aliases, { allowEmpty: true })) {
      keys.push(...document.frontmatter.aliases.map(normalizeIdentityKey))
    }
    for (const key of keys) addIndexEntry(identities, key, document)
  }
  const isDuplicateIdentity = (key) => (identities.get(key) ?? new Set()).size > 1
  const titleErrors = documents.flatMap((document) => {
    const { title } = document.frontmatter
    return typeof title === "string" &&
      title.trim() &&
      isDuplicateIdentity(normalizeIdentityKey(title))
      ? [
          {
            file: document.relativePath,
            code: "identity.title.duplicate",
            message: "title 与其他文章的标题或 alias 重复",
          },
        ]
      : []
  })
  const aliasErrors = documents.flatMap((document) => {
    if (!isStringArray(document.frontmatter.aliases, { allowEmpty: true })) return []
    return document.frontmatter.aliases.some((alias) =>
      isDuplicateIdentity(normalizeIdentityKey(alias)),
    )
      ? [
          {
            file: document.relativePath,
            code: "identity.alias.duplicate",
            message: "alias 与其他文章的标题或 alias 重复",
          },
        ]
      : []
  })
  const outputErrors = duplicateErrors(
    documents,
    (document) => [canonicalOutputKey(document.relativePath)],
    "identity.path.duplicate",
    "Quartz 输出路径与其他文章冲突",
  )
  return [...titleErrors, ...aliasErrors, ...outputErrors]
}

function targetWithoutQueryOrHash(target) {
  return target.split(/[?#]/, 1)[0]
}

function decodeLinkTarget(target) {
  try {
    return { target: decodeURI(target) }
  } catch {
    return null
  }
}

function shouldSkipTarget(target) {
  return /^(?:https?:|mailto:|tel:|data:|\/\/|#)/i.test(target)
}

function resolveContentFile(contentRoot, sourceFilePath, target) {
  const candidate = path.resolve(path.dirname(sourceFilePath), target)
  const relativeCandidate = path.relative(contentRoot, candidate)
  if (relativeCandidate.startsWith("..") || path.isAbsolute(relativeCandidate)) return null
  return candidate
}

function referenceError(document, code, message) {
  return { file: document.relativePath, code, message }
}

function findIndexedDocuments(index, target) {
  const matches = new Set(index.identities.get(normalizeIdentityKey(target)) ?? [])
  const targetSlug = slugifyFilePath(target)
  if (target.includes("/")) {
    const folderTarget = isFolderPath(target) || isFolderPath(targetSlug)
    const folderIndex = targetSlug + "/index"
    for (const [fullSlug, documents] of index.fullSlugs) {
      const matchesSlug = fullSlug === targetSlug || fullSlug.endsWith("/" + targetSlug)
      const matchesFolderIndex =
        folderTarget && (fullSlug === folderIndex || fullSlug.endsWith("/" + folderIndex))
      if (matchesSlug || matchesFolderIndex) {
        for (const document of documents) matches.add(document)
      }
    }
  } else {
    for (const document of index.fullSlugs.get(targetSlug) ?? []) matches.add(document)
    for (const document of index.slugBasenames.get(path.posix.basename(targetSlug)) ?? []) {
      matches.add(document)
    }
  }
  return [...matches]
}

function validateMarkdownReference(document, reference, contentRoot, filePaths, index) {
  if (!reference.target || shouldSkipTarget(reference.target)) return []
  const decoded = decodeLinkTarget(reference.target)
  if (!decoded) {
    return [
      referenceError(
        document,
        "link.target.decode",
        "链接目标包含无效 URI 转义: " + reference.target,
      ),
    ]
  }
  const target = targetWithoutQueryOrHash(decoded.target)
  if (!target) return []
  const extension = path.posix.extname(target)
  if (reference.image || (extension && extension.toLowerCase() !== ".md")) {
    const assetPath = resolveContentFile(contentRoot, document.filePath, target)
    return assetPath && filePaths.has(assetPath)
      ? []
      : [referenceError(document, "asset.missing", "附件不存在: " + target)]
  }

  if (extension.toLowerCase() === ".md" || target.startsWith("./") || target.startsWith("../")) {
    const documentPath = resolveContentFile(contentRoot, document.filePath, target)
    if (documentPath && filePaths.has(documentPath)) return []
    return [referenceError(document, "link.markdown.missing", "Markdown 链接不存在: " + target)]
  }

  const matches = findIndexedDocuments(index, target)
  if (matches.length === 1) return []
  if (matches.length > 1) {
    return [referenceError(document, "link.markdown.ambiguous", "Markdown 链接不唯一: " + target)]
  }
  return [referenceError(document, "link.markdown.missing", "Markdown 链接不存在: " + target)]
}

function validateWikiReference(document, reference, contentRoot, filePaths, index) {
  if (!reference.target || shouldSkipTarget(reference.target)) return []
  const decoded = decodeLinkTarget(reference.target)
  if (!decoded) {
    return [
      referenceError(
        document,
        "link.target.decode",
        "链接目标包含无效 URI 转义: " + reference.target,
      ),
    ]
  }
  const target = targetWithoutQueryOrHash(decoded.target)
  if (!target) return []
  const extension = path.posix.extname(target)
  if (reference.embed && extension && extension.toLowerCase() !== ".md") {
    const assetPath = resolveContentFile(contentRoot, document.filePath, target)
    return assetPath && filePaths.has(assetPath)
      ? []
      : [referenceError(document, "asset.missing", "附件不存在: " + target)]
  }

  const matches = findIndexedDocuments(index, target)
  if (matches.length === 1) return []
  if (matches.length > 1) {
    return [referenceError(document, "link.wiki.ambiguous", "Wikilink 不唯一: " + target)]
  }
  return [referenceError(document, "link.wiki.missing", "Wikilink 不存在: " + target)]
}

function validateReferences(document, contentRoot, filePaths, index) {
  return [
    ...document.markdownLinks.flatMap((reference) =>
      validateMarkdownReference(document, reference, contentRoot, filePaths, index),
    ),
    ...document.wikiLinks.flatMap((reference) =>
      validateWikiReference(document, reference, contentRoot, filePaths, index),
    ),
  ]
}

/**
 * @param {string} contentRoot
 * @returns {Promise<ValidationError[]>}
 */
export async function validateContent(contentRoot) {
  const root = path.resolve(contentRoot)
  const filePaths = await walkFiles(root)
  const errors = []
  const documents = []

  for (const filePath of filePaths) {
    if (path.extname(filePath).toLowerCase() !== ".md") continue

    const relativePath = path.relative(root, filePath).replaceAll(path.sep, "/")
    try {
      const source = await fs.readFile(filePath, "utf8")
      const parsed = parseFrontmatter(source, relativePath)
      const references = extractReferences(parsed.body)
      documents.push({ filePath, ...parsed, ...references })
      errors.push(...validateFrontmatter(parsed))
    } catch (error) {
      errors.push({
        file: relativePath,
        code: "frontmatter.parse",
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const index = createDocumentIndex(documents)
  errors.push(...validateIdentities(documents))
  errors.push(...documents.flatMap(validateStructure))
  errors.push(
    ...documents.flatMap((document) =>
      validateReferences(document, root, new Set(filePaths), index),
    ),
  )

  return errors.sort(
    (left, right) =>
      left.file.localeCompare(right.file, "zh-CN") || left.code.localeCompare(right.code),
  )
}

function formatErrors(errors) {
  return errors.map((error) => error.file + " [" + error.code + "] " + error.message).join("\n")
}

async function main() {
  const contentRoot = path.resolve(process.argv[2] || "content")
  let errors
  try {
    errors = await validateContent(contentRoot)
  } catch {
    process.stderr.write("[content.root.read] 无法读取内容根目录\n")
    process.exitCode = 1
    return
  }
  if (errors.length) {
    process.stderr.write(formatErrors(errors) + "\n")
    process.exitCode = 1
    return
  }
  process.stdout.write("Content validation passed: " + contentRoot + "\n")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
