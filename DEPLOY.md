# 部署指南 - 家庭点菜系统

## 方案：Vercel 一键部署（免费）

### 准备工作

1. **注册 Vercel 账号**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录（推荐）或邮箱注册

2. **准备代码仓库**
   - 确保代码已推送到 GitHub 仓库
   - 如果没有 Git 仓库，需要先初始化：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <你的GitHub仓库地址>
   git push -u origin main
   ```

### 部署步骤

#### 步骤 1：导入项目到 Vercel

1. 登录 Vercel 后，点击 "Add New..." → "Project"
2. 选择你的 GitHub 仓库 "family-meal-planner"
3. 点击 "Import"

#### 步骤 2：配置环境变量

在 Vercel 项目设置页面，找到 **Environment Variables** 部分，添加：

```
DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

**获取 DashScope API Key：**
- 访问 https://dashscope.console.aliyun.com/
- 登录阿里云账号
- 创建 API Key

#### 步骤 3：部署

1. 点击 "Deploy" 按钮
2. 等待构建完成（约 2-3 分钟）
3. 部署成功后会获得一个域名，如：`https://family-meal-planner.vercel.app`

#### 步骤 4：分享给家人

将部署后的链接分享给家人：
- 复制链接
- 家人用手机浏览器打开
- 可以添加到手机主屏幕，像 App 一样使用

### 项目结构说明

```
family-meal-planner/
├── api/
│   └── recommend.ts        # AI 推荐 API（Vercel Serverless Function）
├── src/                     # React 前端代码
├── public/                  # 静态资源
├── vercel.json             # Vercel 配置
└── package.json
```

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + API）
npm run dev:all

# 或者分别启动
npm run dev      # 前端 (http://localhost:5173)
npm run server   # API (http://localhost:3272)
```

### 注意事项

1. **数据存储**
   - 当前版本使用 localStorage，数据仅保存在当前设备
   - 每个家人的设备数据独立
   - 如需共享数据，后续可集成 Supabase 等云数据库

2. **API 调用限制**
   - DashScope API 有免费额度
   - 正常使用家庭场景完全够用

3. **域名访问**
   - Vercel 提供免费的 `.vercel.app` 子域名
   - 可以绑定自己的域名（可选）

### 更新部署

代码更新后，只需推送到 GitHub：
```bash
git add .
git commit -m "修复 UI 问题"
git push
```

Vercel 会自动重新部署。

### 故障排除

**问题：API 调用失败**
- 检查环境变量 `DASHSCOPE_API_KEY` 是否正确设置
- 在 Vercel 项目 Logs 中查看错误信息

**问题：页面显示空白**
- 检查浏览器控制台错误
- 确认构建是否成功（Vercel Dashboard → Deployments）

**问题：家人无法访问**
- 确认部署成功并获取了正确的 URL
- 检查网络连接

---

**部署完成后，你就可以在任何地方、任何设备上访问家庭点菜系统了！** 🎉
