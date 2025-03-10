# Dream Machine - AI图像生成平台

这是一个基于阿里云通义万相和QWQ模型的图像生成平台，参照Luma AI的Dream Machine设计。该平台允许用户通过简单的文本描述生成高质量的图像。

## 项目架构

项目采用前后端分离架构：

### 前端 (client)
- 使用React + TypeScript构建
- 使用Tailwind CSS进行样式设计
- 包含两个主要页面：
  - 首页：展示产品特性和介绍
  - 创作窗口：用于生成和查看AI图像

### 后端 (server)
- 使用Node.js + Express + TypeScript构建
- 采用分层架构：
  - 控制器层：处理HTTP请求和响应
  - 服务层：实现业务逻辑
  - 模型层：定义数据结构
  - 路由层：定义API路由
  - 中间件层：处理认证、错误等
  - 类型定义层：定义TypeScript类型
  - 工具层：提供通用功能
  - 配置层：管理应用配置

### AI图像生成流程
1. 用户输入文本提示词
2. 后端调用阿里云QWQ模型理解用户意图并优化提示词
3. 优化后的提示词传递给阿里云通义万相图像生成模型
4. 生成的图像返回给前端展示

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- React Router

### 后端
- Node.js
- Express
- TypeScript
- MongoDB (数据存储)
- OpenAI SDK (用于调用阿里云QWQ模型)
- Axios (用于调用阿里云通义万相API)
- Jest (单元测试和集成测试)

## 运行项目

### 前提条件
- Node.js 16+
- MongoDB
- 阿里云通义万相API密钥
- 阿里云QWQ模型API密钥

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 配置环境变量

在server目录下创建.env文件：

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/dream_machine
USE_MOCK_DATA=false
ALIYUN_API_KEY=your_aliyun_api_key_here
QWQ_API_KEY=your_qwq_api_key_here
QWQ_BASE_URL=https://dashscope.aliyuncs.com
```

### 启动开发服务器

```bash
# 启动前端开发服务器
cd client
npm run dev

# 启动后端开发服务器
cd ../server
npm run dev
```

前端将在 http://localhost:5173 运行
后端将在 http://localhost:5001 运行

## 测试

```bash
# 运行单元测试
cd server
npm test

# 运行测试覆盖率报告
npm run test:coverage
```

## 生产环境部署

### 构建前端

```bash
cd client
npm run build
```

### 构建后端

```bash
cd server
npm run build
npm start
```

## 项目结构

```
dream-machine/
├── client/                 # 前端代码
│   ├── public/             # 静态资源
│   └── src/                # 源代码
│       ├── components/     # 组件
│       ├── pages/          # 页面
│       ├── services/       # API服务
│       └── App.tsx         # 主应用组件
│
├── logs/                   # 日志文件
│
└── server/                 # 后端代码
    ├── src/                # 源代码
    │   ├── config.ts       # 配置
    │   ├── controllers/    # 控制器
    │   ├── middlewares/    # 中间件
    │   ├── models/         # 数据模型
    │   ├── routes/         # 路由
    │   ├── services/       # 服务
    │   ├── types/          # 类型定义
    │   ├── utils/          # 工具函数
    │   └── index.ts        # 入口文件
    ├── tests/              # 测试文件
    │   ├── unit/           # 单元测试
    │   ├── integration/    # 集成测试
    │   └── setup.ts        # 测试配置
    └── .env                # 环境变量
```

## 文档

- [项目进度](./PROGRESS.md) - 项目开发进度和里程碑
- [架构文档](./ARCHITECTURE.md) - 详细的架构设计文档
- [架构图](./ARCHITECTURE_DIAGRAMS.md) - 系统架构图和流程图

## 许可证

MIT 