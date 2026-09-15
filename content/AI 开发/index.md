---
title: AI 开发知识地图
description: 用概念总览定位模型、知识、行动、记忆、可靠性与工程落地，再进入对应专题。
tags: [AI, Agent, 学习路径]
cssclasses: [knowledge-map]
aliases:
  - AI 开发知识地图
  - AI 开发学习路径
  - AI 知识地图
---

先看全景，再按下方六个主题顺序阅读。第一遍建立概念之间的联系，遇到疑问再进入对应的深入文章。

<div class="concept-overview" aria-label="AI 应用开发概念总览">
  <div class="concept-band">
    <strong>核心能力</strong>
    <span>理解要求 · 获取知识 · 执行动作</span>
  </div>
  <div class="concept-grid">
    <section class="concept-card concept-model" aria-labelledby="concept-model">
      <div class="concept-card-heading"><span class="concept-number">01</span><h3 id="concept-model">模型与输入输出</h3></div>
      <p>理解要求，生成结果</p>
      <ul class="concept-terms">
        <li>LLM</li><li>Prompt</li><li>Context</li><li>Token</li><li>结构化输出</li>
      </ul>
    </section>
    <section class="concept-card concept-knowledge" aria-labelledby="concept-knowledge">
      <div class="concept-card-heading"><span class="concept-number">02</span><h3 id="concept-knowledge">知识接入</h3></div>
      <p>找到并使用外部资料</p>
      <ul class="concept-terms">
        <li>知识库</li><li>检索</li><li>RAG</li><li>Embedding</li><li>向量数据库</li>
      </ul>
    </section>
    <section class="concept-card concept-action" aria-labelledby="concept-action">
      <div class="concept-card-heading"><span class="concept-number">03</span><h3 id="concept-action">行动与编排</h3></div>
      <p>执行操作，组织任务步骤</p>
      <ul class="concept-terms">
        <li>Tool</li><li>Tool Calling</li><li>MCP</li><li>Workflow</li><li>Agent</li><li>Harness</li>
      </ul>
    </section>
  </div>
  <div class="concept-band">
    <strong>工程支撑</strong>
    <span>贯穿整个应用，按需求组合</span>
  </div>
  <div class="concept-grid">
    <section class="concept-card concept-memory" aria-labelledby="concept-memory">
      <div class="concept-card-heading"><span class="concept-number">04</span><h3 id="concept-memory">状态与记忆</h3></div>
      <p>记录进展，保留有用信息</p>
      <ul class="concept-terms">
        <li>任务状态</li><li>会话历史</li><li>短期记忆</li><li>长期记忆</li><li>上下文压缩</li>
      </ul>
    </section>
    <section class="concept-card concept-quality" aria-labelledby="concept-quality">
      <div class="concept-card-heading"><span class="concept-number">05</span><h3 id="concept-quality">可靠性</h3></div>
      <p>检查效果，控制风险与开销</p>
      <ul class="concept-terms">
        <li>授权与权限</li><li>验证</li><li>评测</li><li>Trace · 执行追踪</li><li>成本</li><li>延迟</li>
      </ul>
    </section>
    <section class="concept-card concept-engineering" aria-labelledby="concept-engineering">
      <div class="concept-card-heading"><span class="concept-number">06</span><h3 id="concept-engineering">工程与落地</h3></div>
      <p>维护规范，组合与交付应用</p>
      <ul class="concept-terms">
        <li>Rule</li><li>Skill</li><li>Plugin</li><li>API / 界面</li><li>部署</li><li>单 / 多 Agent</li>
      </ul>
    </section>
  </div>
</div>

图中分组表示学习主题，不是执行顺序，也不代表每个应用都需要全部组件。概念之间会交叉：检索结果进入 Context，Agent 调用 Tool 推进行动，状态与记忆保留后续步骤需要的信息，可靠性贯穿整个过程。

各主题已有入门正文；Agent 运行机制、工具接口和 Codex 是选读内容，不必在第一遍全部读完。这里聚焦 AI 应用开发，不展开模型训练算法与底层算力工程。

## 1. 模型与输入输出

- [[AI 开发/基础概念/LLM、Prompt 与 Context|LLM、Prompt 与 Context]]

## 2. 知识接入

- [[AI 开发/知识接入/模型知识、知识库与 RAG|模型知识、知识库与 RAG]]

## 3. 行动与编排

- [[AI 开发/基础概念/AI 开发核心概念|行动与编排的核心概念]]
- [[AI 开发/Agent 工程/Workflow、单 Agent 与多 Agent|Workflow、单 Agent 与多 Agent]]

### 3.1 深入：Agent 与工具

- [[AI 开发/Agent 工程/Agent 如何运行与停止|Agent 如何运行与停止]]
- [[AI 开发/Agent 工程/Tool 的接口与结果设计|Tool 的接口与结果设计]]
- [[AI 开发/Agent 工程/子 Agent 的原理与使用|子 Agent 的原理与使用]]

## 4. 状态与记忆

- [[AI 开发/状态与记忆/状态、记忆与上下文管理|状态、记忆与上下文管理]]

## 5. 可靠性

- [[AI 开发/可靠性/验证、评测与执行追踪|验证、评测与执行追踪]]

## 6. 工程与落地

- [[AI 开发/工程与落地/从模型调用到可用的 AI 应用|从模型调用到可用的 AI 应用]]

### 6.1 选读：Codex 专题

- [[AI 开发/Agent 工程/Codex/Codex 规则如何生效|Codex 规则如何生效]]
- [[AI 开发/Agent 工程/Codex/多个项目如何复用 Codex 规则|多个项目如何复用 Codex 规则]]
- [[AI 开发/Agent 工程/Codex/Codex Skill、Plugin、MCP 与 Superpowers|Codex Skill、Plugin、MCP 与 Superpowers]]
