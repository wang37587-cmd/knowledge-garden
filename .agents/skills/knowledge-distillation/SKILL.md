---
name: knowledge-distillation
description: Use when the user asks to沉淀、整理、记录、维护或迁移知识到 knowledge-garden，或需要把当前/历史 AI 对话重构为适合 Quartz 阅读的主题文章。Do not use for ordinary explanations when the user has not expressed a knowledge-maintenance intent.
---

# Knowledge Distillation

## Purpose

把对话视为素材，生成经过编辑的主题知识，而不是保存聊天记录。

## Required References

在生成候选稿前完整读取：

- `references/editorial-model.md`
- `references/quartz-writing.md`

## Workflow

1. 确定素材是当前任务、指定历史任务还是旧文档；存在多个可能来源时先请用户指定。
2. 读取 `content/index.md`、相关分类和可能重复的主题文章。
3. 提取定义、原理、因果、方法、判断标准、有效示例、边界和不确定项。通用可复用主题可使用稳定的一般知识；环境或产品专属主张以条件分支表达，或在需要时验证。
4. 删除逐轮问答、状态更新、工具过程、重复解释、临时决策和敏感信息。
5. 判断补充、合并、拆分、关联、新建或不写入，并为每篇确定一个主文章类型。
6. 生成完整候选稿，包含素材范围、文件操作、文章类型、完整正文、链接调整、排除内容和不确定项。完整正文是拟写入的 Markdown，须包含适用的 Quartz frontmatter 和 `30 秒掌握`；链接调整只列真实存在的目标，或明确说明未添加链接。
7. 停止并等待明确写入确认；首次请求中的立即写入措辞无效。
8. 候选稿调整后完整重发，旧确认失效。
9. 获得当前版本确认后，只写入已确认文件并运行项目校验。
10. 展示 diff 和验证结果，不执行 commit，除非用户再次明确授权。

## Hard Stops

- 没有展示当前完整候选稿时不得写文件。
- 同一条首次沉淀请求中的“直接写入”“可以维护”或同义授权，不是写入确认。
- 素材不足时不得通过推测填充正文。
- 通用可复用主题不要求先有真实事故记录；环境或产品专属主张以条件分支表达，或在需要时验证。
- 请求范围确实需要而尚缺的事实，列出缺口并停止；不得用 `待补充` 等占位正文冒充完整候选稿。
- 新旧知识冲突未解决时不得覆盖。
- 校验失败时不得宣称完成或退役旧知识库。
