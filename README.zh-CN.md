<a href="https://chat.vercel.ai/">
  <img alt="基于 Next.js 14 和 App Router 的 AI 聊天机器人" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Next.js AI 聊天机器人</h1>
</a>

<p align="center">
  一个使用 Next.js 和 Vercel AI SDK 构建的开源 AI 聊天机器人模板
</p>

<p align="center">
  <a href="#功能特性"><strong>功能特性</strong></a> ·
  <a href="#模型提供商"><strong>模型提供商</strong></a> ·
  <a href="#部署自己的版本"><strong>部署自己的版本</strong></a> ·
  <a href="#本地运行"><strong>本地运行</strong></a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>
<br/>

## 功能特性

- [Next.js](https://nextjs.org) App Router
  - 先进的路由系统，实现无缝导航和高性能
  - React 服务器组件（RSCs）和服务器操作，用于服务器端渲染和提升性能
- [AI SDK](https://sdk.vercel.ai/docs)
  - 统一的 API，用于生成文本、结构化对象和 LLM 工具调用
  - 用于构建动态聊天和生成式用户界面的 Hooks
  - 支持 OpenAI（默认）、Anthropic、Cohere 和其他模型提供商
- [shadcn/ui](https://ui.shadcn.com)
  - 使用 [Tailwind CSS](https://tailwindcss.com) 进行样式设计
  - 来自 [Radix UI](https://radix-ui.com) 的组件原语，确保可访问性和灵活性
- 数据持久化
  - [由 Neon 提供支持的 Vercel Postgres](https://vercel.com/storage/postgres) 用于保存聊天历史和用户数据
  - [Vercel Blob](https://vercel.com/storage/blob) 用于高效的文件存储
- [NextAuth.js](https://github.com/nextauthjs/next-auth)
  - 简单且安全的身份验证

## 模型提供商

此模板默认使用 OpenAI 的 `gpt-4` 模型。但是，通过 [AI SDK](https://sdk.vercel.ai/docs)，您只需几行代码就可以将 LLM 提供商切换为 [OpenAI](https://openai.com)、[Anthropic](https://anthropic.com)、[Cohere](https://cohere.com/) 和[更多提供商](https://sdk.vercel.ai/providers/ai-sdk-providers)。

## 部署自己的版本

您可以通过一键点击将 Next.js AI 聊天机器人的自己的版本部署到 Vercel：

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot&env=AUTH_SECRET,OPENAI_API_KEY&envDescription=Learn%20more%20about%20how%20to%20get%20the%20API%20Keys%20for%20the%20application&envLink=https%3A%2F%2Fgithub.com%2Fvercel%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&demo-title=AI%20Chatbot&demo-description=An%20Open-Source%20AI%20Chatbot%20Template%20Built%20With%20Next.js%20and%20the%20AI%20SDK%20by%20Vercel.&demo-url=https%3A%2F%2Fchat.vercel.ai&stores=[{%22type%22:%22postgres%22},{%22type%22:%22blob%22}])

## 本地运行

您需要使用[在 `.env.example` 中定义的环境变量](.env.example)来运行 Next.js AI 聊天机器人。建议您使用 [Vercel 环境变量](https://vercel.com/docs/projects/environment-variables)，但使用 `.env` 文件也可以。

> 注意：您不应该提交您的 `.env` 文件，否则会暴露允许他人控制访问您的各种 OpenAI 和身份验证提供商帐户的密钥。

1. 安装 Vercel CLI：`npm i -g vercel`
2. 将本地实例与 Vercel 和 GitHub 帐户关联（创建 `.vercel` 目录）：`vercel link`
3. 下载您的环境变量：`vercel env pull`

```bash
pnpm install
pnpm dev
```

您的应用模板现在应该在 [localhost:3000](http://localhost:3000/) 上运行。
