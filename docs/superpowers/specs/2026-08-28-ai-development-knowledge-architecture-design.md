# AI 开发知识架构设计

## 背景

当前知识库已经写入三篇 Codex 专题，但首页和目录直接从“AI”跳到具体产品规则，缺少从通用概念到具体实践的学习入口。`content/工具与环境/Codex/` 同时承载通用扩展概念、Codex 产品机制和本机 Superpowers 示例，也容易让读者把平台特性误认为通用 AI 概念。

另外，现有五篇早期文章属于 Quartz 示例或占位内容，用户已明确要求全部删除，不作为正式知识继续维护。

## 目标

- 以学习路径组织知识，而不是以对话、任务或单一产品组织知识。
- 建立一个能解释 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 和 MCP 关系的概念入口。
- 让读者可以从概念总览下钻到 Codex 规则加载、跨项目规则复用和扩展机制等详细专题。
- 将 Codex 保留为 Agent 工程中的具体工具，而不是顶层知识分类。
- 删除全部示例文章，首页只指向真实维护的知识内容。
- 所有正式知识继续只维护在 Quartz `content/` 中。

## 非目标

- 本轮不为 LLM、RAG、记忆、评估或安全分别创建内容不足的独立文章。
- 本轮不把所有 AI 开发概念一次性写全。
- 本轮不修改 Quartz 页面布局、主题、组件或视觉样式。
- 本轮不退役旧知识库，也不执行 commit 或 push。

## 目标目录

```text
content/
├── index.md
└── AI 开发/
    ├── index.md
    ├── 基础概念/
    │   └── AI 开发核心概念.md
    └── Agent 工程/
        └── Codex/
            ├── Codex 规则如何生效.md
            ├── 多个项目如何复用 Codex 规则.md
            └── Codex Skill、Plugin、MCP 与 Superpowers.md
```

目录层级表达以下关系：

```text
AI 开发
├── 基础概念：理解系统由什么组成
└── Agent 工程：理解这些组成部分如何落地为可运行系统
    └── Codex：一种具体的 Agent 工程实践环境
```

## 文章职责

### `content/AI 开发/index.md`

- 标题：`AI 开发知识地图`
- 主类型：学习路径。
- 介绍知识库对 AI 开发的分层方式。
- 提供推荐阅读顺序和主题入口。
- 对核心概念只做一句话提示，不重复详细定义。
- 链接到核心概念文章和三篇 Codex 专题。

### `content/AI 开发/基础概念/AI 开发核心概念.md`

- 主类型：概念解释。
- 解释 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 和 MCP。
- 使用一张关系表和一个执行链说明这些概念如何组合。
- 明确区分通用 Agent 工程概念与 Codex 产品实现。
- “规则”“Skill、Plugin、MCP”等概念链接到相应 Codex 详细专题。
- 不在本文展开 Codex 文件路径、加载优先级或 Superpowers 版本行为。

### 三篇 Codex 专题

- 保留现有主题边界和主体内容。
- 移动到 `content/AI 开发/Agent 工程/Codex/`。
- 更新相对链接，增加返回知识地图和核心概念的路径。
- 通过修复校验器消除当前父标题误判，不为通过检查增加无意义的填充正文。
- 运行 Prettier 后形成新的完整候选版本，再等待写入授权。

## 文件操作

### 新建

- `content/AI 开发/index.md`
- `content/AI 开发/基础概念/AI 开发核心概念.md`

### 移动并调整链接

- `content/工具与环境/Codex/Codex 规则如何生效.md`
  → `content/AI 开发/Agent 工程/Codex/Codex 规则如何生效.md`
- `content/工具与环境/Codex/多个项目如何复用 Codex 规则.md`
  → `content/AI 开发/Agent 工程/Codex/多个项目如何复用 Codex 规则.md`
- `content/工具与环境/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md`
  → `content/AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md`

### 删除

- `content/AI/AI Agent 基础概念.md`
- `content/AI/Prompt 设计原则.md`
- `content/工具与环境/GitHub Pages 部署.md`
- `content/开发/Markdown 知识组织.md`
- `content/问题排查/静态网站常见问题.md`

这些文件是用户明确要求清除的示例文章。删除后不创建重定向或保留兼容副本；其中值得保留的通用概念将根据新的文章边界重新编写，而不是复制旧正文。

### 修改

- `content/index.md`
- `scripts/validate-content.mjs`
- `scripts/validate-content.test.mjs`

## 首页设计

首页的“探索主题”以 `AI 开发知识地图` 为主要知识入口，不再列出已删除的示例分类。首页保留数字花园的简短说明，但最近整理只展示实际存在的 AI 开发主题。

首页不承担完整目录职责。主题层级、推荐顺序和概念关系统一维护在 `content/AI 开发/index.md` 中。

## 链接模型

```text
content/index.md
    ↓
AI 开发知识地图
    ↓
AI 开发核心概念
    ├── 规则 → Codex 规则如何生效
    ├── 规则复用 → 多个项目如何复用 Codex 规则
    └── Skill / Plugin / MCP → Codex Skill、Plugin、MCP 与 Superpowers
```

三篇 Codex 专题继续互相链接，并共同链接回核心概念和知识地图。不会为了增加图谱连接而创建无语义的互链。

## 内容边界

核心概念文章使用以下归纳边界：

| 概念    | 本文解释范围                               | 不在本文展开的内容           |
| ------- | ------------------------------------------ | ---------------------------- |
| LLM     | 理解、生成和推理能力的模型基础             | 模型训练、架构和推理参数细节 |
| Agent   | 围绕目标反复观察、决策和行动的系统         | 特定 Agent 框架 API          |
| Tool    | Agent 可以调用的具体能力                   | 各工具的安装配置             |
| Harness | 组织上下文、权限、工具和执行循环的运行环境 | Codex 内部未公开实现         |
| Rule    | 长期适用的约束和项目上下文                 | `AGENTS.md` 发现链细节       |
| Skill   | 特定任务的可复用工作流                     | Skill 文件结构的完整教程     |
| Plugin  | 能力的安装、组合和分发容器                 | 市场发布和插件开发流程       |
| MCP     | 连接外部工具与上下文的协议                 | MCP server 开发实现          |

产品专属结论必须明确标注为 Codex 或当前本机环境事实，不能写成通用 AI Agent 规则。

## 内容校验器修复

当前 `validateStructure` 把“父标题后直接进入具有正文的子标题”误判为 `structure.section.empty`。

修复后的判定规则：

- 下一个非空标题与当前标题同级或更高，当前章节判为空。
- 下一个非空标题层级更深，表示当前章节拥有子结构，不判为空。
- 文件结束前仍没有正文或子结构，判为空。
- 增加回归测试覆盖 `H2 → H3 → 正文` 的合法结构。

该修复只调整结构判断，不改变 frontmatter、链接或身份校验接口。

## 候选稿和写入边界

设计规格获得 review 后，下一阶段先输出完整候选稿，包括：

1. 两篇新文章的完整正文。
2. 三篇移动后文章的完整正文和新链接。
3. 首页完整拟修改片段。
4. 五篇删除文件的清单和删除理由。
5. 校验器测试调整方案。

候选稿在展示前先按 Prettier 目标格式整理。用户确认当前完整候选版本后，才能移动、创建、修改或删除正式 `content/` 文件。

## 验证

实施后至少运行：

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

另外进行浏览器检查：

- 首页入口可达。
- 知识地图的阅读路径和链接正确。
- 核心概念文章可下钻到三篇 Codex 专题。
- 搜索、目录、反向链接和移动页面路径正常。
- 已删除示例文档不再出现在首页、搜索或构建产物中。

## 风险与回滚

- 移动文章会改变 Quartz URL；当前内容尚未正式发布或提交，本轮不增加兼容重定向。
- 删除五篇示例文件属于用户明确授权范围；写入前仍会在完整候选稿中再次列出。
- 所有改动保持未提交，用户可以在 UI 和 Git diff 中 review。
- 不执行 commit 或 push。需要回滚时，通过未提交 diff 恢复到本轮修改前状态。
