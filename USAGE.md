# 项目使用指南

## 项目概览

这是一个完整的 Vue3 后台管理系统示例，演示了如何使用现代前端技术栈构建一个功能完整、结构清晰、低耦合的管理系统。

## 核心设计理念

### 1. 组件抽象

**通用 CRUD 组件 (`CrudTable.vue`)**

通过配置化的方式，实现了一个高度抽象的 CRUD 组件，只需传入配置对象即可快速实现：
- 数据表格展示
- 搜索功能
- 分页
- 新增/编辑/查看/删除操作
- 表单验证
- 批量操作

使用示例：

```typescript
const crudConfig: CrudConfig<User> = {
  searchFields: [
    { prop: 'name', label: '用户名', type: 'input' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '用户名', minWidth: 120 }
  ],
  formFields: [
    { prop: 'name', label: '用户名', type: 'input', required: true }
  ]
}
```

### 2. 状态管理

每个模块使用独立的 Pinia Store：
- `useUserStore` - 用户管理
- `useGoodsStore` - 商品管理

Store 职责：
- 管理模块数据
- 处理业务逻辑
- 封装 API 调用
- 提供统一的数据操作接口

### 3. 类型安全

完整的 TypeScript 类型定义：
- 业务模型类型 (`User`, `Goods`)
- 通用类型 (`ApiResponse`, `PageData`, `PageParams`)
- 配置类型 (`CrudConfig`, `TableColumn`)

### 4. 请求封装

统一的 Axios 请求封装 (`src/utils/request.ts`)：
- 请求拦截器（添加 token）
- 响应拦截器（统一错误处理）
- 统一的请求方法（get/post/put/delete）

## 项目特色功能

### 1. 用户管理

完整的用户 CRUD 操作，包括：
- 用户列表分页展示
- 按用户名、邮箱搜索
- 新增用户（表单验证：用户名、邮箱格式、手机号格式）
- 编辑用户信息
- 查看用户详情
- 删除单个用户
- 批量删除用户
- 用户状态管理（启用/禁用）

### 2. 商品管理

完整的商品 CRUD 操作，包括：
- 商品列表分页展示
- 按商品名称、分类搜索
- 新增商品（表单验证：必填项、描述长度）
- 编辑商品信息
- 查看商品详情
- 删除单个商品
- 批量删除商品
- 商品状态管理（上架/下架）
- 价格、库存管理

### 3. 通用功能

- **侧边栏导航**：基于路由自动生成
- **面包屑**：显示当前页面路径
- **响应式布局**：适配不同屏幕尺寸
- **数据模拟**：使用内存数据模拟后端 API
- **加载状态**：请求时显示 loading 效果
- **操作反馈**：成功/失败消息提示
- **确认对话框**：删除操作前的二次确认

## 代码结构说明

### 目录结构

```
src/
├── components/         # 公共组件
│   └── CrudTable.vue  # 通用 CRUD 表格组件
├── layout/            # 布局组件
│   └── index.vue      # 主布局（侧边栏 + 头部 + 内容区）
├── router/            # 路由配置
│   └── index.ts       # 路由定义
├── stores/            # Pinia 状态管理
│   ├── user.ts        # 用户模块
│   └── goods.ts       # 商品模块
├── types/             # TypeScript 类型定义
│   └── index.ts       # 通用类型
├── utils/             # 工具函数
│   ├── request.ts     # Axios 封装
│   └── mockData.ts    # 模拟数据
└── views/             # 页面组件
    ├── user/          # 用户管理
    └── goods/         # 商品管理
```

### 关键文件说明

**`src/components/CrudTable.vue`**
- 通用的增删改查组件
- 支持配置化开发
- 包含表格、搜索、表单、分页等功能

**`src/stores/user.ts` / `src/stores/goods.ts`**
- 模块独立的状态管理
- 封装业务逻辑
- 提供统一的数据操作接口

**`src/types/index.ts`**
- 所有 TypeScript 类型定义
- 保证类型安全

**`src/utils/request.ts`**
- Axios 实例配置
- 请求/响应拦截器
- 统一的错误处理

## 如何添加新模块

### 步骤 1：定义类型

在 `src/types/index.ts` 中添加新的数据类型：

```typescript
export interface Product {
  id?: number
  name: string
  price: number
  // ... 其他字段
}
```

### 步骤 2：创建 Store

在 `src/stores/` 中创建新的 store 文件：

```typescript
// src/stores/product.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, PageData, PageParams } from '@/types'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading = ref(false)

  const getProductList = async (params: PageParams): Promise<PageData<Product>> => {
    // 实现获取列表逻辑
  }

  const addProduct = async (product: Product): Promise<boolean> => {
    // 实现添加逻辑
  }

  const updateProduct = async (product: Product): Promise<boolean> => {
    // 实现更新逻辑
  }

  const deleteProduct = async (id: number): Promise<boolean> => {
    // 实现删除逻辑
  }

  return {
    products,
    loading,
    getProductList,
    addProduct,
    updateProduct,
    deleteProduct
  }
})
```

### 步骤 3：创建页面

在 `src/views/` 中创建新的模块目录和页面：

```vue
<!-- src/views/product/index.vue -->
<template>
  <crud-table
    :config="crudConfig"
    :loading="productStore.loading"
    @load="handleLoad"
    @add="handleAdd"
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { useProductStore } from '@/stores/product'
import CrudTable from '@/components/CrudTable.vue'
import type { CrudConfig, Product, PageData } from '@/types'

const productStore = useProductStore()

const crudConfig: CrudConfig<Product> = {
  searchFields: [
    { prop: 'name', label: '产品名称', type: 'input' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '产品名称', minWidth: 150 },
    { prop: 'price', label: '价格', width: 120 }
  ],
  formFields: [
    { prop: 'name', label: '产品名称', type: 'input', required: true },
    { prop: 'price', label: '价格', type: 'number', required: true }
  ]
}

const handleLoad = async (params: Record<string, unknown>): Promise<PageData<Product>> => {
  return await productStore.getProductList(params as PageParams)
}

const handleAdd = async (data: Product): Promise<boolean> => {
  return await productStore.addProduct(data)
}

const handleUpdate = async (data: Product): Promise<boolean> => {
  return await productStore.updateProduct(data)
}

const handleDelete = async (id: number): Promise<boolean> => {
  return await productStore.deleteProduct(id)
}
</script>
```

### 步骤 4：配置路由

在 `src/router/index.ts` 中添加路由：

```typescript
{
  path: '/product',
  name: 'Product',
  component: () => import('@/views/product/index.vue'),
  meta: { title: '产品管理', icon: 'Goods' }
}
```

完成！新模块就可以使用了。

## 实际项目应用建议

### 1. 对接后端 API

当前项目使用模拟数据，实际项目中需要：

1. 在 Store 中替换模拟逻辑为真实的 API 调用：

```typescript
// 使用 request 工具发起请求
import request from '@/utils/request'

const getUserList = async (params: PageParams): Promise<PageData<User>> => {
  loading.value = true
  try {
    const response = await request.get<PageData<User>>('/users', { params })
    return response.data
  } finally {
    loading.value = false
  }
}
```

2. 配置正确的 API 地址（修改 `vite.config.ts` 中的 proxy 配置）

### 2. 添加权限控制

1. 在路由中添加权限元信息：

```typescript
meta: { 
  title: '用户管理', 
  icon: 'User',
  roles: ['admin'] // 需要的角色
}
```

2. 添加路由守卫：

```typescript
router.beforeEach((to, from, next) => {
  // 检查用户权限
  const userRole = getUserRole()
  const requiredRoles = to.meta.roles as string[]
  
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    next('/403')
  } else {
    next()
  }
})
```

### 3. 添加登录功能

创建登录页面和用户认证 Store，管理登录状态和 token。

### 4. 优化和增强

- 添加图片上传功能
- 添加数据导入导出
- 添加图表统计
- 添加更多的表单控件类型
- 添加主题切换
- 添加多语言支持

## 常见问题

### Q: 如何修改表格列的显示格式？

A: 使用 `formatter` 属性或者 `slot`：

```typescript
// 方式1：使用 formatter
{
  prop: 'createTime',
  label: '创建时间',
  formatter: (row, column, cellValue) => {
    return dayjs(cellValue).format('YYYY-MM-DD HH:mm:ss')
  }
}

// 方式2：使用 slot
{
  prop: 'status',
  label: '状态',
  slot: 'status'
}

// 在模板中定义 slot
<template #status="{ row }">
  <el-tag :type="row.status === 1 ? 'success' : 'danger'">
    {{ row.status === 1 ? '启用' : '禁用' }}
  </el-tag>
</template>
```

### Q: 如何添加自定义的表单验证规则？

A: 在 formFields 配置中添加 rules：

```typescript
{
  prop: 'email',
  label: '邮箱',
  type: 'input',
  required: true,
  rules: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value && !value.endsWith('@company.com')) {
          callback(new Error('必须使用公司邮箱'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}
```

### Q: 如何自定义操作按钮？

A: CrudTable 组件暴露了操作列的插槽，可以通过扩展组件实现。

### Q: 数据如何持久化？

A: 当前使用内存存储，刷新后数据会重置。实际项目中需要对接后端 API 进行数据持久化。

## 技术栈详细说明

- **Vue 3.4+**：使用 Composition API 和 `<script setup>` 语法
- **TypeScript 5.3+**：完整的类型支持
- **Vite 5.0+**：快速的开发服务器和构建工具
- **Element Plus 2.5+**：丰富的 UI 组件库
- **Vue Router 4.2+**：官方路由管理
- **Pinia 2.1+**：新一代状态管理
- **Axios 1.6+**：HTTP 请求库
- **ESLint 8.56+**：代码质量检查
- **Prettier 3.1+**：代码格式化

## 总结

这个项目展示了如何构建一个：
- ✅ 结构清晰的 Vue3 项目
- ✅ 高度抽象的通用组件
- ✅ 低耦合的模块设计
- ✅ 类型安全的 TypeScript 代码
- ✅ 易于扩展和维护的代码结构

希望这个项目能为你的实际开发提供参考和帮助！

