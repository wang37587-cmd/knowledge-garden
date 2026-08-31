# AI Development Knowledge Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sample-oriented knowledge layout with an AI development learning map, a reusable core-concepts article, and a clearly nested Codex practice section.

**Architecture:** `content/index.md` points to `content/AI 开发/index.md`, which owns the learning path. A separate core-concepts article explains the generic model/agent/tool/runtime vocabulary, while the three existing Codex articles move under `AI 开发/Agent 工程/Codex/` and remain the detailed product-specific layer.

**Tech Stack:** Quartz v5 Markdown, YAML frontmatter, Node.js `node:test`, the existing `scripts/validate-content.mjs` validator, Prettier, TypeScript, and Quartz build/browser verification.

**Spec:** `docs/superpowers/specs/2026-08-28-ai-development-knowledge-architecture-design.md`

## Global Constraints

- Quartz `content/` is the only formal knowledge source.
- Do not create, move, modify, or delete formal knowledge content until the complete current candidate has been shown and explicitly approved.
- Delete all five user-identified sample articles; do not preserve redirects or compatibility copies.
- Codex remains a product-specific leaf under `AI 开发/Agent 工程/Codex/`, not a top-level knowledge category.
- Do not create separate thin articles for LLM, RAG, memory, evaluation, or safety in this iteration.
- Product-specific claims must be labeled as Codex or current local-environment facts.
- Fix the validator's nested-heading false positive without adding filler prose to the articles.
- Prepare the displayed candidate in the same Prettier-compatible form that will be written.
- Preserve unrelated staged, unstaged, and untracked user changes.
- Do not stage, commit, push, or publish without a later explicit user instruction.
- Stop after each task's review checkpoint so the user can review the current state.

---

### Task 1: Generate the complete restructuring candidate

**Files:**

- Read only: `content/index.md`
- Read only: `content/AI/AI Agent 基础概念.md`
- Read only: `content/AI/Prompt 设计原则.md`
- Read only: `content/工具与环境/GitHub Pages 部署.md`
- Read only: `content/开发/Markdown 知识组织.md`
- Read only: `content/问题排查/静态网站常见问题.md`
- Read only: `content/工具与环境/Codex/Codex 规则如何生效.md`
- Read only: `content/工具与环境/Codex/多个项目如何复用 Codex 规则.md`
- Read only: `content/工具与环境/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md`
- No production file changes

**Interfaces:**

- Consumes: the approved architecture spec, current content, current official OpenAI documentation for product-specific statements, and the existing Knowledge Distillation rules.
- Produces: one complete user-visible candidate version containing every production Markdown file after the restructure, the deletion list, link map, and validator change proposal.

- [ ] **Step 1: Verify current source boundaries**

Read the nine content files listed above and confirm that the five sample articles contain no unique knowledge that must survive as a separate article. Reusable concepts may be rewritten in the new core-concepts article, but old prose must not be copied mechanically.

- [ ] **Step 2: Verify current product facts**

Use current official OpenAI documentation for the Codex-specific meanings of Skill, Plugin, and MCP. Local Superpowers statements must remain explicitly scoped to the installed 6.3.0 package.

- [ ] **Step 3: Draft `content/AI 开发/index.md`**

Use this exact frontmatter:

```yaml
---
title: AI 开发知识地图
description: 从 LLM 与 Agent 基础概念出发，逐步学习工具、规则、工作流和 Codex 工程实践。
tags: [AI, Agent, 学习路径]
aliases:
  - AI 开发学习路径
  - AI 知识地图
---
```

The body must start with a `30 秒掌握` callout and contain:

- the distinction between model capability, Agent execution, capability connection, and engineering control;
- a recommended reading sequence;
- a compact topic table;
- links to the core-concepts article and all three Codex detail articles;
- a boundary explaining that future topics are added only when enough reusable knowledge exists.

- [ ] **Step 4: Draft `content/AI 开发/基础概念/AI 开发核心概念.md`**

Use this exact frontmatter:

```yaml
---
title: AI 开发核心概念
description: 理解 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 与 MCP 的职责和关系。
tags: [AI, Agent, LLM, MCP]
aliases:
  - AI Agent 核心概念
  - LLM 与 Agent
---
```

The body must start with a `30 秒掌握` callout and contain:

- a comparison table for LLM, Agent, Tool, Harness, Rule, Skill, Plugin, and MCP;
- an execution chain showing how user intent reaches a model, tools, and results through an Agent/Harness;
- a section distinguishing capability, orchestration, constraints, and distribution;
- a section distinguishing generic concepts from Codex implementations;
- links from Rule, Skill/Plugin/MCP, and project reuse concepts to the three Codex detail articles;
- common misconceptions without empty parent sections or placeholder content.

- [ ] **Step 5: Prepare the three moved Codex articles**

Keep their approved subject boundaries and main prose. Change only what the new architecture requires:

- new relative links to `../../index.md` and `../../基础概念/AI 开发核心概念.md`;
- links among the three files remain same-directory links;
- remove the obsolete link to `content/AI/AI Agent 基础概念.md`;
- do not add a duplicate H1;
- do not add filler text under parent headings.

The new paths are:

```text
content/AI 开发/Agent 工程/Codex/Codex 规则如何生效.md
content/AI 开发/Agent 工程/Codex/多个项目如何复用 Codex 规则.md
content/AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md
```

- [ ] **Step 6: Draft the exact `content/index.md` result**

Preserve the existing frontmatter and opening/closing garden text. Replace the sample-oriented topic list with:

```markdown
## 探索主题

- [AI 开发知识地图](<AI 开发/index.md>) 从核心概念出发，逐步学习 Agent、工具、规则和工程实践。

## 最近整理

- [AI 开发知识地图](<AI 开发/index.md>) 建立从基础概念到具体工程实践的学习路径。
- [AI 开发核心概念](<AI 开发/基础概念/AI 开发核心概念.md>) 理解 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 与 MCP 的关系。
- [Codex 规则如何生效](<AI 开发/Agent 工程/Codex/Codex 规则如何生效.md>) 理解 AGENTS.md 的加载、覆盖和容量边界。
```

- [ ] **Step 7: Show the complete candidate and hard-stop**

Display, in this order:

1. source scope;
2. exact create/move/delete/modify matrix;
3. complete Markdown for the two new articles;
4. complete Markdown for all three moved Codex articles;
5. exact `content/index.md` result;
6. internal link map;
7. exact five-file deletion list and deletion rationale;
8. validator test/implementation proposal;
9. uncertainties and official-source boundaries.

Expected: no production content changes. Wait for explicit approval of this complete candidate version.

- [ ] **Step 8: Verify Task 1 remained read-only**

Run:

```bash
git status --short --branch --untracked-files=all
git rev-parse HEAD
```

Expected: no Task 1 production changes and no new commit.

---

### Task 2: Fix nested-heading structure validation with TDD

**Files:**

- Modify: `scripts/validate-content.test.mjs`
- Modify: `scripts/validate-content.mjs`

**Interfaces:**

- Consumes: `validateContent(contentRoot): Promise<ValidationError[]>` and the existing `structure.section.empty` behavior.
- Produces: a validator that accepts a parent section containing non-empty child sections while still rejecting genuinely empty headings.

- [ ] **Step 1: Add a failing nested-section test**

Add this test beside the existing empty-section tests:

```js
test("accepts parent sections with non-empty child sections", async () => {
  const root = await makeContent({
    "A.md":
      "---\ntitle: A\ndescription: A。\ntags: [测试]\n---\n\n## 父章节\n\n### 子章节\n\n正文。\n",
  })

  assert.deepStrictEqual(await validateContent(root), [])
})
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test --test-name-pattern='accepts parent sections' scripts/validate-content.test.mjs
```

Expected: FAIL with `structure.section.empty` for `## 父章节`.

- [ ] **Step 3: Implement heading-level-aware validation**

Inside `validateStructure`, parse the current and next heading levels:

```js
const currentHeading = /^(#{1,6})\s+\S/.exec(lines[index])
if (currentHeading) {
  let next = index + 1
  while (next < lines.length && !lines[next].trim()) next += 1
  const nextHeading = next < lines.length ? /^(#{1,6})\s+\S/.exec(lines[next]) : null
  const nestedSection = nextHeading !== null && nextHeading[1].length > currentHeading[1].length

  // Preserve the existing document-title exemption. Report empty only when
  // the file ends or the next heading is same-level/higher-level.
}
```

Keep all existing error codes and public interfaces unchanged.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run:

```bash
node --test --test-name-pattern='accepts parent sections' scripts/validate-content.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run the full validator suite**

Run:

```bash
node --test scripts/validate-content.test.mjs
```

Expected: all validator tests pass, including the existing true-empty-section test.

- [ ] **Step 6: Review checkpoint**

Run:

```bash
git diff --check -- scripts/validate-content.mjs scripts/validate-content.test.mjs
git diff -- scripts/validate-content.mjs scripts/validate-content.test.mjs
```

Expected: only the approved validator behavior and its regression test changed; no stage or commit.

---

### Task 3: Apply the approved knowledge restructure

**Files:**

- Create: `content/AI 开发/index.md`
- Create: `content/AI 开发/基础概念/AI 开发核心概念.md`
- Create: `content/AI 开发/Agent 工程/Codex/Codex 规则如何生效.md`
- Create: `content/AI 开发/Agent 工程/Codex/多个项目如何复用 Codex 规则.md`
- Create: `content/AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md`
- Delete: `content/工具与环境/Codex/Codex 规则如何生效.md`
- Delete: `content/工具与环境/Codex/多个项目如何复用 Codex 规则.md`
- Delete: `content/工具与环境/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md`
- Delete: `content/AI/AI Agent 基础概念.md`
- Delete: `content/AI/Prompt 设计原则.md`
- Delete: `content/工具与环境/GitHub Pages 部署.md`
- Delete: `content/开发/Markdown 知识组织.md`
- Delete: `content/问题排查/静态网站常见问题.md`
- Modify: `content/index.md`

**Interfaces:**

- Consumes: the exact Task 1 candidate version explicitly approved by the user and the Task 2 validator behavior.
- Produces: the six-file formal knowledge tree defined by the architecture spec.

- [ ] **Step 1: Revalidate candidate authorization**

Confirm that the user has seen the complete current candidate and explicitly approved writing it. If any wording, path, deletion, or link changed afterward, return to Task 1 and show the complete adjusted candidate again.

- [ ] **Step 2: Create the two new entry articles**

Use `apply_patch` and copy the approved candidate verbatim into:

```text
content/AI 开发/index.md
content/AI 开发/基础概念/AI 开发核心概念.md
```

- [ ] **Step 3: Move the three Codex articles**

Use `apply_patch` to create the approved new-path versions and delete the old-path versions. The written Markdown must match the approved candidate exactly.

- [ ] **Step 4: Delete the five sample articles**

Delete exactly:

```text
content/AI/AI Agent 基础概念.md
content/AI/Prompt 设计原则.md
content/工具与环境/GitHub Pages 部署.md
content/开发/Markdown 知识组织.md
content/问题排查/静态网站常见问题.md
```

Do not delete any other content file.

- [ ] **Step 5: Update the homepage**

Apply the exact approved `content/index.md` candidate. Preserve `cssclasses: [garden-home]` and the existing garden introduction/closing text.

- [ ] **Step 6: Run focused Prettier**

Run:

```bash
npx prettier --write \
  'content/index.md' \
  'content/AI 开发/**/*.md'
```

Expected: no semantic changes because the candidate was prepared in Prettier-compatible form.

- [ ] **Step 7: Verify file and link boundaries**

Run:

```bash
rg --files content | sort
rg -n 'AI Agent 基础概念|Prompt 设计原则|GitHub Pages 部署|Markdown 知识组织|静态网站常见问题|工具与环境/Codex' content || true
```

Expected: only `content/index.md` and the five Markdown files under `content/AI 开发/` remain; no live links to deleted or old paths.

- [ ] **Step 8: Review checkpoint**

Run:

```bash
git diff --check
git status --short --branch --untracked-files=all
git diff -- content/index.md
```

Also show no-index diffs for every new file and deletion diffs for all removed files. Do not stage or commit.

---

### Task 4: Validate and visually review the knowledge map

**Files:**

- Verify only: `content/index.md`
- Verify only: `content/AI 开发/index.md`
- Verify only: `content/AI 开发/基础概念/AI 开发核心概念.md`
- Verify only: `content/AI 开发/Agent 工程/Codex/*.md`
- Verify only: `scripts/validate-content.mjs`
- Verify only: `scripts/validate-content.test.mjs`

**Interfaces:**

- Consumes: the Task 2 validator and Task 3 knowledge tree.
- Produces: command and browser evidence that the learning path, links, search, and build work.

- [ ] **Step 1: Run automated validation**

Run:

```bash
node --test scripts/validate-content.test.mjs
npm run check:content
npx prettier --check \
  'content/index.md' \
  'content/AI 开发/**/*.md' \
  'scripts/validate-content.mjs' \
  'scripts/validate-content.test.mjs'
npx tsc --noEmit
npm run quartz -- build
git diff --check
```

Expected: all focused commands exit `0`; the Quartz build contains the knowledge map, core concepts page, and three Codex detail pages.

- [ ] **Step 2: Run the repository-wide check and classify baseline failures**

Run:

```bash
npm run check
```

Expected: if non-zero, report each path and distinguish known unrelated Quartz/baseline formatting from files changed by this plan. Do not claim it passed unless exit code is `0`.

- [ ] **Step 3: Start a local Quartz server**

Run with free ports, for example:

```bash
npm run quartz -- build --serve --port 8081 --wsPort 3002
```

Keep the terminal session available for UI review.

- [ ] **Step 4: Browser acceptance checks**

Verify at desktop width and one mobile width:

- homepage links to `AI 开发知识地图`;
- the learning map links to core concepts and all three Codex pages;
- core concepts links to the correct detailed topics;
- each Codex page links back to the knowledge map and core concepts;
- search finds LLM, Agent, MCP, Rule, Skill, Plugin, and Codex;
- deleted sample titles do not appear in search or navigation;
- breadcrumbs and table of contents reflect the new hierarchy;
- no broken-link, console, or page-load errors appear.

- [ ] **Step 5: Final uncommitted review checkpoint**

Run:

```bash
git status --short --branch --untracked-files=all
git diff --check
git rev-parse HEAD
```

Open the rendered knowledge map and the unstaged review in the Codex UI. Report all validation evidence and any known baseline failures. Do not stage, commit, push, or delete the old external knowledge repository.
