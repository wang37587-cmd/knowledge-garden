---
title: Codex 规则如何生效
description: 理解 AGENTS.md 全局、项目和目录级规则的加载、覆盖与容量边界。
tags: [Codex, AGENTS.md]
aliases:
  - Codex 规则作用域
  - AGENTS.md 覆盖规则
---

> [!abstract] 30 秒掌握
>
> - `$CODEX_HOME/AGENTS.md` 保存跨项目规则，默认位置是 `~/.codex/AGENTS.md`。
> - Codex 从项目根目录向当前工作目录逐层合并规则；越靠近当前目录的冲突规则优先。
> - `AGENTS.override.md` 只替代同一目录中的普通 `AGENTS.md`，不会跳过下层目录规则。
> - `project_doc_max_bytes` 限制合并后的项目指令，默认上限为 32 KiB。
> - `AGENTS.md` 是模型指令，不是权限隔离或不可绕过的安全边界。

## AGENTS.md 解决什么问题

`AGENTS.md` 为 Codex 提供执行任务前需要长期了解的上下文，例如：

- 项目的技术栈、目录结构和常用命令。
- 代码修改、依赖和重构边界。
- 测试范围与风险分级原则。
- 模块特有的业务约束。
- 完成任务时需要报告的内容。

它适合保存相对稳定、经常适用的约束。只在特定任务中使用的详细流程，更适合交给 [Skill](<Codex Skill、Plugin、MCP 与 Superpowers.md>)。

## 规则加载链

Codex 首先读取全局规则，然后从项目根目录沿当前工作目录逐层查找项目规则。

```text
$CODEX_HOME
└── AGENTS.override.md 或 AGENTS.md

项目根目录
├── AGENTS.override.md 或 AGENTS.md
└── 子目录
    ├── AGENTS.override.md 或 AGENTS.md
    └── 当前工作目录
        └── AGENTS.override.md 或 AGENTS.md
```

| 层级         | 典型位置                | 适合保存                             |
| ------------ | ----------------------- | ------------------------------------ |
| 全局         | `$CODEX_HOME/AGENTS.md` | 所有项目通用的修改、风险和验证原则   |
| 项目根目录   | `仓库/AGENTS.md`        | 技术栈、构建命令、项目结构和业务风险 |
| 子目录或模块 | `仓库/模块/AGENTS.md`   | 当前模块特有的规则和上层规则的例外   |

在项目路径的每一层，Codex 依次检查：

```text
AGENTS.override.md
→ AGENTS.md
→ project_doc_fallback_filenames 中配置的备用文件名
```

每个目录最多加入一个规则文件。

## AGENTS.override.md 如何工作

`override` 解决的是同一目录中应该选择哪个文件，而不是提供跨目录的最高优先级。

同一目录同时存在：

```text
AGENTS.override.md
AGENTS.md
```

Codex 选择 `AGENTS.override.md`，不再读取该目录的普通 `AGENTS.md`。

不同目录中的规则仍会进入同一条指令链。例如：

```text
项目根目录/AGENTS.override.md
项目根目录/service/AGENTS.md
```

在 `service/` 中工作时，两份文件都会加载。发生冲突时，更接近当前工作目录的 `service/AGENTS.md` 优先。

## 规则如何合并

Codex 从项目根目录向当前工作目录拼接规则。下层规则不会删除所有上层内容，只在发生冲突时覆盖对应要求。

全局规则：

```markdown
- 普通局部修改不默认运行整个仓库的全量测试。
- 验证范围应与改动风险匹配。
```

项目规则：

```markdown
- 修改数据库结构、并发控制或公共 API 时，必须扩大验证范围。
```

合并后的含义是：

- 普通局部修改仍然使用较小的验证范围。
- 数据库、并发和公共 API 改动属于项目明确声明的例外。
- 没有发生冲突的全局规则继续有效。

> [!tip]
> 下层规则需要改变上层含义时，应明确写出触发条件、覆盖范围和例外，不要依赖模糊措辞。

## 指令容量和拆分策略

Codex 合并项目规则时受到 `project_doc_max_bytes` 限制，默认值为 32 KiB。达到上限后，后续规则可能无法继续加入指令链。

该限制不能理解为每个 `AGENTS.md` 都可以单独写满 32 KiB。

规则较多时，优先采用以下方式拆分：

1. 全局文件只保留所有项目都适用的稳定原则。
2. 项目根文件只写技术栈、命令、结构和项目差异。
3. 模块特有规则放在对应子目录。
4. 复杂且按任务触发的流程改为 Skill。
5. 能由格式化器、静态检查、测试或 CI 强制执行的规则交给工具。

可以提高 `project_doc_max_bytes`，但增加容量不能解决规则重复、冲突和无关上下文过多的问题。

## 常见误区

### 项目规则会整份替换全局规则

不会。不同层级的规则会合并，只有冲突内容由更近的规则优先解释。

### override 可以压过所有子目录

不会。它只替换同一目录的普通文件，下层目录仍然可以添加更具体的规则。

### 任意子目录中的 AGENTS.md 都会加载

不会。Codex 只沿项目根目录到当前工作目录的路径查找。

### 把所有规范写进一个大文件最可靠

规则越长不代表越可靠。过长会增加无关上下文、冲突和截断风险。

### AGENTS.md 可以代替权限控制

不能。文件系统权限、沙箱、审批策略和外部服务授权仍由实际安全机制控制。

## 相关知识

- [AI 开发知识地图](../../index.md)
- [AI 开发核心概念](<../../基础概念/AI 开发核心概念.md>)
- [多个项目如何复用 Codex 规则](<多个项目如何复用 Codex 规则.md>)
- [Codex Skill、Plugin、MCP 与 Superpowers](<Codex Skill、Plugin、MCP 与 Superpowers.md>)

## 参考资料

- [OpenAI Docs：Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
