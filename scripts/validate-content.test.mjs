import test, { afterEach, describe } from "node:test"
import assert from "node:assert/strict"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { slugifyFilePath } from "@quartz-community/utils"
import { validateContent } from "./validate-content.mjs"

const tempRoots = []
const scriptPath = fileURLToPath(new URL("./validate-content.mjs", import.meta.url))

async function makeContent(files) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "knowledge-content-"))
  tempRoots.push(root)
  await Promise.all(
    Object.entries(files).map(async ([relativePath, source]) => {
      const filePath = path.join(root, relativePath)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, source, "utf8")
    }),
  )
  return root
}

function runCli(args, { cwd } = {}) {
  return new Promise((resolve) => {
    execFile(process.execPath, [scriptPath, ...args], { cwd }, (error, stdout, stderr) => {
      resolve({ exitCode: typeof error?.code === "number" ? error.code : 0, stdout, stderr })
    })
  })
}

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => fs.rm(root, { recursive: true })))
})

describe("validateContent frontmatter", () => {
  test("accepts a homepage and a valid topic", async () => {
    // Catches a regression that rejects valid frontmatter or requires homepage descriptions.
    const root = await makeContent({
      "index.md": "---\ntitle: 首页\ncssclasses: [garden-home]\n---\n\n欢迎。\n",
      "AI/Agent.md":
        "---\ntitle: Agent\ndescription: 理解 Agent。\ntags: [AI]\naliases: [AI Agent]\n---\n\n> [!abstract] 30 秒掌握\n> Agent 围绕目标行动。\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("requires description on topic documents", async () => {
    // Catches removing the normal-topic description requirement.
    const root = await makeContent({
      "AI/Agent.md": "---\ntitle: Agent\ntags: [AI]\n---\n\n正文。\n",
    })

    const errors = await validateContent(root)
    assert.ok(errors.some((error) => error.code === "frontmatter.description.required"))
  })

  test("requires aliases to be a string array when present", async () => {
    // Catches accepting a scalar aliases value that cannot be indexed safely.
    const root = await makeContent({
      "AI/Agent.md":
        "---\ntitle: Agent\ndescription: 理解 Agent。\ntags: [AI]\naliases: AI Agent\n---\n\n正文。\n",
    })

    const errors = await validateContent(root)
    assert.ok(errors.some((error) => error.code === "frontmatter.aliases.type"))
  })

  test("reports frontmatter parse errors", async () => {
    // Catches treating a Markdown document without frontmatter as valid metadata.
    const root = await makeContent({
      "AI/Agent.md": "没有 frontmatter。\n",
    })

    const errors = await validateContent(root)
    assert.ok(errors.some((error) => error.code === "frontmatter.parse"))
  })
})

describe("validateContent relationships and structure", () => {
  test("detects duplicate titles and aliases", async () => {
    // Catches allowing two documents to claim the same title or alias identity.
    const root = await makeContent({
      "A.md":
        "---\ntitle: 规则\ndescription: A。\ntags: [Codex]\naliases: [规则说明]\n---\n\n正文。\n",
      "B.md":
        "---\ntitle: 规则\ndescription: B。\ntags: [Codex]\naliases: [规则说明]\n---\n\n正文。\n",
    })
    const codes = (await validateContent(root)).map((error) => error.code)
    assert.ok(codes.includes("identity.title.duplicate"))
    assert.ok(codes.includes("identity.alias.duplicate"))
  })

  test("detects a title that conflicts with another document alias", async () => {
    // Catches allowing a title to shadow a shortest-link alias from another document.
    const root = await makeContent({
      "A.md": "---\ntitle: 规则\ndescription: A。\ntags: [Codex]\n---\n\n正文。\n",
      "B.md": "---\ntitle: B\ndescription: B。\ntags: [Codex]\naliases: [规则]\n---\n\n正文。\n",
    })

    const codes = (await validateContent(root)).map((error) => error.code)
    assert.ok(codes.includes("identity.title.duplicate"))
    assert.ok(codes.includes("identity.alias.duplicate"))
  })

  test("detects broken markdown links, wikilinks and embeds", async () => {
    // Catches missing documents and attachments being silently accepted.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[缺失文章](Missing.md)\n\n[[不存在]]\n\n![[missing.png]]\n",
    })
    const codes = (await validateContent(root)).map((error) => error.code)
    assert.ok(codes.includes("link.markdown.missing"))
    assert.ok(codes.includes("link.wiki.missing"))
    assert.ok(codes.includes("asset.missing"))
  })

  test("accepts valid relative links and shortest wikilinks", async () => {
    // Catches resolving valid linked content only when it is in the source directory.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[[B]]\n\n[图片](assets/pic.png)\n",
      "子目录/B.md": "---\ntitle: B\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "assets/pic.png": "image",
    })
    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("detects empty sections and unfinished placeholders", async () => {
    // Catches headings with no body and visible unfinished-content markers.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n## 空章节\n\n## 下一节\n\n待补充\n",
    })
    const codes = (await validateContent(root)).map((error) => error.code)
    assert.ok(codes.includes("structure.section.empty"))
    assert.ok(codes.includes("structure.placeholder"))
  })

  test("accepts parent sections with non-empty child sections", async () => {
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n## 父章节\n\n### 子章节\n\n正文。\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("does not treat a document-title heading before sections as empty", async () => {
    // Catches treating the conventional H1 document title as a content section.
    const root = await makeContent({
      "A.md": "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n# A\n\n## 正文\n\n内容。\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("detects ambiguous shortest links", async () => {
    // Catches resolving a short wikilink arbitrarily when more than one file matches.
    const root = await makeContent({
      "A.md": "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[[规则]]\n",
      "一/规则.md": "---\ntitle: 规则一\ndescription: 一。\ntags: [测试]\n---\n\n正文。\n",
      "二/规则.md": "---\ntitle: 规则二\ndescription: 二。\ntags: [测试]\n---\n\n正文。\n",
    })
    const errors = await validateContent(root)
    assert.ok(errors.some((error) => error.code === "link.wiki.ambiguous"))
  })

  test("detects Quartz output path collisions", async () => {
    // Catches folder-note pages that compile to the same Quartz output path.
    const root = await makeContent({
      "规则/规则.md": "---\ntitle: 文件夹规则\ndescription: 一。\ntags: [测试]\n---\n\n正文。\n",
      "规则/index.md": "---\ntitle: 索引规则\ndescription: 二。\ntags: [测试]\n---\n\n正文。\n",
    })
    const errors = await validateContent(root)
    assert.ok(errors.some((error) => error.code === "identity.path.duplicate"))
  })

  test("detects output collisions created by Quartz slugification", async () => {
    // Catches using source spelling instead of Quartz's actual page slug for collisions.
    const root = await makeContent({
      "A B.md": "---\ntitle: 空格\ndescription: A。\ntags: [测试]\n---\n\n正文。\n",
      "A-B.md": "---\ntitle: 连字符\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "R&D.md": "---\ntitle: 与号\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
      "R-and-D.md": "---\ntitle: and\ndescription: D。\ntags: [测试]\n---\n\n正文。\n",
      "Rules/Rules.md": "---\ntitle: 文件夹\ndescription: E。\ntags: [测试]\n---\n\n正文。\n",
      "Rules/index.md": "---\ntitle: 索引\ndescription: F。\ntags: [测试]\n---\n\n正文。\n",
    })

    const files = (await validateContent(root))
      .filter((error) => error.code === "identity.path.duplicate")
      .map((error) => error.file)
    assert.deepStrictEqual(files, [
      "A B.md",
      "A-B.md",
      "R-and-D.md",
      "R&D.md",
      "Rules/index.md",
      "Rules/Rules.md",
    ])
  })

  test("uses Quartz's lowercase output slug normalization", () => {
    // Documents the case-normalization rule when the host filesystem cannot store case-only pairs.
    assert.equal(slugifyFilePath("UPPER.md"), "upper")
  })

  test("keeps literal percent signs in identities while decoding link targets once", async () => {
    // Catches decoding source identities or failing to resolve Quartz-style encoded link paths.
    const root = await makeContent({
      "A.md":
        "---\ntitle: 100% 覆盖率\ndescription: A。\ntags: [测试]\n---\n\n[空格](space/A%20B.md)\n\n[字面百分号](literal/A%2520B.md)\n",
      "space/A B.md": "---\ntitle: 空格\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "literal/A%20B.md": "---\ntitle: 字面百分号\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("reports malformed link escapes without rejecting validation", async () => {
    // Catches a URI decoding exception escaping the public validator contract.
    const root = await makeContent({
      "A.md": "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[损坏](bad%ZZ.md)\n",
    })

    assert.deepStrictEqual(await validateContent(root), [
      {
        file: "A.md",
        code: "link.target.decode",
        message: "链接目标包含无效 URI 转义: bad%ZZ.md",
      },
    ])
  })

  test("skips external and anchor targets before URI decoding", async () => {
    // Catches decoding targets that Task 2 defines as out of scope for internal-link validation.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[外部](https://example.com/%ZZ)\n\n![图片](https://example.com/%ZZ.png)\n\n[邮件](mailto:user%ZZ@example.com)\n\n[锚点](#bad%ZZ)\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("extracts only Markdown AST references", async () => {
    // Catches regex extraction treating code, comments, or escaped syntax as live references.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[文章](docs/foo(bar).md)\n\n![图片](assets/pic(one).png)\n\n[[目标]]\n\n`[代码](missing.md) ![[missing.png]]`\n\n<!-- [注释](missing.md) ![[missing.png]] -->\n\n\\[转义](missing.md)\n",
      "docs/foo(bar).md": "---\ntitle: 文章\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "assets/pic(one).png": "image",
      "目标.md": "---\ntitle: 目标\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
    })

    assert.deepStrictEqual(await validateContent(root), [])
  })

  test("validates only used CommonMark reference definitions", async () => {
    // Catches reference-style links and images bypassing the same real-target validation as inline links.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[有效文章][article]\n\n[缺失文章][missing-article]\n\n![有效图片][picture]\n\n![缺失图片][missing-image]\n\n[第一次][first]\n\n[第二次][first]\n\n[折叠][]\n\n[shortcut]\n\n[article]: valid.md\n[missing-article]: missing.md\n[picture]: assets/pic.png\n[missing-image]: missing.png\n[first]: first.md\n[first]: ignored-after-first.md\n[折叠]: collapsed.md\n[shortcut]: shortcut.md\n[unused]: unused-missing.md\n",
      "valid.md": "---\ntitle: 有效\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "first.md": "---\ntitle: 首次\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
      "collapsed.md": "---\ntitle: 折叠\ndescription: D。\ntags: [测试]\n---\n\n正文。\n",
      "shortcut.md": "---\ntitle: 快捷\ndescription: E。\ntags: [测试]\n---\n\n正文。\n",
      "assets/pic.png": "image",
    })

    assert.deepStrictEqual(await validateContent(root), [
      {
        file: "A.md",
        code: "asset.missing",
        message: "附件不存在: missing.png",
      },
      {
        file: "A.md",
        code: "link.markdown.missing",
        message: "Markdown 链接不存在: missing.md",
      },
    ])
  })

  test("detects Quartz-shortest slug ambiguity while preserving explicit paths", async () => {
    // Catches shortest links resolving by raw source spelling instead of Quartz's slugged candidates.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[[A-B]]\n\n[短 Markdown](A-B)\n\n[[R-and-D]]\n\n[明确路径](一/A B.md)\n\n[[Unique-Page]]\n\n[[资料/index]]\n",
      "一/A B.md": "---\ntitle: 空格\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "二/A-B.md": "---\ntitle: 连字符\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
      "一/R&D.md": "---\ntitle: 与号\ndescription: D。\ntags: [测试]\n---\n\n正文。\n",
      "二/R-and-D.md": "---\ntitle: and\ndescription: E。\ntags: [测试]\n---\n\n正文。\n",
      "唯一/Unique Page.md": "---\ntitle: 唯一\ndescription: F。\ntags: [测试]\n---\n\n正文。\n",
      "资料/资料.md": "---\ntitle: 文件夹\ndescription: G。\ntags: [测试]\n---\n\n正文。\n",
    })

    const errors = await validateContent(root)
    assert.deepStrictEqual(
      errors.map((error) => [error.code, error.message]),
      [
        ["link.markdown.ambiguous", "Markdown 链接不唯一: A-B"],
        ["link.wiki.ambiguous", "Wikilink 不唯一: A-B"],
        ["link.wiki.ambiguous", "Wikilink 不唯一: R-and-D"],
      ],
    )
  })

  test("matches Quartz-shortest multi-segment suffixes and folder indexes", async () => {
    // Catches treating multi-segment shortest links as exact-only full slugs.
    const root = await makeContent({
      "A.md":
        "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n[[共享/A-B]]\n\n[[唯一/Unique-Page]]\n\n[[资料/]]\n\n[[单独资料/]]\n",
      "根一/共享/A B.md": "---\ntitle: 空格\ndescription: B。\ntags: [测试]\n---\n\n正文。\n",
      "根二/共享/A-B.md": "---\ntitle: 连字符\ndescription: C。\ntags: [测试]\n---\n\n正文。\n",
      "根三/唯一/Unique Page.md":
        "---\ntitle: 唯一\ndescription: D。\ntags: [测试]\n---\n\n正文。\n",
      "根一/资料/资料.md": "---\ntitle: 资料一\ndescription: E。\ntags: [测试]\n---\n\n正文。\n",
      "根二/资料/资料.md": "---\ntitle: 资料二\ndescription: F。\ntags: [测试]\n---\n\n正文。\n",
      "根三/单独资料/单独资料.md":
        "---\ntitle: 单独资料\ndescription: G。\ntags: [测试]\n---\n\n正文。\n",
    })

    assert.deepStrictEqual(
      (await validateContent(root)).map((error) => [error.code, error.message]),
      [
        ["link.wiki.ambiguous", "Wikilink 不唯一: 共享/A-B"],
        ["link.wiki.ambiguous", "Wikilink 不唯一: 资料/"],
      ],
    )
  })
})

describe("validate-content CLI", () => {
  test("reports explicit-root validation failures in sorted stderr", async () => {
    // Catches a CLI that loses validation errors, sends them to stdout, or emits them unsorted.
    const root = await makeContent({
      "B.md": "没有 frontmatter。\n",
      "A.md": "---\ntitle: A\n---\n\n正文。\n",
    })

    assert.deepStrictEqual(await runCli([root]), {
      exitCode: 1,
      stdout: "",
      stderr:
        "A.md [frontmatter.description.required] 普通主题必须包含 description\n" +
        "A.md [frontmatter.tags.type] 普通主题的 tags 必须是非空字符串数组\n" +
        "B.md [frontmatter.parse] 缺少 frontmatter 起始分隔符\n",
    })
  })

  test("accepts an explicit content root", async () => {
    // Catches a CLI that ignores its explicit content-root argument.
    const root = await makeContent({
      "index.md": "---\ntitle: 首页\n---\n\n正文。\n",
    })

    assert.deepStrictEqual(await runCli([root]), {
      exitCode: 0,
      stdout: "Content validation passed: " + root + "\n",
      stderr: "",
    })
  })

  test("uses content beneath the current working directory by default", async () => {
    // Catches default-root resolution against the script directory rather than the process cwd.
    const root = await makeContent({
      "content/index.md": "---\ntitle: 首页\n---\n\n正文。\n",
    })
    const realRoot = await fs.realpath(root)

    assert.deepStrictEqual(await runCli([], { cwd: root }), {
      exitCode: 0,
      stdout: "Content validation passed: " + path.join(realRoot, "content") + "\n",
      stderr: "",
    })
  })

  test("reports unreadable roots without a Node stack trace", async () => {
    // Catches an uncaught filesystem exception leaking a Node stack from the CLI.
    const root = await makeContent({})
    const missingRoot = path.join(root, "missing-content")

    assert.deepStrictEqual(await runCli([missingRoot]), {
      exitCode: 1,
      stdout: "",
      stderr: "[content.root.read] 无法读取内容根目录\n",
    })
  })
})
