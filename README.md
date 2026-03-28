<div align="center">

# Character Simulation · Branching Fate

### 一个基于 FastAPI + React 的角色模拟与分支命运互动叙事系统

支持 **角色设定管理、剧情节点推进、人物关系建模、世界线分叉、AI 角色对话上下文构建**。  
项目目标是让角色在不同剧情节点与命运分支中，保持连续的状态、关系与叙事逻辑。

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red)
![Status](https://img.shields.io/badge/Status-In%20Development-orange)

</div>

---

## 📚 项目导览

- [项目简介](#-项目简介)
- [使用框架](#-使用框架)
- [已实现功能](#-已实现功能)
- [项目结构概述](#-项目结构概述)
- [后端设计说明](#-后端设计说明)
- [快速开始](#-快速开始)
- [开发说明](#-开发说明)
- [后续规划](#-后续规划)

---

## ✨ 项目简介

**Character Simulation · Branching Fate** 是一个面向互动叙事场景的 AI 对话系统原型。

它尝试围绕“**角色**、**剧情节点**、**人物关系**、**世界线分叉**”构建更完整的叙事上下文，使 AI 的回复能够更贴近：

- 当前角色身份
- 当前剧情进展
- 过往历史链路
- 与其他角色之间的关系变化
- 所处世界线下的命运分支

这个项目适合用于：

- AI 角色扮演系统
- 剧情对话产品原型
- 多角色互动叙事项目
- 分支剧情 / 世界线系统实验
- 像我一样喜欢玩galgame的人养电子男/女/沃尔玛塑料袋友

---

## 🛠 使用框架

### Backend
- **FastAPI**：后端 API 框架
- **SQLAlchemy**：ORM 数据访问
- **Pydantic**：请求 / 响应数据校验
- **Uvicorn**：ASGI 服务运行
- **SQLite / 可扩展至其他关系型数据库**：数据存储

### Frontend
- **React**：前端框架  
> 前端目前处于逐步搭建阶段，当前以完善后端数据模型和接口能力为主。

---

## 🚀 已实现功能

### 1. 角色管理
- 创建、查询角色信息
- 管理角色基础设定
- 管理角色核心价值观

### 2. 世界线管理
- 创建世界线
- 查询世界线信息
- 为不同剧情路径提供命运分支容器

### 3. 剧情节点管理
- 创建剧情节点
- 通过 `parent_node_id` 组织剧情链
- 支持沿祖先节点回溯历史剧情

### 4. 角色状态管理
- 为角色在某一剧情节点下保存状态快照
- 当前状态字段包括：
  - 心理状态
  - 当前目标
  - Prompt 附加设定
  - 关系摘要

### 5. 人物关系管理
- 为剧情节点维护角色之间的关系边
- 支持：
  - 关系方向（A → B）
  - 关系类型
  - 关系强度
  - 关系描述

### 6. 节点关系图聚合接口
- 可按剧情节点聚合返回：
  - 当前节点信息
  - 节点涉及角色
  - 当前节点下的关系边
- 便于前端后续绘制关系图

### 7. 世界线分叉复制
支持从既有剧情节点创建新的世界线分支，并复制：

- 祖先节点链
- 对应角色状态
- 对应人物关系

从而保留旧剧情上下文，在新分支中继续推进故事。

### 8. AI Prompt 上下文构建
后端会将以下内容组合进角色 Prompt：

- 角色基础信息
- 当前世界线信息
- 当前剧情节点信息
- 剧情历史链
- 当前角色状态
- 当前人物关系

使模型回复更贴近角色设定和叙事上下文。

---

## 🧱 项目结构概述

当前项目结构如下：

```bash
story-pet-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       ├── characters.py
│   │   │       ├── character_state.py
│   │   │       ├── character_relationship.py
│   │   │       ├── nodes.py
│   │   │       ├── worldlines.py
│   │   │       ├── sessions.py
│   │   │       └── chat.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── character.py
│   │   │   ├── character_state.py
│   │   │   ├── character_relationship.py
│   │   │   ├── worldline.py
│   │   │   ├── story_node.py
│   │   │   ├── session.py
│   │   │   └── message.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── character_repo.py
│   │   │   ├── character_state_repo.py
│   │   │   ├── character_relationship_repo.py
│   │   │   ├── node_repo.py
│   │   │   ├── session_repo.py
│   │   │   ├── worldline_repo.py
│   │   │   └── message_repo.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── branch.py
│   │   │   ├── character.py
│   │   │   ├── character_state.py
│   │   │   ├── character_relationship.py
│   │   │   ├── chat.py
│   │   │   ├── relationship_graph.py
│   │   │   ├── session.py
│   │   │   ├── story_node.py
│   │   │   └── worldline.py
│   │   │
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.py
│   │
│   ├── data/
│   ├── venv/
│   ├── .env
│   └── requirements.txt
│
├── frontend/
├── .gitignore
└── README.md
```
---
## 🧠 后端设计说明
### 分层结构

项目当前以后端为核心，采用相对清晰的分层方式：

- API 层：负责定义接口与请求入口
- Schemas 层：负责请求体 / 响应体结构校验
- Repositories 层：负责数据库读写
- Models 层：负责数据库实体定义
- Services 层：负责具体业务逻辑处理

这样的结构有助于：

- 降低业务耦合
- 提高代码可维护性
- 便于后续扩展 AI 逻辑与前端页面
- 升高作者的血压

### 剧情驱动的数据设计
系统围绕以下核心实体展开：

- Character：角色基础设定
- Worldline：世界线 / 命运分支
- StoryNode：剧情节点
- CharacterState：角色在节点下的状态快照
- CharacterRelationship：节点下的人物关系快照
- Session / Message：对话会话与消息记录

这套结构使系统可以同时支持：

- 角色状态的阶段性变化
- 人物关系的动态变化
- 从某个节点继续分叉出新剧情
- AI 对话与剧情上下文联动
- 让作者给喜欢的所有角色套上女仆装去开女仆咖啡厅

## 📝 开发说明
### 当前开发重点
目前项目主要集中在后端能力建设，包括：

- 数据模型设计
- 剧情节点组织
- 分支世界线复制
- 人物关系图接口
- Prompt 上下文构建

### 前端目录已预留，后续将逐步补充：

- 角色管理页面
- 剧情节点页面
- 对话页面
- 人物关系图可视化页面
- 世界线切换与分支视图

### 接口组织
当前接口主要位于：
```
backend/app/api/v1/
```
包括：
- characters.py
- character_state.py
- character_relationship.py
- nodes.py
- worldlines.py
- sessions.py
- chat.py

路由统一由：
```
backend/app/api/v1/router.py
```
进行聚合注册。

### 数据与上下文能力
目前系统已经具备基础的叙事上下文能力：

- 剧情历史链回溯
- 节点状态快照
- 节点关系快照
- 世界线分叉继承
- AI Prompt 结构化构建

## 📌 后续规划
接下来计划逐步补充：

- React 前端基础页面
- 对话界面与会话管理完善
- 节点上下文聚合接口
- 人物关系图可视化
- 更完整的消息持久化
- 多角色交互能力
- 更细粒度的角色记忆机制
- 更稳定的分支世界线回溯与对比

等作者先打完死亡搁浅2全成就，顺便，天国拯救真好玩

## 📄 License

This project is currently for personal learning and development.

License information can be added later based on project needs.

<div>