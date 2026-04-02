# ZeroYAML：容器化与K8s编排自动化平台项目规划

> **项目愿景**：让开发者免于手写繁琐易错的 YAML 配置，通过可视化界面或 AI 辅助，一键生成生产级别的 Dockerfile、Docker Compose 和 Kubernetes 编排文件，实现真正的 "Zero YAML" 体验。

## 1. 产品定位与核心价值

- **目标用户**：后端开发者、DevOps 工程师、初创团队、全栈开发者。
- **痛点解决**：
  - K8s YAML 学习成本高，缩进容易出错。
  - Dockerfile 针对不同语言有各种最佳实践（多阶段构建、权限控制等），难以记忆。
  - 从本地开发（docker-compose）到线上部署（k8s）的配置转换繁琐。
- **核心价值**：**标准化、可视化、自动化、教育性**，不仅降低云原生手写门槛，也是新人掌握 Docker/K8s 的绝佳学习工具。

## 2. 核心功能设计 (Core Features)

### 2.1 引擎层：统一应用模型 (Universal App Engine)
设计一套标准化的 JSON Schema 结构，作为系统的核心中间层。只要将前端的用户的输入转化为这套 JSON 结构，即可向下编译生成任何目标文件。

### 2.2 Dockerfile 生成模块
- **语言框架预设**：支持主流语言库（Java/Spring Boot, Python/FastAPI, Node.js, Go, Rust 等）。
- **最佳实践内置**：
  - 多阶段构建 (Multi-stage build) 以减小镜像体积。
  - 自动设置时区、非 root 用户运行。
  - 依赖缓存优化。
- **动态定制**：环境变量注入、端口暴露、健康检查、文件 COPY 路径等。

### 2.3 Docker Compose 生成模块
- **服务组合**：支持添加多个微服务，并添加数据库 (PostgreSQL, MySQL), 缓存 (Redis), 消息队列 (RabbitMQ, Kafka) 等常用组件。
- **网络与存储**：自动配置 networks 和 volumes。
- **依赖管理**：通过 `depends_on` 设置启动顺序。

### 2.4 K8s 编排文件生成模块 (核心难点)
- **Workload 配置**：一键生成 Deployment, StatefulSet, CronJob。
- **Service & Ingress**：配置 ClusterIP/NodePort，通过表单直接绑定域名生成 Ingress 规则。
- **高级生产配置**：
  - HPA (水平自动扩缩容)
  - Resources (CPU/Memory 的 requests 和 limits)
  - Probes (Liveness/Readiness 探针)
  - ConfigMap & Secret (配置与密码管理)
- **格式导出**：支持导出为纯 YAML 压缩包，或者转换为 Helm Chart 结构。

### 2.5 交互式学习与字段释义 (Interactive Learning)
- **参数可视化白话解释**：左侧可视化表单旁设置“提示说明卡片”，用大白话解释难懂概念（比如：“什么是 `Liveness Probe`？就像是给你的应用定时把脉，如果挂了就重启它”）。
- **右侧代码智能悬浮提示 (Hover Tooltips)**：在 Monaco Editor 编辑器中生成的代码流上，鼠标悬停在关键字（如 `imagePullPolicy`, `nodeSelector`, `COPY`, `depends_on`），可立即弹出该字段的中文释义、最佳实践和官方文档链接。
- **新手引导模式 (Guided Mode)**：引导用户按照步骤（网络、存储、运行命令）循序渐进构建架构，实现“边写边学”。

### 2.6 AI 辅助生成 (未来进阶)
- 接入 LLM，用户输入：“我要部署一个包含 Redis 和 两个 Node.js 微服务的应用，帮我生成 K8s yaml”，系统自动填充通用配置并生成结果。

## 3. 技术栈建议建议方向

既然项目追求现代化和极致的开发者体验，推荐以下技术栈：

- **前端 (Frontend)**:
  - **框架**: Next.js (React) 或 Vue 3 (Nuxt.js)
  - **UI 组件库**: TailwindCSS + Shadcn/ui (现代、极简风格)
  - **代码编辑器**: Monaco Editor (VS Code 同款内核，支持 YAML/Dockerfile 语法高亮和并排实时预览)
  - **状态管理**: Zustand 非常适合存储复杂的 JSON 表单状态。
- **后端 (Backend)**: (如果需要提供账户系统或 AI 接口)
  - **框架**: Go (Fiber/Gin) [生成速度快，原生对云原生友好] 或 Node.js (NestJS)
- **部署**:
  - 前端部署在 Vercel
  - 核心转换逻辑若不太复杂，完全可以在**前端浏览器中纯静态完成**（纯 JS 生成文件），降低服务器成本（Serverless）。

## 4. 实施阶段规划 (Roadmap)

### Phase 1: MVP（最小可行性版本）- 跑通单应用 Docker 化
1. 确定项目的技术栈并搭建基础工程。
2. 实现针对 Node.js / Python / Go 的极简可视表单。
3. 纯前端实现逻辑，用户填表，右侧 Monaco Editor 实时预览 Dockerfile。
4. 添加一键复制和下载功能，**并在左侧表单和右侧 Monaco 编辑器引入首批基础语法悬浮科普 (Hover提示)**。

### Phase 2: 集成服务与 Docker Compose
1. 扩充前端表单，支持添加/删除多个 "Service"。
2. 设计内置数据库组件库（点击即可添加一个内置默认密码和数据卷的 Redis/MySQL 服务）。
3. 实时生成 docker-compose.yml。

### Phase 3: 征服 Kubernetes (K8s)
1. 设计 K8s 的基础转化逻辑：将 docker-compose 的配置平滑升级为 K8s Deployments + Services。
2. 增加 K8s 专属配置折叠面板 (Advanced Settings)，如暴露 Ingress 路由、探针配置。
3. 提供打包下载整个 K8s manifest 文件夹的功能。

### Phase 4: 打造生态
1. 实现 "Import" 功能：解析用户现有的 docker-compose.yml 并逆向可视化为页面表单。
2. 接入大模型 API 辅助生成。

## 5. 建议的下一步 (Next Steps)

如果你认可这个方向，我们可以按以下步骤立即开始：
1. **初始化项目**：使用你习惯的前端/后端框架（如 Next.js 或 Vue）初始化项目框架。
2. **定义核心数据结构**：我们先一起用 JSON 格式模拟出来一个“应用”该包含哪些字段（如端口、环境、名字）。
3. **编写第一个生成器**：写一段代码将刚才的 JSON 渲染为 Dockerfile。

请告诉我：
1. **你想使用什么技术栈开发？**（比如前端是用 React 还是 Vue？）
2. **需要我帮你直接在 `ZeroYAML` 目录下初始化前端代码库吗？**
