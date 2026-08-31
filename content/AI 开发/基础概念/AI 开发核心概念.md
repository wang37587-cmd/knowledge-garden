---
title: AI 开发核心概念
description: 理解 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 与 MCP 的职责和关系。
tags: [AI, Agent, LLM, MCP]
aliases:
  - AI Agent 核心概念
  - LLM 与 Agent
---

> [!abstract] 30 秒掌握
>
> - LLM 提供理解、生成和推理能力，Agent 把这些能力组织成围绕目标持续行动的系统。
> - Tool 是可调用的具体能力，MCP 是连接外部工具与上下文的开放协议；两者不等同于完整工作流。
> - Harness 负责组织上下文、权限、工具和执行循环，Rule 与 Skill 分别保存长期约束和按任务触发的可复用流程。
> - Plugin 解决扩展能力的打包与分发；Codex 使用 `AGENTS.md`、Skill/Plugin 机制和 MCP 集成来承载其中部分职责。

## 八个概念如何分工

| 概念    | 核心职责                                               | 典型输入与输出                                         | 不应混同为                         |
| ------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------- |
| LLM     | 理解文本与多模态输入，生成内容并进行推理               | 输入上下文，输出候选判断、计划或内容                   | 能独立执行现实操作的完整 Agent     |
| Agent   | 围绕目标反复观察、决策、行动并处理结果                 | 输入目标和环境状态，输出行动及最终结果                 | 单次模型调用或固定脚本             |
| Tool    | 提供一个可调用的具体能力                               | 接收结构化参数，返回数据或操作结果                     | 工作流、权限策略或模型本身         |
| Harness | 组织上下文、模型、权限、工具和执行循环                 | 接收用户意图与配置，驱动模型和工具协作                 | 某个公开且固定的内部实现细节       |
| Rule    | 保存长期适用的约束、约定和项目上下文                   | 在执行前加入边界，影响后续判断和行动                   | 文件系统权限或不可绕过的安全机制   |
| Skill   | 描述特定任务的可复用工作流                             | 提供触发条件、步骤、参考资料、脚本和验收方式           | 外部服务连接协议                   |
| Plugin  | 将扩展能力及其元数据打包成可安装、可分享、可更新的单元 | 接收能力定义与描述、版本等元数据，输出可安装的分发单元 | 单个 Tool、工作流或连接协议        |
| MCP     | 以开放协议连接模型客户端与外部工具、数据和上下文       | 暴露 Tool、Resource、Prompt 或服务级 Instructions      | 自动完成分析、实施和验证的完整流程 |

## 从用户意图到结果的执行链

```text
用户意图
  明确目标、必要上下文、约束、输入、输出与验收标准
    ↓
Agent / Harness
  组织规则、上下文、权限、可用 Skill 与工具
    ↓
LLM
  理解当前状态并选择下一步
    ↓
Tool 或 MCP 提供的外部能力
  读取信息、执行操作并返回结果
    ↓
Agent / Harness
  将结果加入上下文，判断继续行动、修正方案或结束
    ↓
最终结果与验证证据
```

模型并不会因为收到一个目标就自动拥有文件、浏览器、数据库或外部服务权限。Agent/Harness 必须把可用上下文和能力提供给模型，并在每次工具返回后决定如何继续。清晰表达用户意图能减少歧义，但不能替代真实权限、工具结果和验证。

## 能力、编排、约束与分发

| 维度 | 解决的问题                                     | 主要概念                 |
| ---- | ---------------------------------------------- | ------------------------ |
| 能力 | 系统能思考什么、能执行什么                     | LLM、Tool                |
| 连接 | 外部工具、数据和上下文如何接入                 | MCP                      |
| 编排 | 目标、上下文、步骤和执行循环如何组织           | Agent、Harness、Skill    |
| 约束 | 哪些规则长期有效，哪些操作被允许，结果如何验收 | Rule、权限、测试、校验器 |
| 分发 | 一组能力如何被安装、分享和升级                 | Plugin                   |

同一个实现可能跨越多个维度。例如，一个产品扩展包可以同时承载工作流定义和外部连接能力；具体由哪些组件组成取决于产品。运行时仍由 Harness 组织能力，Rule 约束具体项目中的行为。

## 通用概念与 Codex 实现

| 通用概念        | Codex 中的具体实现或表现                               | 边界                                                                                                                                   |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Agent / Harness | Codex 接收任务、组织上下文、调用工具并返回可审查结果   | 不把未公开的内部架构写成确定事实                                                                                                       |
| Rule            | `AGENTS.md`、`AGENTS.override.md` 及其他项目指令       | 具体发现链见 [Codex 规则如何生效](<../Agent 工程/Codex/Codex 规则如何生效.md>)                                                         |
| Skill           | 以 `SKILL.md` 为核心、可附带脚本和参考资料的任务工作流 | 加载位置、触发和本机流程见 [Codex Skill、Plugin、MCP 与 Superpowers](<../Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md>) |
| Plugin          | 可安装、分享和更新的能力包，可组合 Skill 与 MCP server | 具体组成以当前官方文档和 manifest 为准                                                                                                 |
| MCP             | Codex 连接本地或远程 MCP server 的机制                 | MCP 提供能力，不自动规定完整开发流程                                                                                                   |
| 多项目复用      | 全局与项目 `AGENTS.md`、用户与仓库 Skill 的分层        | 实践方法见 [多个项目如何复用 Codex 规则](<../Agent 工程/Codex/多个项目如何复用 Codex 规则.md>)                                         |

> [!important]
> `AGENTS.md`、Skill 和 MCP server instructions 都会影响模型行为，但真实权限仍由沙箱、审批策略、文件系统和外部服务认证控制。

## 常见误区

### LLM 就是 Agent

LLM 是能力基础，Agent 是围绕目标组织模型、工具、状态和执行循环的软件系统。一次模型生成可以是 Agent 的一个步骤，但不是完整 Agent。

### Tool 和 MCP 是同一个层级的东西

Tool 是可调用能力；MCP 是客户端与外部工具、数据和上下文之间的连接协议。MCP server 可以暴露多个 Tool，也可以提供 Resource、Prompt 和服务级 Instructions。

### Skill 会自动提供外部权限

Skill 主要提供可复用指令、步骤和资源。需要读取实时数据或执行外部操作时，仍然依赖 Harness 已有工具或 MCP 等连接能力及其真实授权。

### Plugin 就是更大的 Skill

Plugin 的关键职责是打包与分发扩展能力。它可以承载一种或多种能力，但具体组件由产品生态定义；Skill 则专注工作流，二者不应只按“大小”区分。

### Rule 写得越多，Agent 越可靠

规则过长会增加无关上下文、冲突和截断风险。稳定约束适合 Rule，按任务触发的多步方法适合 Skill，可自动判断的要求应交给测试、格式化器、静态检查或 CI。

## 相关知识

- [AI 开发知识地图](../index.md)
- [Codex 规则如何生效](<../Agent 工程/Codex/Codex 规则如何生效.md>)
- [多个项目如何复用 Codex 规则](<../Agent 工程/Codex/多个项目如何复用 Codex 规则.md>)
- [Codex Skill、Plugin、MCP 与 Superpowers](<../Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers.md>)

## 参考资料

- [OpenAI Docs：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI Developers：Plugin architecture](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI Docs：Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp)
