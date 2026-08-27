---
title: GitHub Pages 部署
tags: [GitHub, 部署]
---

# GitHub Pages 部署

GitHub Pages 可以托管静态网站。通常由 GitHub Actions 在提交后运行构建，再将生成文件发布为站点。

## 基本流程

1. Markdown 内容提交到仓库。
2. Quartz 构建静态页面。
3. GitHub Actions 发布构建产物。

内容组织方式可参考 [Markdown 知识组织](<../开发/Markdown 知识组织.md>)。遇到构建或路径问题时查看 [静态网站常见问题](<../问题排查/静态网站常见问题.md>)。
