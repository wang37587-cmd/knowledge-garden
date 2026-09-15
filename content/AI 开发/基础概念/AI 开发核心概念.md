---
title: 行动与编排的核心概念
description: 理解 LLM、Agent、Tool、Harness、Rule、Skill、Plugin 与 MCP 的职责和关系。
tags: [AI, Agent, LLM, MCP]
aliases:
  - AI 开发核心概念
  - AI Agent 核心概念
  - LLM 与 Agent
---

> [!abstract] 30 秒掌握
>
> - LLM 提供理解、生成和推理能力，Agent 把这些能力组织成围绕目标持续行动的系统。
> - Tool 是可调用的具体能力，MCP 是连接外部工具与上下文的开放协议；两者不等同于完整工作流。
> - Harness 负责组织上下文、权限、工具和执行循环，Rule 与 Skill 分别保存长期约束和按任务触发的可复用流程。
> - Plugin 解决扩展能力的打包与分发；Codex 使用 `AGENTS.md`、Skill/Plugin 机制和 MCP 集成来承载其中部分职责。

> [!info] 阅读导航
>
> - 所属主题：行动与编排
> - 前置阅读：[[AI 开发/知识接入/模型知识、知识库与 RAG|模型知识、知识库与 RAG]]
> - 本文目标：建立 Agent、Tool、Harness、Rule、Skill、Plugin 与 MCP 的整体关系
> - 深入阅读：[[AI 开发/Agent 工程/Agent 如何运行与停止|Agent 如何运行与停止]]、[[AI 开发/Agent 工程/Tool 的接口与结果设计|Tool 的接口与结果设计]]
> - 主线下一步：[[AI 开发/Agent 工程/Workflow、单 Agent 与多 Agent|Workflow、单 Agent 与多 Agent]]；第一遍可以暂时跳过实现细节和 Codex 专题。

## 1. 八个概念如何分工

| 概念    | 核心职责                   | 在知识库助手中的位置                 |
| ------- | -------------------------- | ------------------------------------ |
| LLM     | 理解输入、生成内容和判断   | 判断文章主题，组织回答               |
| Agent   | 围绕目标根据反馈推进行动   | 查找资料，必要时补读，再交付结果     |
| Tool    | 提供可调用的具体能力       | 列文件、读文章、保存修改             |
| Harness | 组织上下文、工具和执行循环 | 执行工具请求、回传结果、控制运行限制 |
| Rule    | 保存长期约束和约定         | 文章标题不带序号、不自动提交         |
| Skill   | 保存特定任务的可复用方法   | 怎样整理知识、去重与校验             |
| Plugin  | 打包和分发扩展能力         | 将一组 Skill 或连接能力供他人安装    |
| MCP     | 标准化连接工具和上下文     | 通过服务端接入外部资料或操作         |

这些是职责而不是八个必须独立部署的服务。Harness 指运行与编排的程序层，具体实现因产品而异；Rule、Skill、Plugin 的命名和支持形式也不完全统一。

## 2. 从用户意图到结果的执行链

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
Tool（本地函数或经 MCP 等方式接入的能力）
  读取信息、执行操作并返回结果
    ↓
Harness 与 LLM
  Harness 接入结果并检查运行限制，LLM 根据反馈判断下一步
    ↓
最终结果与验证证据
```

模型并不会因为收到一个目标就自动拥有文件、浏览器、数据库或外部服务权限。Agent/Harness 必须把可用上下文和能力提供给模型，并在每次工具返回后决定如何继续。清晰表达用户意图能减少歧义，但不能替代真实权限、工具结果和验证。

## 3. 能力、编排、约束与分发

| 维度 | 解决的问题                                     | 主要概念                 |
| ---- | ---------------------------------------------- | ------------------------ |
| 能力 | 系统能思考什么、能执行什么                     | LLM、Tool                |
| 连接 | 外部工具、数据和上下文如何接入                 | MCP                      |
| 编排 | 目标、上下文、步骤和执行循环如何组织           | Agent、Harness、Skill    |
| 约束 | 哪些规则长期有效，哪些操作被允许，结果如何验收 | Rule、权限、测试、校验器 |
| 分发 | 一组能力如何被安装、分享和升级                 | Plugin                   |

同一个实现可能跨越多个维度。例如，一个产品扩展包可以同时承载工作流定义和外部连接能力；具体由哪些组件组成取决于产品。运行时仍由 Harness 组织能力，Rule 约束具体项目中的行为。

## 4. 通用概念与 Codex 实现

Codex 是这些概念的一种产品组合：用 `AGENTS.md` 承载项目指令，用 `SKILL.md` 组织特定任务方法，通过 Plugin 分发扩展，并可接入 MCP 服务。具体加载规则与版本行为集中维护在 Codex 专题，第一遍无需记忆文件路径和配置项。

MCP 的通用架构包括宿主应用（Host）、与服务端建立连接的客户端（Client）和提供能力的服务端（Server）。协议还可以提供工具之外的资料资源和提示模板。具体角色可对照 [MCP 官方架构说明](https://modelcontextprotocol.io/docs/learn/architecture)。

> [!important]
> `AGENTS.md`、Skill 和 MCP server instructions 都会影响模型行为，但真实权限仍由沙箱、审批策略、文件系统和外部服务认证控制。

## 5. 常见误区

### 5.1 LLM 就是 Agent

LLM 是能力基础，Agent 是围绕目标组织模型、工具、状态和执行循环的软件系统。一次模型生成可以是 Agent 的一个步骤，但不是完整 Agent。

固定步骤也可以多次调用模型，但不因此自动变成自主 Agent。区别和组合方式见 [[AI 开发/Agent 工程/Workflow、单 Agent 与多 Agent|Workflow、单 Agent 与多 Agent]]。

### 5.2 Tool 和 MCP 是同一个层级的东西

Tool 是可调用能力；MCP 是客户端与外部工具、数据和上下文之间的连接协议。MCP server 可以暴露多个 Tool，也可以提供 Resource、Prompt 和服务级 Instructions。

### 5.3 Skill 会自动提供外部权限

Skill 主要提供可复用指令、步骤和资源。需要读取实时数据或执行外部操作时，仍然依赖 Harness 已有工具或 MCP 等连接能力及其真实授权。

### 5.4 Plugin 就是更大的 Skill

Plugin 的关键职责是打包与分发扩展能力。它可以承载一种或多种能力，但具体组件由产品生态定义；Skill 则专注工作流，二者不应只按“大小”区分。

### 5.5 Rule 写得越多，Agent 越可靠

规则过长会增加无关上下文、冲突和截断风险。稳定约束适合 Rule，按任务触发的多步方法适合 Skill，可自动判断的要求应交给测试、格式化器、静态检查或 CI。

## 相关知识

- [[AI 开发/index|AI 开发知识地图]]
- [[AI 开发/Agent 工程/Agent 如何运行与停止|Agent 如何运行与停止]]
- [[AI 开发/Agent 工程/Tool 的接口与结果设计|Tool 的接口与结果设计]]
- [[AI 开发/Agent 工程/Codex/Codex 规则如何生效|Codex 规则如何生效]]
- [[AI 开发/Agent 工程/Codex/多个项目如何复用 Codex 规则|多个项目如何复用 Codex 规则]]
- [[AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers|Codex Skill、Plugin、MCP 与 Superpowers]]

## 参考资料

- [OpenAI Docs：Build skills](https://learn.chatgpt.com/docs/build-skills)
- [OpenAI Developers：Plugin architecture](https://developers.openai.com/plugins/concepts/plugins)
- [OpenAI Docs：Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp)
