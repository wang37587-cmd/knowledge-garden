---
title: Codex Skill、Plugin、MCP 与 Superpowers
description: 区分 Codex 的规则、工作流、外部连接和能力分发机制，并理解它们如何组合。
tags: [Codex, Skill, MCP]
aliases:
  - Codex 扩展机制
  - Skill 与 Plugin
---

> [!abstract] 30 秒掌握
>
> - `AGENTS.md` 保存长期上下文和边界，Skill 描述特定任务的可复用工作流。
> - MCP 把模型连接到外部工具、数据和上下文，而不是通用工作流的主要编写格式。
> - Plugin 是安装和分发容器，可以包含 Skill、MCP server 或两者，并可由 MCP server 提供可选界面。
> - 当前本机的 Superpowers 6.3.0 是以开发流程 Skill 为核心的 Plugin，没有声明 MCP server。
> - Skill 的职责可能重叠；同名 Skill 不会合并，也不要假设项目 Skill 会自动覆盖个人 Skill。

## 四种机制的职责

| 机制        | 核心问题                           | 主要内容                                          | 典型场景                         |
| ----------- | ---------------------------------- | ------------------------------------------------- | -------------------------------- |
| `AGENTS.md` | 当前项目长期遵循什么               | 技术栈、命令、修改边界、验证原则                  | 跨项目规则和项目约束             |
| Skill       | 某类任务应该如何完成               | 指令、参考资料、脚本和资源                        | 功能开发、SQL 修改、排查、提交   |
| Plugin      | 能力如何安装、组合和分发           | Skill、MCP server、可选 UI 和表面特定能力         | 团队分发、目录安装、外部服务集成 |
| MCP         | 模型如何获得外部工具、数据和上下文 | Tool、Resource、Prompt、认证和服务级 Instructions | GitHub、浏览器、Figma、内部系统  |

它们可以组合使用：

```text
AGENTS.md
  定义任务长期遵循的边界

Skill
  描述完成特定任务的步骤

MCP
  提供步骤所需的外部工具、数据和服务能力

Plugin
  安装和分发 Skill、MCP server 或两者
```

## Skill：可复用的工作流

一个 Skill 是包含 `SKILL.md` 的目录，也可以附带脚本、参考资料和资源：

```text
my-skill/
├── SKILL.md
├── scripts/
├── references/
├── assets/
└── agents/
    └── openai.yaml
```

`SKILL.md` 至少需要说明名称和适用范围：

```yaml
---
name: my-skill
description: 说明适用任务、触发条件和排除边界。
---
```

Codex 使用渐进加载：

```text
先读取名称、description 和路径
→ 判断当前任务是否需要
→ 选中后读取完整 SKILL.md
→ 按需读取相关资源
```

这使 Skill 适合保存内容较多、但不是每个任务都需要的流程。

### Skill 如何触发

Skill 有两种基本触发方式：

- 显式触发：用户直接选择或提到 Skill。
- 隐式触发：任务与 Skill 的 `description` 匹配时，由 Codex 选择。

隐式匹配依赖 `description`，因此应写清适用范围和排除条件。职责和触发描述重叠会增加选择歧义与重复步骤的风险。

### Skill 从哪里加载

当前官方文档列出的本地来源包括：

| 作用域                   | 位置                        |
| ------------------------ | --------------------------- |
| 当前目录                 | `$CWD/.agents/skills`       |
| 当前目录到仓库根目录之间 | 各级 `.agents/skills`       |
| 仓库根目录               | `$REPO_ROOT/.agents/skills` |
| 用户                     | `$HOME/.agents/skills`      |
| 管理员                   | `/etc/codex/skills`         |
| 系统                     | Codex 内置 Skill            |

仓库 Skill 只在相应目录或仓库环境中可见；用户 Skill 可以跨仓库复用。

如果两个 Skill 使用相同的 `name`，Codex 不会将它们合并，两者都可能出现在 Skill 选择器中。

> [!warning]
> 官方文档没有定义类似“项目 Skill 自动覆盖个人 Skill”的规则。应通过唯一名称和清晰的 `description` 消除歧义，不要依赖目录自动判优。

## Plugin：能力的安装和分发容器

Plugin 将能力打包成可发现、可安装、可分享和可更新的单元。当前官方架构支持以下基本组合：

- 一个或多个 Skill。
- 一个 MCP server。
- Skill 与 MCP server 的组合。
- MCP server 返回的可选 UI 资源。
- 只在特定产品表面运行的能力，例如 Codex hooks。

Plugin 不需要同时包含所有部分。它可以只提供 Skill，也可以只提供 MCP server，或者将工作流和外部工具组合在一起。

适合使用 Plugin 的情况包括：

- 需要让其他人安装和升级一个或多个 Skill。
- 需要把 Skill 与外部服务能力一起分发。
- 需要通过统一目录管理可发现和可安装的能力。
- 需要统一发布版本，而不是让使用者复制目录。

仍在快速迭代的个人工作流，可以先作为独立 Skill 维护；需要稳定分发时再打包为 Plugin。

## MCP：连接工具和上下文

MCP 是连接 AI 客户端与外部工具和数据的开放规范。在 Codex 中，它可以用于：

- 读取第三方文档或业务数据。
- 调用浏览器、Figma 或开发工具。
- 访问 GitHub、数据库或内部系统。
- 通过服务端认证执行外部操作。

MCP server 可以暴露 Tool、Resource、Prompt 和服务级 Instructions，并定义结构化输入输出、认证方式和可执行操作。

MCP 与 Skill 的职责不同：

```text
Skill
  说明完成任务的步骤、判断标准和验证方式

MCP
  提供任务可以调用的外部工具、数据和服务能力
```

“分析需求、修改代码、运行验证”适合写在 Skill；“查询 GitHub PR、读取设计页面、调用内部 API”适合通过 MCP 提供。

## Superpowers 在当前环境中的定位

本文核对的本机版本是 Superpowers 6.3.0。其 Plugin manifest：

- 通过 `skills: "./skills/"` 提供开发流程 Skill。
- 没有声明 MCP server，`hooks` 当前也是空对象。
- 描述范围包括规划、TDD、调试、协作、代码审查和分支交付流程。

因此，本机安装的这个版本可以理解为以开发方法论和工作流 Skill 为核心的 Plugin，而不是外部数据连接器。

具有代表性的约束包括：

| Skill                            | 本机 6.3.0 中的主要约束                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `using-superpowers`              | 开始处理任务前检查并使用适用 Skill；被派发执行具体任务的 subagent 按该文件的 `SUBAGENT-STOP` 例外处理 |
| `brainstorming`                  | 创意或行为变更实施前先完成设计沟通和确认                                                              |
| `writing-plans`                  | 多步骤实施在修改代码前生成具体计划                                                                    |
| `test-driven-development`        | 功能、缺陷和行为修改先写失败测试，再写生产代码                                                        |
| `systematic-debugging`           | 遇到缺陷或异常行为时先查根因                                                                          |
| `verification-before-completion` | 声称完成或通过前运行最新验证并读取结果                                                                |

这些是本机 6.3.0 Skill 的实际规则，不能推广为所有 Plugin、所有 Codex 环境或未来 Superpowers 版本的固定行为。

## Superpowers 可能产生的工作流冲突

| 个人或项目规则                  | Superpowers 6.3.0                          | 关系                     |
| ------------------------------- | ------------------------------------------ | ------------------------ |
| 代码修改前先展示方案            | `brainstorming` 也要求设计和确认           | 方向一致，但可能重复确认 |
| 普通改动只运行相关测试          | TDD 约束开发顺序，不等于必须运行全量测试   | 可以共存                 |
| 小改动不需要新增测试            | TDD 对功能、缺陷和行为修改要求失败测试先行 | 可能直接冲突             |
| 配置文件不写测试                | TDD 将配置文件列为需要询问用户的例外       | 不能自动假设豁免         |
| 一个个人 Skill 负责完整开发流程 | Superpowers 已包含多个流程 Skill           | 可能产生重复编排         |

出现冲突时，应明确选择哪个 Skill 或 Plugin 作为主流程，不要假设某个目录、Plugin 或 Skill 会自动获得最高优先级。

## 如何选择

| 需求                                      | 首选机制                          |
| ----------------------------------------- | --------------------------------- |
| 所有项目遵循同一修改和验证原则            | 全局 `AGENTS.md`                  |
| 当前仓库有独特技术栈和业务风险            | 项目 `AGENTS.md`                  |
| 某类任务需要一套可重复步骤                | Skill                             |
| 一个或多个 Skill 需要统一安装、升级或分享 | Plugin                            |
| 需要访问外部工具、服务或数据              | MCP                               |
| 需要把工作流和外部连接一起分发            | Plugin 中组合 Skill 与 MCP server |

## 常见误区

### 项目 Skill 会自动覆盖同名个人 Skill

不能这样假设。同名 Skill 不会合并，也没有 AGENTS.md 式的目录覆盖规则。

### Plugin 就是 MCP

不是。MCP server 是 Plugin 可以包含的一种能力；Plugin 还可以包含 Skill 和可选 UI，并承担安装、分享和更新职责。

### MCP 会自动规定完整开发流程

MCP 主要提供工具、数据和服务能力。分析、实施和验证步骤通常更适合写在 Skill 中。

### Superpowers 的行为对所有版本都相同

Plugin 更新可能修改内部 Skill。引用其行为时需要写明核对版本。

### 配置文本等于安全边界

`AGENTS.md`、Skill 和 MCP instructions 都属于行为指令。真实权限仍由沙箱、审批、文件系统和外部服务认证控制。

## 相关知识

- [AI 开发知识地图](../../index.md)
- [AI 开发核心概念](<../../基础概念/AI 开发核心概念.md>)
- [Codex 规则如何生效](<Codex 规则如何生效.md>)
- [多个项目如何复用 Codex 规则](<多个项目如何复用 Codex 规则.md>)

## 参考资料

- [OpenAI Docs：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI Docs：Build plugins](https://learn.chatgpt.com/docs/build-plugins)
- [OpenAI Developers：Plugin architecture](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI Docs：Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp)

本地核对来源：本机 Superpowers 6.3.0 的 Plugin manifest，以及本文列出的六个相关 `SKILL.md`。
