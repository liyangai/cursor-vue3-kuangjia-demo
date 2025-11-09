# MSW 集成完成总结

## ✅ 已完成的工作

### 1. 安装 MSW

```bash
npm install msw --save-dev
```

已成功安装 MSW 及其依赖。

### 2. 初始化 MSW

```bash
npx msw init public/ --save
```

已在 `public/` 目录生成 Service Worker 文件 `mockServiceWorker.js`。

### 3. 创建 Mock Handlers

**文件：** `src/mocks/handlers.ts`

定义了完整的 API 模拟处理器：

#### 用户管理 API
- ✅ `GET /api/users` - 获取用户列表（支持分页和搜索）
- ✅ `POST /api/users` - 新增用户
- ✅ `PUT /api/users/:id` - 更新用户
- ✅ `DELETE /api/users/:id` - 删除用户

#### 商品管理 API
- ✅ `GET /api/goods` - 获取商品列表（支持分页和搜索）
- ✅ `POST /api/goods` - 新增商品
- ✅ `PUT /api/goods/:id` - 更新商品
- ✅ `DELETE /api/goods/:id` - 删除商品

### 4. 配置 Service Worker

**文件：** `src/mocks/browser.ts`

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### 5. 启动 MSW

**文件：** `src/main.ts`

已修改入口文件，在开发环境自动启动 MSW：

```typescript
async function enableMocking() {
  if (import.meta.env.MODE !== 'production') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass'
    })
  }
}

enableMocking().then(() => {
  const app = createApp(App)
  app.mount('#app')
})
```

### 6. 更新 Store 使用真实 API

#### 用户 Store (`src/stores/user.ts`)

```typescript
// 之前：直接在 Store 中模拟数据
const users = ref<User[]>([...mockUsers])

// 现在：通过真实的 HTTP 请求获取数据
const getUserList = async (params: PageParams) => {
  const response = await request.get<PageData<User>>('/users', { params })
  return response.data
}
```

#### 商品 Store (`src/stores/goods.ts`)

```typescript
// 之前：直接在 Store 中模拟数据
const goodsList = ref<Goods[]>([...mockGoods])

// 现在：通过真实的 HTTP 请求获取数据
const getGoodsList = async (params: PageParams) => {
  const response = await request.get<PageData<Goods>>('/goods', { params })
  return response.data
}
```

### 7. 创建文档

- ✅ **MSW_GUIDE.md** - 详细的 MSW 使用指南
- ✅ **MSW_INTEGRATION.md** - 集成完成总结（本文档）

## 🎯 核心优势

### 1. 真实的网络请求

```
之前（内存模拟）：
View → Store → 直接返回模拟数据 → View

现在（MSW 模拟）：
View → Store → Axios 请求 → MSW 拦截 → 返回模拟数据 → Store → View
```

**优势：**
- ✅ 可以在浏览器 DevTools 中看到真实的网络请求
- ✅ 可以看到请求的 URL、参数、响应数据
- ✅ 更接近生产环境的真实场景

### 2. 无侵入式设计

**业务代码无需修改：**

```typescript
// Store 中使用真实的 API 调用
const getUserList = async (params: PageParams) => {
  const response = await request.get<PageData<User>>('/users', { params })
  return response.data
}
```

**切换到真实后端：**

只需在 `src/main.ts` 中注释掉 `enableMocking()`，Store 代码无需任何修改！

### 3. 功能完整

支持的功能：
- ✅ GET 请求（列表查询、参数过滤、分页）
- ✅ POST 请求（创建资源）
- ✅ PUT 请求（更新资源）
- ✅ DELETE 请求（删除资源）
- ✅ 路径参数（`:id`）
- ✅ 查询参数（`?page=1&pageSize=10`）
- ✅ 请求体（JSON）
- ✅ 响应状态码（200、404、500 等）

## 📊 项目结构变化

### 新增文件

```
src/
├── mocks/                    # 新增：MSW 配置
│   ├── handlers.ts          # API 处理器定义
│   └── browser.ts           # Service Worker 配置
public/
└── mockServiceWorker.js     # 新增：Service Worker 脚本
```

### 修改文件

- ✅ `src/main.ts` - 添加 MSW 启动逻辑
- ✅ `src/stores/user.ts` - 使用真实的 API 请求
- ✅ `src/stores/goods.ts` - 使用真实的 API 请求
- ✅ `package.json` - 添加 MSW 依赖

### 新增文档

- ✅ `MSW_GUIDE.md` - 使用指南
- ✅ `MSW_INTEGRATION.md` - 集成总结

## 🚀 使用方式

### 开发环境（使用 MSW）

```bash
npm run dev
```

**控制台输出：**
```
[MSW] Mocking enabled.
```

**浏览器 DevTools → Network：**
- 可以看到所有的 API 请求
- 请求会显示 `[MSW]` 标记
- 可以查看请求参数和响应数据

### 生产环境（禁用 MSW）

MSW 在生产环境自动禁用（`import.meta.env.MODE !== 'production'`）。

### 切换到真实后端

**方式 1：禁用 MSW**

```typescript
// src/main.ts
// 注释掉 enableMocking()
// enableMocking().then(() => {
//   ...
// })

// 直接启动应用
const app = createApp(App)
app.mount('#app')
```

**方式 2：配置代理**

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://your-backend-url.com',
        changeOrigin: true
      }
    }
  }
})
```

**Store 代码无需修改！** ✅

## 🔍 调试技巧

### 1. 查看网络请求

打开浏览器 DevTools → Network 标签：

- 查看请求 URL
- 查看请求参数（Query Params）
- 查看请求体（Request Payload）
- 查看响应数据（Response）
- 查看响应时间

### 2. 查看 MSW 日志

浏览器控制台会显示：

```
[MSW] Mocking enabled.
[MSW] GET /api/users (200 OK)
[MSW] POST /api/users (200 OK)
```

### 3. 修改 Mock 数据

编辑 `src/mocks/handlers.ts`：

```typescript
// 修改初始数据
let users: User[] = [
  { id: 1, name: '测试用户', email: 'test@example.com', ... },
  // 添加更多测试数据
]

// 修改响应延迟
http.get('/api/users', async () => {
  await delay(1000) // 延迟 1 秒
  return HttpResponse.json(data)
})

// 模拟错误
http.get('/api/users', () => {
  return HttpResponse.json(
    { code: 500, message: '服务器错误', data: null },
    { status: 500 }
  )
})
```

## 📝 API 接口文档

### 用户管理 API

#### 获取用户列表

```http
GET /api/users?page=1&pageSize=10&name=张三&email=test@example.com

Response:
{
  "code": 200,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138001",
        "role": "管理员",
        "status": 1,
        "createTime": "2024-01-01 10:00:00",
        "updateTime": "2024-01-01 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

#### 新增用户

```http
POST /api/users

Request Body:
{
  "name": "李四",
  "email": "lisi@example.com",
  "phone": "13800138002",
  "role": "普通用户",
  "status": 1
}

Response:
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 4,
    "name": "李四",
    ...
  }
}
```

#### 更新用户

```http
PUT /api/users/1

Request Body:
{
  "id": 1,
  "name": "张三（修改）",
  ...
}

Response:
{
  "code": 200,
  "message": "更新成功",
  "data": { ... }
}
```

#### 删除用户

```http
DELETE /api/users/1

Response:
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

### 商品管理 API

接口格式与用户管理类似，只是 URL 为 `/api/goods`。

## ⚠️ 注意事项

### 1. 数据持久化

MSW 的数据存储在内存中，**刷新页面会重置**。

如需持久化，可以使用：

```typescript
// 读取 localStorage
let users = JSON.parse(localStorage.getItem('users') || '[]')

// 保存到 localStorage
localStorage.setItem('users', JSON.stringify(users))
```

### 2. Service Worker 缓存

如果修改了 handlers 但没有生效，可能是 Service Worker 缓存问题：

1. 打开 DevTools → Application → Service Workers
2. 点击 "Unregister" 注销 Service Worker
3. 刷新页面重新注册

### 3. CORS 问题

MSW 不会有 CORS 问题，因为请求被拦截在浏览器内部。

### 4. 生产环境

MSW 在生产环境自动禁用，不会影响生产构建大小。

## 🎓 学习资源

- **MSW 官方文档**：https://mswjs.io/
- **MSW GitHub**：https://github.com/mswjs/msw
- **MSW Examples**：https://github.com/mswjs/examples
- **项目文档**：`MSW_GUIDE.md`

## ✨ 总结

通过集成 MSW，项目实现了：

1. ✅ **真实的网络请求体验**：可以在 DevTools 中看到请求
2. ✅ **无侵入的 Mock 方案**：业务代码无需修改
3. ✅ **易于切换到真实后端**：注释一行代码即可
4. ✅ **完整的 CRUD 功能**：支持增删改查和分页搜索
5. ✅ **开发体验提升**：模拟各种网络状态
6. ✅ **团队协作友好**：统一的 API 定义

现在，你可以：

- 🚀 启动项目：`npm run dev`
- 🔍 打开 DevTools 查看网络请求
- ✏️ 修改 `src/mocks/handlers.ts` 自定义 API
- 📖 阅读 `MSW_GUIDE.md` 了解更多用法

**Happy Coding! 🎉**

