---
title: Node.js、npm 与 npx
description: 从 JavaScript 的运行环境出发，理解 Node.js、npm、npx 的分工，以及依赖文件、项目任务和常见命令。
tags: [JavaScript, Node.js, npm, 开发工具]
---

> [!abstract] 30 秒掌握
>
> - **Node.js 提供了在浏览器之外运行 JavaScript 的环境。**
> - **npm 帮你安装和管理项目依赖的代码包。** 也能通过 `npm run` 执行项目定义的任务。
> - **npx 帮你调用代码包提供的命令。** 项目缺少所需包时，可以下载到 npm 缓存后执行，不代表完全不安装。
> - `package.json` 声明项目配置与依赖，`package-lock.json` 锁定具体依赖树，`node_modules` 存放安装后的依赖。
> - 读命令时区分运行代码、安装依赖、调用工具和执行项目任务，不能只看工具名字猜行为。

所属主题：[[软件开发/index|软件开发知识地图]]。本文聚焦 JavaScript 工具链的基本分工，示例命令用于解释行为，实际执行前应确认所在目录和项目配置。

## 1. JavaScript 为什么需要 Node.js

JavaScript 是编程语言。代码保存成文件后仍然只是文本，需要运行环境读取并执行。

例如，把下面的代码保存为 `hello.js`：

```javascript
const name = "小王"
console.log(`你好，${name}`)
```

在该文件所在目录执行：

```bash
node hello.js
```

Node.js 会运行文件中的代码，输出 `你好，小王`。其中 `node` 是启动 Node.js 的命令，`hello.js` 是要执行的文件。Node.js 名称中的 `.js` 不意味着命令要写成 `node.js`。

浏览器内置 JavaScript 引擎，能够执行网页中的交互逻辑。Node.js 使用 V8 引擎，并提供文件、网络、进程等能力，让 JavaScript 可以用于服务器、命令行工具和自动化脚本。[Node.js 官方介绍](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)

| 能力                     | 浏览器                | Node.js                        |
| ------------------------ | --------------------- | ------------------------------ |
| 执行普通 JavaScript 逻辑 | 支持                  | 支持                           |
| 操作网页按钮、文字       | 使用 DOM 等浏览器 API | 默认没有网页 DOM               |
| 访问本机文件             | 受浏览器权限机制限制  | 可在进程权限内使用文件系统 API |
| 运行后端服务、构建工具   | 通常不承担这类工作    | 常见用途                       |

语言相同，不代表环境提供的 API 完全相同。依赖 `document` 的网页代码不能直接假定能在 Node.js 中运行，使用 Node.js 文件系统模块的代码也不能直接放进普通网页。[浏览器与 Node.js 的区别](https://nodejs.org/en/learn/getting-started/differences-between-nodejs-and-the-browser)

## 2. npm 为什么要管理包

实际项目通常需要日期处理、Markdown 解析、图片压缩或代码格式检查等功能。开发者可以把可复用的代码整理成 package，中文通常叫“包”。项目需要某个包来完成工作，这个包就是项目的依赖；包自身需要的其他包则构成间接依赖。

npm 帮助获取这些包、处理依赖关系和管理版本。“npm”也可以指相关平台，具体包含三个部分：

| 部分         | 作用                          |
| ------------ | ----------------------------- |
| npm 网站     | 查找包、阅读说明、管理账号    |
| npm registry | 保存与分发包的仓库服务        |
| npm CLI      | 在终端使用的 `npm` 命令行工具 |

日常说“运行 npm”通常指命令行工具。包既可以是供代码导入的库，也可以提供独立命令；不是每个包都有命令行入口。[npm 官方介绍](https://docs.npmjs.com/about-npm/)

| 命令                  | 主要作用                               |
| --------------------- | -------------------------------------- |
| `npm install`         | 按当前项目的依赖声明和锁文件安装依赖   |
| `npm install 包名`    | 添加包，默认记录到 `dependencies`      |
| `npm install -D 包名` | 添加开发依赖，记录到 `devDependencies` |
| `npm install -g 包名` | 安装到当前 npm 环境的全局位置          |
| `npm uninstall 包名`  | 移除包                                 |

`npm i` 是 `npm install` 的简写，`-D` 是 `--save-dev` 的简写。例如，给项目添加代码格式化工具 Prettier：

```bash
npm install -D prettier
```

开发依赖是用途分类，不代表只能在开发者电脑上运行。构建服务器也可能需要它。全局安装则不等于写入每个项目的依赖，也不保证其他 Node.js 安装环境共享同一工具。[npm install 文档](https://docs.npmjs.com/cli/v11/commands/npm-install/)

## 3. 项目中的三个依赖文件与目录

使用 npm 的普通项目常见以下结构：

```text
项目目录/
├── package.json
├── package-lock.json
├── node_modules/
└── 自己的代码
```

| 文件或目录          | 回答的问题                           |
| ------------------- | ------------------------------------ |
| `package.json`      | 项目是什么，需要哪些包，有哪些任务？ |
| `package-lock.json` | 具体解析到了哪些版本及依赖关系？     |
| `node_modules/`     | 安装后的依赖代码在哪里？             |

下面是一个简化的 `package.json`：

```json
{
  "name": "my-project",
  "scripts": {
    "check": "prettier . --check"
  },
  "devDependencies": {
    "prettier": "^3.8.1"
  }
}
```

它声明项目有一个 `check` 任务，并依赖 Prettier。`^3.8.1` 是版本范围：对这个例子中的稳定版本，允许大于等于 `3.8.1`、小于 `4.0.0` 的版本；不要把这一规则直接套到主版本为 `0` 的所有包上。[package.json 文档](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)

锁文件进一步记录具体版本和依赖树，帮助不同环境重复安装一致的依赖。当锁定版本满足声明范围时，`npm install` 使用锁文件中的版本；声明与锁文件不匹配时，可能重新解析并更新锁文件。因此，存在锁文件不等于所有安装操作都不会改变版本。[锁文件文档](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/)、[安装与锁文件的关系](https://docs.npmjs.com/cli/v11/commands/npm-install/)

## 4. npm run 如何执行项目任务

对于上一节的配置，执行：

```bash
npm run check
```

npm 会读取 `scripts.check`，执行 `prettier . --check`。其中 `.` 表示当前目录，`--check` 表示检查格式，而不是写回格式化结果。

`check`、`dev`、`build` 等是项目定义的任务名。同名任务在不同项目里可能做完全不同的事，具体行为必须看 `package.json`。

运行任务时，npm 会把项目的 `node_modules/.bin` 加入命令查找路径。因此，即使在普通终端直接输入 `prettier` 提示找不到命令，通过项目任务仍可能找到本地安装的 Prettier。任务内容也不限于 JavaScript，可以调用其他程序或组合多个命令。[npm scripts 文档](https://docs.npmjs.com/cli/v11/using-npm/scripts/)

## 5. npx 如何调用工具

如果想直接运行包提供的命令，可以使用：

```bash
npx prettier --version
```

对于这种没有显式指定包版本的常见用法，项目里已安装的版本可以被直接使用；缺少所需包时，npx 可以把包安装到 npm 缓存中的目录，再执行命令。在普通交互式终端里，需要安装时通常会先询问。

> [!note] npx 不等于“不安装”
>
> 它让调用者不必先手动全局安装工具，但仍可能下载并缓存包。缓存也不一定在执行结束后删除。执行 npx 本身通常不会把工具登记为项目依赖，但被调用的工具可以创建或修改文件。

现代 npx 随 npm 提供，基于 `npm exec` 实现。下面两条简单命令用途相同，但更复杂用法需要注意参数解析差异：

```bash
npx prettier --version
npm exec -- prettier --version
```

npx 调用的是包提供的可执行命令。只有供代码导入的函数、没有命令行入口的包，不能一概按 `npx 包名` 执行。[npm exec / npx 文档](https://docs.npmjs.com/cli/v11/commands/npm-exec/)

| 命令                      | 动作与用途               |
| ------------------------- | ------------------------ |
| `node hello.js`           | 运行指定 JavaScript 文件 |
| `npm install -D prettier` | 安装并登记项目开发依赖   |
| `npx prettier --version`  | 调用工具并查看工具版本   |
| `npm run check`           | 执行项目定义的任务       |

## 6. 用 Quartz 配置理解命令的执行层次

假设一个 Quartz 项目在 `package.json` 中定义了以下任务。这是配置示例，不代表所有 Quartz 项目都具有这些任务：

```json
{
  "scripts": {
    "quartz": "./quartz/bootstrap-cli.mjs",
    "check": "tsc --noEmit && npx prettier . --check",
    "check:content": "node scripts/validate-content.mjs"
  }
}
```

执行 `npm run check:content` 时，npm 找到对应任务，再启动 `node scripts/validate-content.mjs`，由 Node.js 执行内容校验程序。`.mjs` 表示明确采用 ES 模块格式的 JavaScript 文件。

执行 `npm run check` 时，先调用 TypeScript 编译器 `tsc`；`--noEmit` 表示检查类型但不输出编译产物。`&&` 表示前一个命令成功后，再通过 npx 调用 Prettier 检查格式。

再看带参数的任务：

```bash
npm run quartz -- build
```

- `npm run quartz`：运行项目定义的 `quartz` 任务。
- `--`：将后面的参数传给该任务。
- `build`：由 Quartz 接收的参数，不是让 npm 查找另一个 `build` 任务。

这个例子体现了三层职责：npm 组织项目任务，Node.js 提供运行环境，Quartz、校验脚本和 Prettier 完成具体工作。

## 7. 开发环境与浏览器访问是两个阶段

静态网站在制作时可以依赖 Node.js：构建工具读取 Markdown、配置和主题代码，生成 HTML、CSS、JavaScript 等文件。访问时，浏览器读取生成后的文件并展示网站，读者不需要安装 Node.js。

因此，“开发时需要 Node.js”和“网站最终在浏览器里运行”并不冲突。需要持续运行后端服务的网站，则还要单独考虑服务端的运行环境。

常见 Node.js 安装方式会同时安装 npm，现代 npm 带有 npx。可以分别检查：

```bash
node --version
npm --version
npx --version
```

Node.js 和 npm 使用各自的版本体系，版本号不同很正常。`npx --version` 通常显示随附 npm 工具的版本；要看被调用工具的版本，应使用该工具支持的参数，例如 `npx prettier --version`。[Node.js 与 npm 安装说明](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm/)
