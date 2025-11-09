# MSW (Mock Service Worker) 使用指南

## 什么是 MSW？

MSW (Mock Service Worker) 是一个用于模拟 API 请求的库。它通过拦截浏览器的网络请求，返回模拟的数据，让你可以在没有真实后端的情况下进行前端开发和测试。

### 优势

- ✅ **真实的网络请求**：使用真实的 HTTP 请求，而不是在代码中直接返回数据
- ✅ **无侵入性**：不需要修改业务代码，只需要定义 mock handlers
- ✅ **开发体验好**：可以在浏览器 DevTools 中看到真实的网络请求
- ✅ **易于调试**：可以模拟各种网络状态（成功、失败、延迟等）
- ✅ **生产环境自动禁用**：只在开发环境生效

## 项目集成

### 1. 安装

```bash
npm install msw --save-dev
```

### 2. 初始化

```bash
npx msw init public/ --save
```

这会在 `public/` 目录生成 Service Worker 文件。

### 3. 项目结构

```
src/
├── mocks/
│   ├── handlers.ts      # API 处理器定义
│   └── browser.ts       # Service Worker 配置
└── main.ts              # 启动 MSW
```

## 使用说明

### 1. 定义 API Handlers

在 `src/mocks/handlers.ts` 中定义 API 的模拟响应：

```typescript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET 请求
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    
    return HttpResponse.json({
      code: 200,
      message: '成功',
      data: {
        list: [...],
        total: 100,
        page: page,
        pageSize: 10
      }
    })
  }),

  // POST 请求
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    
    return HttpResponse.json({
      code: 200,
      message: '添加成功',
      data: body
    })
  }),

  // PUT 请求
  http.put('/api/users/:id', async ({ request, params }) => {
    const id = params.id
    const body = await request.json()
    
    return HttpResponse.json({
      code: 200,
      message: '更新成功',
      data: { ...body, id }
    })
  }),

  // DELETE 请求
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      code: 200,
      message: '删除成功',
      data: null
    })
  })
]
```

### 2. 启动 MSW

在 `src/main.ts` 中启动 MSW：

```typescript
import { createApp } from 'vue'
import App from './App.vue'

// 启动 Mock Service Worker
async function enableMocking() {
  if (import.meta.env.MODE !== 'production') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass' // 未处理的请求直接通过
    })
  }
}

enableMocking().then(() => {
  const app = createApp(App)
  app.mount('#app')
})
```

### 3. 使用真实的 API 请求

在 Store 中使用 Axios 发起真实的 HTTP 请求：

```typescript
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const getUserList = async (params: PageParams) => {
    const response = await request.get<PageData<User>>('/users', { params })
    return response.data
  }

  const addUser = async (user: User) => {
    await request.post<User>('/users', user)
    return true
  }

  // ...
})
```

## API 接口定义

### 用户管理 API

#### 获取用户列表
```
GET /api/users
Query Parameters:
  - page: number (页码)
  - pageSize: number (每页数量)
  - name: string (用户名，可选)
  - email: string (邮箱，可选)

Response:
{
  code: 200,
  message: "成功",
  data: {
    list: User[],
    total: number,
    page: number,
    pageSize: number
  }
}
```

#### 新增用户
```
POST /api/users
Body: User

Response:
{
  code: 200,
  message: "添加成功",
  data: User
}
```

#### 更新用户
```
PUT /api/users/:id
Body: User

Response:
{
  code: 200,
  message: "更新成功",
  data: User
}
```

#### 删除用户
```
DELETE /api/users/:id

Response:
{
  code: 200,
  message: "删除成功",
  data: null
}
```

### 商品管理 API

#### 获取商品列表
```
GET /api/goods
Query Parameters:
  - page: number (页码)
  - pageSize: number (每页数量)
  - name: string (商品名称，可选)
  - category: string (分类，可选)

Response:
{
  code: 200,
  message: "成功",
  data: {
    list: Goods[],
    total: number,
    page: number,
    pageSize: number
  }
}
```

#### 新增商品
```
POST /api/goods
Body: Goods

Response:
{
  code: 200,
  message: "添加成功",
  data: Goods
}
```

#### 更新商品
```
PUT /api/goods/:id
Body: Goods

Response:
{
  code: 200,
  message: "更新成功",
  data: Goods
}
```

#### 删除商品
```
DELETE /api/goods/:id

Response:
{
  code: 200,
  message: "删除成功",
  data: null
}
```

## 高级用法

### 1. 模拟网络延迟

```typescript
http.get('/api/users', async () => {
  await delay(1000) // 延迟 1 秒
  return HttpResponse.json(data)
})
```

### 2. 模拟错误响应

```typescript
http.get('/api/users', () => {
  return HttpResponse.json(
    {
      code: 500,
      message: '服务器错误',
      data: null
    },
    { status: 500 }
  )
})
```

### 3. 条件响应

```typescript
http.get('/api/users', ({ request }) => {
  const url = new URL(request.url)
  const name = url.searchParams.get('name')
  
  if (!name) {
    return HttpResponse.json(
      { code: 400, message: '缺少参数', data: null },
      { status: 400 }
    )
  }
  
  return HttpResponse.json({ code: 200, message: '成功', data: [...] })
})
```

### 4. 动态路径参数

```typescript
http.get('/api/users/:id', ({ params }) => {
  const { id } = params
  const user = users.find(u => u.id === Number(id))
  
  if (!user) {
    return HttpResponse.json(
      { code: 404, message: '用户不存在', data: null },
      { status: 404 }
    )
  }
  
  return HttpResponse.json({ code: 200, message: '成功', data: user })
})
```

## 调试技巧

### 1. 查看网络请求

打开浏览器 DevTools → Network 标签，可以看到所有的 HTTP 请求（包括被 MSW 拦截的请求）。

被 MSW 拦截的请求会显示：
```
[MSW] GET /api/users (200 OK)
```

### 2. 启用详细日志

```typescript
worker.start({
  onUnhandledRequest: 'warn' // 未处理的请求会打印警告
})
```

### 3. 禁用 MSW

临时禁用 MSW 进行测试：

```typescript
// 方法 1: 修改环境变量
if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
  enableMocking()
}

// 方法 2: 注释掉 enableMocking() 调用
```

## 切换到真实后端

当后端 API 准备好后，只需：

1. **禁用 MSW**：
   ```typescript
   // src/main.ts
   // 注释掉或删除 enableMocking()
   // enableMocking().then(() => {
   //   ...
   // })
   
   // 直接启动应用
   const app = createApp(App)
   app.mount('#app')
   ```

2. **配置代理**（如果需要）：
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

3. **Store 代码无需修改**：因为 Store 已经使用真实的 HTTP 请求了！

## 常见问题

### Q1: 为什么看不到网络请求？

**A:** 确保：
1. MSW 已正确启动（检查浏览器控制台是否有 `[MSW] Mocking enabled` 消息）
2. Service Worker 已注册（检查 DevTools → Application → Service Workers）
3. 请求路径正确（检查 handlers 中的路径定义）

### Q2: 如何模拟分页数据？

**A:** 在 handler 中处理分页参数：

```typescript
http.get('/api/users', ({ request }) => {
  const url = new URL(request.url)
  const page = Number(url.searchParams.get('page')) || 1
  const pageSize = Number(url.searchParams.get('pageSize')) || 10
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = allUsers.slice(start, end)
  
  return HttpResponse.json({
    code: 200,
    data: {
      list,
      total: allUsers.length,
      page,
      pageSize
    }
  })
})
```

### Q3: 如何持久化数据？

**A:** MSW 的数据存储在内存中，刷新页面会丢失。如需持久化：

1. 使用 `localStorage`：
   ```typescript
   const getUsers = () => {
     const stored = localStorage.getItem('users')
     return stored ? JSON.parse(stored) : mockUsers
   }
   
   const saveUsers = (users: User[]) => {
     localStorage.setItem('users', JSON.stringify(users))
   }
   ```

2. 使用 IndexedDB（更适合大量数据）

### Q4: 如何同时使用 MSW 和真实 API？

**A:** 可以选择性地模拟某些 API：

```typescript
export const handlers = [
  // 模拟用户 API
  http.get('/api/users', ...),
  
  // 真实商品 API（不定义 handler，会直接请求真实后端）
]
```

## 最佳实践

1. **保持 handlers 简洁**：复杂的业务逻辑应该在后端实现
2. **使用真实的数据结构**：确保 mock 数据和真实数据结构一致
3. **模拟各种场景**：成功、失败、延迟、空数据等
4. **及时更新**：当后端 API 变化时，同步更新 mock handlers
5. **团队共享**：将 mock handlers 提交到代码仓库，团队成员共享

## 总结

使用 MSW 后，你的开发流程变为：

```
前端开发（MSW 模拟）
  ↓
后端 API 就绪
  ↓
禁用 MSW，切换到真实 API
  ↓
代码无需修改，直接使用！
```

MSW 让前后端分离开发更加顺畅，提高了开发效率！🚀

## 参考资源

- [MSW 官方文档](https://mswjs.io/)
- [MSW GitHub](https://github.com/mswjs/msw)
- [MSW Examples](https://github.com/mswjs/examples)

