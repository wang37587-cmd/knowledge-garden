---
title: Tool 的接口与结果设计
description: 从工具用途、参数约束、执行边界和结果契约出发，设计模型能够正确使用的工具。
tags: [AI, Agent, Tool, MCP]
aliases:
  - Tool 的接口与结果设计
---

> [!abstract] 30 秒掌握
>
> - 工具说明帮助模型选择能力，参数契约帮助程序接受有效输入。
> - 工具应围绕清晰动作设计，读取与写入通常值得分开。
> - Schema 不能证明请求符合业务规则或用户授权，执行端仍需检查。
> - 工具结果应表达数据范围、完整性和错误，避免把候选结果包装成最终结论。
> - LLM 与 Tool 是职责层面的划分；工具内部也可以使用模型。

> [!info] 阅读导航
>
> - 所属主题：行动与编排
> - 前置阅读：[[AI 开发/基础概念/AI 开发核心概念|行动与编排的核心概念]]、[[AI 开发/Agent 工程/Agent 如何运行与停止|Agent 如何运行与停止]]
> - 本文目标：理解一个 Tool 怎样让模型正确选择、调用并解释结果
> - 返回主线：[[AI 开发/Agent 工程/Workflow、单 Agent 与多 Agent|Workflow、单 Agent 与多 Agent]]，然后阅读 [[AI 开发/状态与记忆/状态、记忆与上下文管理|状态、记忆与上下文管理]]
>
> 本文只讨论工具接口；任务怎样循环推进、失败后如何处理，属于 Agent 运行机制。

## 1. 先划清一个工具负责什么

优先用动作命名，例如：

- `list_articles`：列出候选文章。
- `read_article`：读取指定文章。
- `search_articles`：检索候选文章。
- `create_article`：新增文章。
- `update_article`：修改文章。
- `delete_article`：删除文章。

拆分的依据是职责、参数和风险差异，不是机械要求每个工具只能做一个最小动作。若一组步骤总是一起发生，且具有明确业务边界，也可以封装成一个工具。

“读取”和“修改”通常具有不同权限要求，分开有利于模型选择和执行控制。

## 2. 为模型提供足够的使用说明

一个工具至少应让使用者知道：

| 部分     | 应说明什么                           |
| -------- | ------------------------------------ |
| 名称     | 提供什么具体动作                     |
| 描述     | 何时使用、范围是什么、结果代表什么   |
| 输入契约 | 参数用途、类型、必填项、允许值和约束 |
| 输出契约 | 数据结构、完整性、错误及后续可用标识 |
| 执行实现 | 如何校验、授权、执行并返回结果       |

例如，“操作知识库”无法说明能力边界；“列出 content/ 中的 Markdown 候选文件，不读取正文、不修改文件”更容易正确使用。

OpenAI 的 MCP 工具设计文档同样强调名称、描述、输入输出 Schema、安全标记和执行处理函数的职责。参见 [Build an MCP server](https://developers.openai.com/plugins/build/mcp-server)。

## 3. 参数约束怎样减少无效调用

下面是一个 MCP 工具描述示意，展示结构，不包含服务端实现：

```json
{
  "name": "search_articles",
  "description": "在当前知识库中按关键词搜索候选文章，返回结果不代表已完成主题分类。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "minLength": 1,
        "description": "要搜索的关键词"
      },
      "scope": {
        "type": "string",
        "enum": ["title", "content", "all"],
        "description": "匹配标题、正文或两者"
      }
    },
    "required": ["query", "scope"],
    "additionalProperties": false
  }
}
```

这里明确了必填参数、字符串类型和搜索范围，避免模型产生程序不支持的值。

不同工具协议对字段名称和 Schema 的支持可能不同。例如 OpenAI Function Calling 使用 `parameters` 描述函数参数；不能直接把所有 MCP 字段原样传入另一种 API。

## 4. Schema 与安全校验各自负责什么

Schema 可以检查路径参数是不是字符串，但不能仅凭这一点认定路径安全。

执行端仍应检查实际访问目标是否位于允许范围，并考虑相对路径、符号链接等可能改变目标的情况。身份、资源权限和写入范围也需要实际控制。

MCP 中的 `readOnlyHint`、`destructiveHint` 等标记用于描述行为，帮助客户端判断风险；它们不会自动阻止工具修改文件，也不能替代授权检查。参见 [MCP 工具安全标记说明](https://developers.openai.com/plugins/build/mcp-server#tool-annotations-and-elicitation)。

## 5. 结果必须说明自己证明了什么

工具返回“找到 5 篇”过于模糊。它可能只扫描了部分目录，也可能只是命中 5 个关键词匹配结果。

以下是应用自定义的业务结果示例，字段不是 MCP 强制标准：

```json
{
  "status": "partial",
  "scanRoot": "content/",
  "candidates": [
    {
      "path": "content/ai/agent.md",
      "title": "理解 AI Agent"
    }
  ],
  "candidateCount": 1,
  "complete": false,
  "classificationPerformed": false,
  "errors": [
    {
      "path": "content/private/",
      "code": "permission_denied",
      "operation": "list"
    }
  ]
}
```

这个结果表达了：

- 已获得一个候选文件及可继续读取的路径。
- 扫描未完成，返回数量不是整个知识库的数量。
- 工具没有进行主题分类。
- 仍有一个目录无法列出。

对于分页结果，还应说明是否存在下一页。对于写操作，返回实际完成状态、目标标识及必要的验证信息，比只返回“成功”更便于后续判断。

错误应足够具体，但避免泄露密钥或无关敏感信息。需要区分“没有匹配结果”和“搜索没有成功完成”。

## 6. LLM 与 Tool 怎样分工

可程序化的检查通常适合交给代码，例如枚举文件、验证路径和按明确标签计数。

语义模糊的任务通常需要模型或人工判断，例如正文是否以 Agent 为主题、两篇文章是否应该合并。应先明确判断标准，再处理边界案例。

这不是技术上的绝对隔离。工具内部可以调用分类模型，因此可以存在 `classify_article`；它应说明分类标准、所依据的信息和不确定性。

同样，`count_articles_by_topic` 也是合理能力，前提是“主题”如何确定已经有清晰契约，例如按经过维护的 `topic` 标签统计。

LLM 可以生成写入内容，实际文件变化仍需由执行代码完成。模型生成了修改建议，不等于文件已经修改。

## 7. MCP 示例能够证明什么

一个最小 MCP 示例可以验证：客户端能连接服务端、发现工具、传入参数并收到结果。

如果调用参数由测试脚本写死，这验证的是协议连接和工具执行，并不证明模型已经学会自主选用该工具。

要验证模型选择，还需要把工具接入模型运行流程，并观察不同用户目标下的选择、参数和结果解释。

## 相关知识

- [[AI 开发/index|AI 开发知识地图]]
- [[AI 开发/基础概念/AI 开发核心概念|行动与编排的核心概念]]
- [[AI 开发/Agent 工程/Agent 如何运行与停止|Agent 如何运行与停止]]
- [[AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers|Codex Skill、Plugin、MCP 与 Superpowers]]
