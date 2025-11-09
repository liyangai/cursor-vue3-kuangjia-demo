# API 架构设计文档

## 架构概览

项目采用 **三层架构**，实现了职责分离和低耦合：

```
┌─────────────────────────────────────────────────────────┐
│                    View 层（视图层）                      │
│  - 用户交互                                              │
│  - 数据展示                                              │
│  - 调用 Store                                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Store 层（状态管理层）                   │
│  - 管理应用状态                                           │
│  - 缓存数据                                              │
│  - 调用 API 层                                           │
│  - 更新本地状态                                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    API 层（数据访问层）                    │
│  - 封装 HTTP 请求                                         │
│  - 处理请求/响应                                          │
│  - 统一错误处理                                           │
│  - 通用 CRUD 抽象                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
                [后端 API / MSW Mock]
```

## 目录结构

```
src/
├── api/                      # API 层
│   ├── base.ts              # 通用 CRUD 基类
│   ├── user.ts              # 用户 API
│   ├── goods.ts             # 商品 API
│   └── index.ts             # 统一导出
├── stores/                   # Store 层
│   ├── user.ts              # 用户状态管理
│   └── goods.ts             # 商品状态管理
└── views/                    # View 层
    ├── user/                # 用户管理页面
    └── goods/               # 商品管理页面
```

## API 层设计

### 1. 通用 CRUD 基类 (`base.ts`)

使用 **泛型类** 抽象所有的增删改查操作：

```typescript
export class BaseApi<T> {
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // 获取列表（支持分页和搜索）
  async getList(params: PageParams & Partial<T>): Promise<PageData<T>>

  // 根据 ID 获取详情
  async getById(id: number): Promise<T>

  // 创建
  async create(data: T): Promise<T>

  // 更新
  async update(id: number, data: T): Promise<T>

  // 删除
  async delete(id: number): Promise<void>

  // 批量删除
  async batchDelete(ids: number[]): Promise<void>
}
```

**优势：**
- ✅ **代码复用**：所有实体的 CRUD 操作只需写一次
- ✅ **类型安全**：泛型保证类型正确
- ✅ **易于扩展**：新增实体只需继承基类
- ✅ **统一规范**：所有 API 接口保持一致

### 2. 具体 API 类

继承 `BaseApi` 并添加特定业务方法：

```typescript
// user.ts
class UserApi extends BaseApi<User> {
  constructor() {
    super('/users')  // 指定基础路径
  }

  // 用户特有的方法
  async updateStatus(id: number, status: number): Promise<User> {
    return await this.update(id, { status } as User)
  }
}

export const userApi = new UserApi()
```

```typescript
// goods.ts
class GoodsApi extends BaseApi<Goods> {
  constructor() {
    super('/goods')
  }

  // 商品特有的方法
  async updateStatus(id: number, status: number): Promise<Goods> {
    return await this.update(id, { status } as Goods)
  }

  async batchUpdatePrice(ids: number[], price: number): Promise<void> {
    await Promise.all(ids.map(id => this.update(id, { price } as Goods)))
  }
}

export const goodsApi = new GoodsApi()
```

## Store 层重构

### 重构前（耦合）

```typescript
// ❌ Store 直接调用 request，职责不清
export const useUserStore = defineStore('user', () => {
  const getUserList = async (params: PageParams) => {
    // 直接调用 request
    const response = await request.get<PageData<User>>('/users', { params })
    return response.data
  }

  const addUser = async (user: User) => {
    // 直接调用 request
    await request.post<User>('/users', user)
    return true
  }
})
```

**问题：**
- ❌ Store 需要知道 API 的细节（URL、请求方法）
- ❌ 难以复用（每个 Store 都要写相似的代码）
- ❌ 难以测试（Store 和 HTTP 请求强耦合）
- ❌ 难以切换数据源（例如从 REST API 切换到 GraphQL）

### 重构后（解耦）

```typescript
// ✅ Store 只管理状态，调用 API 层
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  const getUserList = async (params: PageParams) => {
    loading.value = true
    try {
      const data = await userApi.getList(params)  // 调用 API 层
      users.value = data.list  // 更新本地状态
      return data
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addUser = async (user: User) => {
    loading.value = true
    try {
      const newUser = await userApi.create(user)  // 调用 API 层
      users.value.unshift(newUser)  // 更新本地状态
      return true
    } catch (error) {
      console.error('添加用户失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return { users, loading, getUserList, addUser }
})
```

**优势：**
- ✅ **职责清晰**：Store 只负责状态管理
- ✅ **易于复用**：API 层可以在任何地方使用
- ✅ **易于测试**：可以 mock API 层
- ✅ **易于切换**：只需修改 API 层实现

## 使用示例

### 1. 在 View 中使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 加载数据
const handleLoad = async (params: PageParams) => {
  return await userStore.getUserList(params)
}

// 添加用户
const handleAdd = async (user: User) => {
  return await userStore.addUser(user)
}
</script>
```

### 2. 直接使用 API 层（不需要状态管理时）

```typescript
import { userApi } from '@/api'

// 直接调用 API，不通过 Store
const users = await userApi.getList({ page: 1, pageSize: 10 })
const user = await userApi.getById(1)
await userApi.create(newUser)
```

### 3. 添加新的实体

只需 3 步：

```typescript
// 1. 定义类型
interface Product {
  id?: number
  name: string
  price: number
}

// 2. 创建 API 类
class ProductApi extends BaseApi<Product> {
  constructor() {
    super('/products')
  }
}
export const productApi = new ProductApi()

// 3. 创建 Store（可选）
export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  
  const getProductList = async (params: PageParams) => {
    const data = await productApi.getList(params)
    products.value = data.list
    return data
  }
  
  return { products, getProductList }
})
```

## 架构优势

### 1. **低耦合**

```
View 层 ──调用──> Store 层 ──调用──> API 层 ──调用──> 后端
  │                │                │
  └── 不知道 Store 如何实现        └── 不知道 API 细节
      只关心接口                      只关心业务逻辑
```

### 2. **高内聚**

- **API 层**：只负责 HTTP 请求
- **Store 层**：只负责状态管理
- **View 层**：只负责 UI 展示

### 3. **易于测试**

```typescript
// 测试 API 层
describe('UserApi', () => {
  it('should get user list', async () => {
    const data = await userApi.getList({ page: 1, pageSize: 10 })
    expect(data.list).toBeDefined()
  })
})

// 测试 Store 层（mock API）
describe('UserStore', () => {
  it('should update users state', async () => {
    vi.mock('@/api', () => ({
      userApi: {
        getList: vi.fn().mockResolvedValue({ list: [...], total: 10 })
      }
    }))
    
    const store = useUserStore()
    await store.getUserList({ page: 1, pageSize: 10 })
    expect(store.users.length).toBeGreaterThan(0)
  })
})
```

### 4. **易于维护**

- 修改 API 实现：只需修改 API 层
- 修改状态逻辑：只需修改 Store 层
- 修改 UI 展示：只需修改 View 层

### 5. **易于扩展**

```typescript
// 添加缓存层
class CachedUserApi extends UserApi {
  private cache = new Map()
  
  async getById(id: number) {
    if (this.cache.has(id)) {
      return this.cache.get(id)
    }
    const user = await super.getById(id)
    this.cache.set(id, user)
    return user
  }
}

// 添加日志层
class LoggedUserApi extends UserApi {
  async getList(params: PageParams) {
    console.log('Getting user list:', params)
    const result = await super.getList(params)
    console.log('Got user list:', result)
    return result
  }
}
```

## 数据流

### 查询流程

```
1. View 触发查询
   ↓
2. Store.getUserList(params)
   ↓
3. userApi.getList(params)
   ↓
4. request.get('/users', { params })
   ↓
5. MSW 拦截 / 真实后端
   ↓
6. 返回数据
   ↓
7. API 层返回给 Store
   ↓
8. Store 更新状态
   ↓
9. View 自动更新
```

### 创建流程

```
1. View 提交表单
   ↓
2. Store.addUser(user)
   ↓
3. userApi.create(user)
   ↓
4. request.post('/users', user)
   ↓
5. MSW 拦截 / 真实后端
   ↓
6. 返回新创建的 user
   ↓
7. API 层返回给 Store
   ↓
8. Store 添加到列表并更新状态
   ↓
9. View 自动显示新数据
```

## 对比总结

| 方面 | 重构前 | 重构后 |
|------|--------|--------|
| **职责划分** | ❌ Store 包含 API 逻辑 | ✅ API 层独立 |
| **代码复用** | ❌ 每个 Store 重复 CRUD | ✅ BaseApi 统一抽象 |
| **类型安全** | ⚠️ 部分类型检查 | ✅ 完整的泛型支持 |
| **易于测试** | ❌ Store 和 HTTP 耦合 | ✅ 可以单独测试每层 |
| **易于维护** | ❌ 修改影响多处 | ✅ 修改只影响单层 |
| **易于扩展** | ❌ 添加实体需要重复代码 | ✅ 继承 BaseApi 即可 |

## 最佳实践

1. **API 层**
   - ✅ 只处理 HTTP 请求
   - ✅ 使用泛型保证类型安全
   - ✅ 统一错误处理
   - ❌ 不要在 API 层管理状态

2. **Store 层**
   - ✅ 只管理应用状态
   - ✅ 调用 API 层获取数据
   - ✅ 更新本地缓存
   - ❌ 不要直接调用 request

3. **View 层**
   - ✅ 只关注 UI 展示
   - ✅ 调用 Store 获取数据
   - ✅ 响应用户交互
   - ❌ 不要直接调用 API 层（除非不需要状态管理）

## 总结

通过引入 API 层并抽象通用 CRUD 逻辑，我们实现了：

- ✅ **解耦**：API、Store、View 各司其职
- ✅ **复用**：通用逻辑只写一次
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **易于测试**：每一层都可以独立测试
- ✅ **易于维护**：修改影响范围小
- ✅ **易于扩展**：添加新功能简单快速

这是一个 **生产级别** 的架构设计！🎉

