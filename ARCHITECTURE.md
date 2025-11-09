# 项目架构设计文档

## 1. 整体架构

本项目采用经典的 **MVVM (Model-View-ViewModel)** 架构模式，结合 Vue 3 Composition API 和 TypeScript，实现了高内聚、低耦合的代码结构。

```
┌─────────────────────────────────────────────────────────┐
│                         View                             │
│                    (Vue Components)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  User Page   │  │  Goods Page  │  │ CrudTable    │  │
│  │              │  │              │  │ (Generic)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                      ViewModel                           │
│                    (Pinia Stores)                        │
│  ┌──────────────┐           ┌──────────────┐           │
│  │  UserStore   │           │  GoodsStore  │           │
│  │  - state     │           │  - state     │           │
│  │  - actions   │           │  - actions   │           │
│  └──────────────┘           └──────────────┘           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                        Model                             │
│                   (API / Data Layer)                     │
│  ┌──────────────┐           ┌──────────────┐           │
│  │   Request    │           │   MockData   │           │
│  │   (Axios)    │           │              │           │
│  └──────────────┘           └──────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## 2. 分层设计

### 2.1 展示层 (Presentation Layer)

**职责：** 负责 UI 渲染和用户交互

**组成：**
- **页面组件 (Views)**: `src/views/user/`, `src/views/goods/`
  - 配置 CRUD 表格
  - 定义业务逻辑处理函数
  - 调用 Store 中的方法

- **通用组件 (Components)**: `src/components/`
  - `CrudTable.vue`: 高度抽象的 CRUD 组件
  - 可复用、可配置、支持泛型

- **布局组件 (Layout)**: `src/layout/`
  - 主布局框架
  - 侧边栏导航
  - 头部面包屑

**设计原则：**
- 组件保持纯粹，不直接处理业务逻辑
- 通过 props 和 events 与父组件通信
- 使用 TypeScript 泛型提高复用性

### 2.2 业务逻辑层 (Business Logic Layer)

**职责：** 管理应用状态和业务逻辑

**组成：**
- **Pinia Stores**: `src/stores/`
  - 每个模块独立的 Store
  - 管理模块数据状态
  - 封装业务操作（CRUD）
  - 调用 API 接口

**设计原则：**
- 单一职责：每个 Store 只负责一个业务模块
- 依赖注入：通过 Composition API 方式使用
- 异步处理：所有 API 调用都是异步的

### 2.3 数据访问层 (Data Access Layer)

**职责：** 处理数据请求和响应

**组成：**
- **API 封装**: `src/utils/request.ts`
  - Axios 实例配置
  - 请求/响应拦截器
  - 统一错误处理
  - Token 自动注入

- **模拟数据**: `src/utils/mockData.ts`
  - 开发阶段的数据模拟
  - 便于前端独立开发

**设计原则：**
- 统一的请求接口
- 自动化的错误处理
- 支持请求拦截和响应拦截

## 3. 核心设计模式

### 3.1 配置化编程 (Configuration-Driven)

通过配置对象驱动组件行为，减少重复代码：

```typescript
const crudConfig: CrudConfig<User> = {
  searchFields: [...],  // 搜索字段配置
  columns: [...],       // 表格列配置
  formFields: [...]     // 表单字段配置
}
```

**优点：**
- 减少代码重复
- 提高开发效率
- 易于维护和修改
- 统一的行为表现

### 3.2 泛型编程 (Generic Programming)

使用 TypeScript 泛型提高代码复用性：

```typescript
// CrudTable 组件支持任意类型
<crud-table<User> :config="crudConfig" />

// Store 方法支持泛型
interface PageData<T> {
  list: T[]
  total: number
}
```

**优点：**
- 类型安全
- 代码复用
- 编译时错误检查

### 3.3 依赖注入 (Dependency Injection)

通过 Composition API 实现依赖注入：

```typescript
// 使用 store
const userStore = useUserStore()

// 使用 router
const router = useRouter()
```

**优点：**
- 松耦合
- 易于测试
- 灵活性高

### 3.4 观察者模式 (Observer Pattern)

通过 Vue 的响应式系统实现：

```typescript
// 响应式状态
const users = ref<User[]>([])

// 自动更新 UI
watch(users, (newValue) => {
  // 响应变化
})
```

## 4. 模块设计

### 4.1 用户模块 (User Module)

```
src/views/user/
  └── index.vue           # 页面组件
src/stores/
  └── user.ts            # 状态管理
```

**职责划分：**
- **页面组件**: 配置表格、处理用户交互
- **Store**: 管理用户数据、执行 CRUD 操作

**数据流：**
```
User Action → Page Component → Store → API → Store → Update View
```

### 4.2 商品模块 (Goods Module)

```
src/views/goods/
  └── index.vue          # 页面组件
src/stores/
  └── goods.ts          # 状态管理
```

**设计与用户模块完全一致，保证代码风格统一**

### 4.3 通用模块 (Common Module)

```
src/components/
  └── CrudTable.vue      # 通用 CRUD 组件
src/utils/
  ├── request.ts         # API 请求封装
  └── mockData.ts        # 模拟数据
src/types/
  └── index.ts           # 类型定义
```

## 5. 数据流设计

### 5.1 查询流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   View   │───▶│  Store   │───▶│   API    │───▶│ Backend  │
│          │    │          │    │          │    │          │
│          │◀───│          │◀───│          │◀───│          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
   1. 触发         2. 调用         3. 请求         4. 返回
   查询            方法            数据            数据
```

### 5.2 新增/编辑流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Form   │───▶│  Store   │───▶│   API    │───▶│ Backend  │
│          │    │          │    │          │    │          │
│          │◀───│          │◀───│          │◀───│          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
   1. 提交         2. 验证         3. 保存         4. 确认
   表单            数据            数据            结果

   5. 刷新列表
   ▼
┌──────────┐
│  Table   │
│          │
└──────────┘
```

### 5.3 删除流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Confirm │───▶│  Store   │───▶│   API    │
│  Dialog  │    │          │    │          │
│          │◀───│          │◀───│          │
└──────────┘    └──────────┘    └──────────┘
   1. 确认         2. 执行         3. 删除
   删除            删除            数据

   4. 刷新列表
```

## 6. 类型系统设计

### 6.1 业务类型

```typescript
// 用户类型
interface User {
  id?: number
  name: string
  email: string
  // ...
}

// 商品类型
interface Goods {
  id?: number
  name: string
  price: number
  // ...
}
```

### 6.2 通用类型

```typescript
// API 响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 分页类型
interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```

### 6.3 配置类型

```typescript
// CRUD 配置类型
interface CrudConfig<T> {
  columns: TableColumn[]
  searchFields: SearchField[]
  formFields: FormField[]
}
```

## 7. 路由设计

### 7.1 路由结构

```
/                          # 根路由
├── /user                  # 用户管理
└── /goods                 # 商品管理
```

### 7.2 路由配置

```typescript
{
  path: '/',
  component: Layout,       // 使用布局组件
  children: [
    {
      path: '/user',
      name: 'User',
      component: UserPage,
      meta: { 
        title: '用户管理',
        icon: 'User'
      }
    }
  ]
}
```

### 7.3 路由元信息

- `title`: 页面标题（用于面包屑）
- `icon`: 菜单图标
- `roles`: 权限角色（预留）

## 8. 状态管理设计

### 8.1 Store 结构

```typescript
export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref<User[]>([])
  const loading = ref(false)
  
  // 操作
  const getUserList = async () => { /* ... */ }
  const addUser = async () => { /* ... */ }
  const updateUser = async () => { /* ... */ }
  const deleteUser = async () => { /* ... */ }
  
  // 导出
  return { users, loading, getUserList, addUser, updateUser, deleteUser }
})
```

### 8.2 Store 职责

- **状态管理**: 管理模块的所有状态
- **业务逻辑**: 处理复杂的业务逻辑
- **API 调用**: 封装 API 请求
- **错误处理**: 统一处理错误

## 9. 组件通信设计

### 9.1 父子组件通信

```vue
<!-- 父组件 -->
<crud-table
  :config="crudConfig"          <!-- Props 向下传递 -->
  @load="handleLoad"            <!-- Events 向上传递 -->
/>

<!-- 子组件 -->
<script setup>
const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

### 9.2 跨组件通信

使用 Pinia Store 进行状态共享：

```typescript
// 在任意组件中
const userStore = useUserStore()
const users = userStore.users  // 访问共享状态
```

## 10. 错误处理设计

### 10.1 API 错误处理

```typescript
// 在 request.ts 中统一处理
service.interceptors.response.use(
  (response) => {
    // 成功响应
    return response
  },
  (error) => {
    // 统一错误处理
    ElMessage.error(error.message)
    return Promise.reject(error)
  }
)
```

### 10.2 业务错误处理

```typescript
// 在 Store 中处理业务错误
try {
  await api.request()
} catch (error) {
  // 处理错误
  console.error(error)
  return false
}
```

### 10.3 表单验证

使用 Element Plus 的表单验证：

```typescript
formFields: [
  {
    prop: 'email',
    label: '邮箱',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '格式错误', trigger: 'blur' }
    ]
  }
]
```

## 11. 性能优化设计

### 11.1 按需加载

```typescript
// 路由懒加载
component: () => import('@/views/user/index.vue')
```

### 11.2 组件懒加载

```typescript
// 组件异步加载
const AsyncComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
)
```

### 11.3 虚拟滚动

对于大数据量表格，可以集成虚拟滚动：

```typescript
// 可以使用 el-table-v2 或 vxe-table
```

## 12. 可扩展性设计

### 12.1 新增模块

按照现有模块的结构，只需：
1. 定义类型
2. 创建 Store
3. 创建页面
4. 配置路由

### 12.2 扩展功能

- **图片上传**: 在 formFields 中添加 upload 类型
- **富文本编辑**: 集成富文本编辑器组件
- **导入导出**: 在工具栏添加导入导出按钮
- **批量操作**: 利用表格的 selection 功能

### 12.3 主题定制

```typescript
// 可以使用 Element Plus 的主题定制
import { ElConfigProvider } from 'element-plus'

// 自定义主题变量
```

## 13. 安全性设计

### 13.1 XSS 防护

- Vue 自动转义 HTML
- 使用 `v-text` 而不是 `v-html`

### 13.2 CSRF 防护

```typescript
// 在请求头中添加 CSRF Token
headers: {
  'X-CSRF-Token': getCsrfToken()
}
```

### 13.3 权限控制

```typescript
// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查权限
  if (hasPermission(to)) {
    next()
  } else {
    next('/403')
  }
})
```

## 14. 测试设计

### 14.1 单元测试

```typescript
// 测试 Store
describe('UserStore', () => {
  it('should add user', async () => {
    const store = useUserStore()
    const result = await store.addUser(mockUser)
    expect(result).toBe(true)
  })
})
```

### 14.2 组件测试

```typescript
// 测试组件
import { mount } from '@vue/test-utils'

describe('CrudTable', () => {
  it('renders table correctly', () => {
    const wrapper = mount(CrudTable, { props: { config } })
    expect(wrapper.find('.el-table').exists()).toBe(true)
  })
})
```

## 15. 部署架构

```
┌─────────────────────────────────────────┐
│            Nginx / Apache               │
│         (Static File Server)            │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│          Vue3 Application               │
│        (Built with Vite)                │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│         Backend API Server              │
│      (Node.js / Java / Python)          │
└─────────────────────────────────────────┘
```

## 总结

本项目的架构设计遵循以下原则：

1. **单一职责**: 每个模块、组件只负责一件事
2. **开放封闭**: 对扩展开放，对修改封闭
3. **依赖倒置**: 依赖抽象而不是具体实现
4. **接口隔离**: 使用最小化的接口
5. **DRY 原则**: 不重复自己（Don't Repeat Yourself）

这样的设计使得项目：
- ✅ 易于理解和上手
- ✅ 易于维护和扩展
- ✅ 代码质量高
- ✅ 团队协作友好
- ✅ 长期可持续发展

