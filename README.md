# Vue3 Admin Demo

一个基于 Vue3 + TypeScript + Vite + Element Plus 的后台管理系统示例项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Vite** - 下一代前端构建工具
- **Element Plus** - 基于 Vue 3 的组件库
- **Vue Router** - Vue.js 的官方路由管理器
- **Pinia** - Vue 的状态管理库
- **Axios** - 基于 Promise 的 HTTP 客户端
- **MSW** - Mock Service Worker，模拟 API 请求
- **ESLint** - 代码质量检查工具
- **Prettier** - 代码格式化工具

## 项目结构

```
cursor-vue3-kuangjia-demo/
├── src/
│   ├── assets/             # 静态资源
│   ├── components/         # 公共组件
│   │   └── CrudTable.vue  # 通用 CRUD 表格组件
│   ├── layout/            # 布局组件
│   │   └── index.vue      # 主布局
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义
│   ├── stores/            # Pinia 状态管理
│   │   ├── user.ts        # 用户状态
│   │   └── goods.ts       # 商品状态
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts       # 通用类型
│   ├── utils/             # 工具函数
│   │   ├── request.ts     # Axios 封装
│   │   └── mockData.ts    # 模拟数据
│   ├── mocks/             # MSW 模拟 API
│   │   ├── handlers.ts    # API 处理器
│   │   └── browser.ts     # Service Worker 配置
│   ├── views/             # 页面组件
│   │   ├── user/          # 用户管理模块
│   │   │   └── index.vue
│   │   └── goods/         # 商品管理模块
│   │       └── index.vue
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   └── vite-env.d.ts      # Vite 类型声明
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc.json       # Prettier 配置
└── README.md              # 项目说明
```

## 功能特性

### 1. 用户管理模块

- ✅ 用户列表展示（分页）
- ✅ 搜索功能（用户名、邮箱）
- ✅ 新增用户
- ✅ 编辑用户
- ✅ 查看用户详情
- ✅ 删除用户
- ✅ 批量删除
- ✅ 表单验证

### 2. 商品管理模块

- ✅ 商品列表展示（分页）
- ✅ 搜索功能（商品名称、分类）
- ✅ 新增商品
- ✅ 编辑商品
- ✅ 查看商品详情
- ✅ 删除商品
- ✅ 批量删除
- ✅ 表单验证

### 3. 公共功能

- ✅ 通用 CRUD 表格组件
- ✅ 统一的 API 请求封装
- ✅ MSW 模拟 API 接口（真实的网络请求）
- ✅ 路由配置
- ✅ 状态管理（Pinia）
- ✅ 侧边栏导航
- ✅ 面包屑导航
- ✅ 响应式布局

## 项目亮点

### 1. 低耦合设计

- **三层架构**：View 层、Store 层、API 层职责分离
- **API 层独立**：使用泛型基类 `BaseApi` 抽象所有 CRUD 操作
- **组件化**：通用 CRUD 组件 `CrudTable.vue`，通过配置化的方式实现不同模块的增删改查
- **状态隔离**：每个模块使用独立的 Store，互不影响
- **类型安全**：完整的 TypeScript 类型定义，提供良好的开发体验

### 2. 高度抽象

- **通用 CRUD 基类**：所有实体的增删改查只需继承 `BaseApi`
- **通用 CRUD 组件**：统一的表格、表单、分页、搜索功能
- **请求封装**：统一的 Axios 请求拦截器和错误处理
- **MSW API 模拟**：真实的网络请求，无侵入式 Mock
- **配置化开发**：通过配置对象即可快速创建 CRUD 页面

### 3. 良好的项目结构

- **清晰的三层架构**：API 层 → Store 层 → View 层
- **清晰的目录结构**：按功能模块划分，易于维护和扩展
- **代码规范**：ESLint + Prettier 保证代码质量
- **类型定义**：统一的类型管理，提高代码可维护性

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 如何扩展新模块

### 1. 定义类型

在 `src/types/index.ts` 中添加新的类型定义：

```typescript
export interface YourModel {
  id?: number
  name: string
  // ... 其他字段
}
```

### 2. 创建 Store

在 `src/stores/` 中创建新的 store 文件：

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { YourModel, PageData, PageParams } from '@/types'

export const useYourStore = defineStore('your-module', () => {
  const data = ref<YourModel[]>([])
  
  const getList = async (params: PageParams): Promise<PageData<YourModel>> => {
    // 实现获取列表逻辑
  }
  
  // ... 其他 CRUD 方法
  
  return { data, getList, /* ... */ }
})
```

### 3. 创建页面

在 `src/views/` 中创建新的模块目录和页面：

```vue
<template>
  <crud-table
    :config="crudConfig"
    :loading="store.loading"
    @load="handleLoad"
    @add="handleAdd"
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { useYourStore } from '@/stores/your-module'
import CrudTable from '@/components/CrudTable.vue'
import type { CrudConfig, YourModel } from '@/types'

const store = useYourStore()

const crudConfig: CrudConfig<YourModel> = {
  // 配置搜索字段、表格列、表单字段
}

// 实现处理函数
</script>
```

### 4. 配置路由

在 `src/router/index.ts` 中添加路由：

```typescript
{
  path: '/your-module',
  name: 'YourModule',
  component: () => import('@/views/your-module/index.vue'),
  meta: { title: '模块名称', icon: 'Document' }
}
```

## MSW API 模拟

项目使用 **MSW (Mock Service Worker)** 来模拟后端 API，提供真实的网络请求体验：

- ✅ **真实的 HTTP 请求**：可以在浏览器 DevTools 中看到网络请求
- ✅ **无侵入性**：业务代码使用真实的 API 调用，无需修改
- ✅ **开发体验好**：模拟各种网络状态（成功、失败、延迟）
- ✅ **易于切换**：后端就绪后，禁用 MSW 即可使用真实 API

**详细说明：** 查看 [MSW_GUIDE.md](./MSW_GUIDE.md)

**切换到真实后端：**

1. 在 `src/main.ts` 中注释掉 `enableMocking()`
2. 配置 `vite.config.ts` 中的 proxy 指向真实后端
3. 无需修改任何业务代码！

## 注意事项

1. **数据持久化**：当前 MSW 使用内存存储，页面刷新后数据会重置。可以通过 localStorage 持久化。

2. **API 接口**：所有 API 接口定义在 `src/mocks/handlers.ts`，详见 [MSW_GUIDE.md](./MSW_GUIDE.md)。

3. **权限管理**：当前未实现权限控制，实际项目中需要添加路由守卫和权限验证。

4. **环境变量**：可以在项目根目录创建 `.env.development` 和 `.env.production` 文件配置不同环境的变量。

## 开发建议

1. 遵循 Vue 3 Composition API 编码规范
2. 使用 TypeScript 进行类型约束
3. 组件保持单一职责
4. 及时运行 `npm run lint` 检查代码质量
5. 使用 `npm run format` 统一代码风格

## License

MIT

