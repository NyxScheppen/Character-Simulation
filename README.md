<div align="center">

# Character Simulation · Branching Fate

### 一个基于 FastAPI + React 的角色模拟与分支命运互动叙事系统

支持 **角色管理、剧情节点推进、角色状态快照、人物关系建模、世界线分叉、会话管理与 AI 对话功能**。  
项目目标是让角色在不同剧情节点与命运分支中，尽可能保持连续的设定、关系与叙事逻辑。

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

</div>

---

## 📚 项目导览

- [项目简介](#-项目简介)
- [技术栈](#-技术栈)
- [核心功能](#-核心功能)
- [界面概览](#-界面概览)
- [项目结构](#-项目结构)
- [后端设计说明](#-后端设计说明)
- [快速开始](#-快速开始)
- [接口概览](#-接口概览)
- [开发说明](#-开发说明)
- [后续规划](#-后续规划)
- [License](#-license)

---

## ✨ 项目简介

**Character Simulation · Branching Fate** 是一个面向互动叙事与角色扮演场景的 AI 对话系统原型。

系统围绕以下几个核心元素展开：

- **角色（Character）**
- **剧情节点（Story Node）**
- **角色状态（Character State）**
- **角色关系（Character Relationship）**
- **世界线（Worldline）**
- **会话与消息（Session / Message）**

项目尝试解决的问题是：

> 当角色进入不同剧情阶段、不同世界线分支后，AI 如何仍然“记得”它是谁、处于什么处境、和谁关系如何、之前经历过什么。

因此，这个系统不是单纯的聊天页面，而是一个带有叙事上下文组织能力的 AI 对话软件雏形。

适用场景包括：

- AI 角色扮演系统
- 分支剧情 / 多世界线叙事系统
- 剧情互动产品原型
- 多角色关系模拟项目
- 基于设定驱动的对话实验

---

## 🛠 技术栈

### Backend
- **FastAPI**：后端 API 框架
- **SQLAlchemy**：ORM 数据访问
- **Pydantic**：请求与响应数据校验
- **Uvicorn**：ASGI 服务运行
- **SQLite**：默认数据存储（可扩展为 MySQL / PostgreSQL 等）

### Frontend
- **React**：前端框架
- **Axios**：前后端接口通信
- **CSS**：当前使用自定义样式完成页面布局与组件风格

---

## 🚀 核心功能

### 1. 角色管理
支持角色基础设定的创建、展示、修改与删除，包括：

- 角色姓名
- 基础设定
- 核心价值观

前端已提供角色管理页面，支持通过弹窗进行新增与编辑操作。

---

### 2. 世界线管理
支持世界线的创建、切换与删除，用于承载不同命运分支下的剧情发展。

每条世界线可拥有独立的剧情节点链路，方便后续进行平行剧情展开。

---

### 3. 剧情节点管理
支持为指定世界线创建剧情节点，并通过 `parent_node_id` 组织节点之间的前后关系。

当前已支持：

- 创建节点
- 删除节点
- 查看当前节点详情
- 沿节点链组织剧情流
- 从某个节点发起 Fate Change / 分支世界线复制

---

### 4. 角色状态快照
角色在某一剧情节点下会保存对应的状态快照，便于 AI 对话时读取当前上下文。

当前状态字段包括：

- 心理状态
- 当前目标
- Prompt 附加设定
- 关系摘要

这使角色在不同剧情节点下可以拥有不同的状态表现。

---

### 5. 角色关系建模
系统支持记录某个剧情节点下角色之间的关系信息，包括：

- 关系方向（A → B）
- 关系类型
- 关系数值
- 关系描述

前端页面已支持关系的新增、修改与删除。

---

### 6. 世界线分叉（Fate Change）
支持从已有剧情节点创建新的世界线分支，并复制相关上下文信息。

当前设计目标包括复制：

- 祖先节点链
- 角色状态
- 角色关系

从而在保留既有叙事基础的前提下，继续衍生新的剧情方向。

---

### 7. 会话与 AI 对话
系统支持以某个角色状态为基础创建对话会话，并在会话中发送消息。

对话能力目前包括：

- 会话列表展示
- 创建会话
- 消息历史读取
- 用户发送消息
- AI 返回回复
- 基于角色 / 节点上下文构建 Prompt

---

### 8. Prompt 上下文构建
后端会将以下内容聚合到 AI 对话上下文中：

- 角色基础设定
- 当前世界线信息
- 当前剧情节点信息
- 剧情历史链
- 当前角色状态
- 当前人物关系

从而使模型回复更贴近角色身份、剧情进展和世界线分支背景。

---

## 🖥 界面概览

当前前端已初步完成以下页面：

### 角色管理页
支持：

- 查看角色列表
- 新建角色
- 修改角色
- 删除角色

### 世界线 / 剧情节点页
支持：

- 查看世界线列表
- 创建与删除世界线
- 查看当前节点详情
- 创建与删除节点
- 查看节点流
- 管理节点下角色状态
- 管理节点下角色关系
- 发起 Fate Change

### 对话页
支持：

- 查看会话列表
- 创建会话
- 查看消息记录
- 发送消息并接收 AI 回复

---

## 🧱 项目结构

一个典型的项目结构如下：

```bash
project-root/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       ├── characters.py
│   │   │       ├── character_state.py
│   │   │       ├── character_relationship.py
│   │   │       ├── nodes.py
│   │   │       ├── worldlines.py
│   │   │       ├── sessions.py
│   │   │       └── chat.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   ├── data/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🧠 后端设计说明

### 分层结构

项目采用相对清晰的后端分层方式：

- **API 层**：定义路由与请求入口
- **Schemas 层**：定义请求体与响应体结构
- **Repositories 层**：负责数据库读写
- **Models 层**：负责数据表实体定义
- **Services 层**：负责业务逻辑编排

这样的结构有助于：

- 降低耦合
- 提高可维护性
- 便于扩展对话逻辑
- 方便后续替换模型接入方式

---

### 核心实体

系统当前围绕以下核心实体展开：

- `Character`：角色基础设定
- `Worldline`：世界线 / 命运分支
- `StoryNode`：剧情节点
- `CharacterState`：节点下角色状态快照
- `CharacterRelationship`：节点下角色关系快照
- `Session`：对话会话
- `Message`：会话消息记录

这套结构使系统可以同时支持：

- 角色状态的阶段性变化
- 人物关系的动态变化
- 从某节点继续分叉出新剧情
- AI 对话与剧情上下文联动

---

## ⚡ 快速开始

- 我还没研究出来怎么把这玩意封装

---

## 🔌 接口概览

当前主要接口模块包括：

### 角色
- `GET /characters/`
- `POST /characters/`
- `PUT /characters/{id}`
- `DELETE /characters/{id}`

### 世界线
- `GET /worldlines/`
- `POST /worldlines/`
- `DELETE /worldlines/{id}`

### 剧情节点
- `GET /nodes/`
- `GET /nodes/{id}`
- `POST /nodes/`
- `DELETE /nodes/{id}`
- `POST /nodes/{id}/branch`

### 角色状态
- `GET /character-states/`
- `POST /character-states/`
- `DELETE /character-states/{id}`

### 角色关系
- `GET /character-relationships/`
- `POST /character-relationships/`
- `PUT /character-relationships/{id}`
- `DELETE /character-relationships/{id}`

### 会话
- `GET /sessions/`
- `POST /sessions/`
- `GET /sessions/{id}/messages`

### 对话
- `POST /chat/`

---

## 📝 开发说明

### 当前开发重点

目前项目已经从“后端为主”逐步进入“前后端联动完善”阶段，当前重点包括：

- 页面交互完善
- 各实体模块 CRUD 打通
- 会话与聊天体验优化
- 节点编辑能力补充
- AI Prompt 构建与调优

---

### 当前已完成的前端方向

- 角色管理页面
- 世界线 / 节点管理页面
- 角色状态与关系管理区块
- 基础聊天页
- 统一样式体系的逐步整理

---

### 当前已具备的数据上下文能力

- 剧情历史链回溯
- 节点状态快照读取
- 节点关系快照读取
- 世界线分叉继承
- 基于角色与节点的 AI Prompt 结构化构建

---

## 📌 后续规划

接下来计划继续补充：

- 剧情节点编辑功能
- 更完整的消息持久化与展示
- 人物关系图可视化
- 世界线分支关系可视化
- 多角色联动对话能力
- Prompt 构建策略优化

---

## 📄 License

This project is currently intended for personal learning, prototyping, and development.

License details can be added later based on future open-source or distribution plans.