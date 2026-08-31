# Quartz Writing Rules

## Frontmatter

普通主题必须包含非空 `title`、`description` 和字符串数组 `tags`。`aliases` 可选，但出现时必须是字符串数组。首页 `content/index.md` 只强制 `title`。

## Structure

主题正文以 `> [!abstract] 30 秒掌握` 开始。正文标题由文章主类型决定；不创建空章节，不重复 frontmatter 标题作为一级标题。

## Visual Grammar

- 对比信息优先使用表格。
- 三个以上对象的关系或多步流转才使用 Mermaid。
- 核心结论、提示、风险和示例使用合适的 Callout。
- 命令、代码和配置使用标注语言的代码块。
- 不为了装饰堆叠 Callout、图表或标签。

## Links

只链接真实存在的主题或资源。Wikilink 用于主题关系；Markdown 链接用于需要明确相对路径或外部来源的场景。链接必须表达真实语义关系，不为了图谱密度机械互链。

## Naming

标题表达知识问题，不使用对话日期、任务编号、“对话总结”或“学习记录”。中文主题使用中文文件名，AGENTS.md、Skill、Plugin、MCP、Harness 等专有术语保留原名。
