---
name: knowledge-distillation
description: Use when the user asks to沉淀、整理、记录、维护或迁移知识到 knowledge-garden，或需要把当前/历史 AI 对话重构为适合 Quartz 阅读的主题文章。Do not use for ordinary explanations when the user has not expressed a knowledge-maintenance intent.
---

# Knowledge Distillation

## Purpose

把对话视为素材，直接整理为 `content/` 中经过编辑的主题知识，而不是保存聊天记录。默认写入后交给用户 review，由用户自行提交。

## Required References

在整理知识前完整读取：

- `references/editorial-model.md`
- `references/quartz-writing.md`

## Workflow

1. 根据用户请求和对话确定素材是当前任务、指定历史任务还是旧文档；只有来源或范围存在实质歧义时才询问。
2. 读取 `content/index.md`、相关分类和可能重复的主题文章。
3. 提取定义、原理、因果、方法、判断标准、有效示例、边界和不确定项。通用可复用主题可使用稳定的一般知识；环境或产品专属主张以条件分支表达，或在需要时验证。
4. 删除逐轮问答、状态更新、工具过程、重复解释、临时决策和敏感信息。
5. 判断补充、合并、拆分、关联、新建或不写入，并为每篇确定一个主文章类型；同时判断图解是否能明显改善理解，不把图示作为固定要求。
6. 用户请求沉淀即授权直接写入任务范围内的知识文件及必要导航。正文须包含适用的 Quartz frontmatter；普通主题包含 `30 秒掌握`，目录型入口按写作规范保持简洁。同批新增主题先创建文件，再补充指向它们的链接；不链接尚未建立的未来主题。
7. 写入后依次运行 `npm run check:content`、`npm run check`、`npm run quartz -- build`。修正任务范围内的问题并重新运行受影响的校验；无关失败应如实说明。
8. 展示实际 diff 和验证结果，包括新增文件的完整差异，简述素材范围、文件操作、主类型、主题与链接关系，以及必要的排除内容和不确定项。
9. 用户 review 后要求调整时，在原范围内直接修改、校验并重新展示 diff，不重复索要写入确认。
10. 保留工作区改动，不执行 `git add`、`git commit` 或 `git push`，由用户 review 后自行提交。

## Candidate-Only Requests

只有用户明确要求“仅出候选稿”“先给方案”或“不要修改文件”时才暂停在候选稿阶段。候选稿应包含素材范围、文件操作、主类型、完整正文、链接调整、排除内容和不确定项；后续用户要求写入时直接执行，不额外增加确认轮次。

## Hard Stops

- 普通概念讲解不构成知识写入请求；用户明确要求只读或仅候选稿时不得修改文件。
- 素材不足时不得通过推测填充正文。
- 通用可复用主题不要求先有真实事故记录；环境或产品专属主张以条件分支表达，或在需要时验证。
- 请求范围确实需要而尚缺的事实，列出缺口并停止；不得用 `待补充` 等占位正文冒充完整候选稿。
- 新旧知识冲突未解决时不得覆盖。
- 校验失败时不得宣称完成或退役旧知识库。
