# 快速启动指南

## 1. 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0（或 yarn / pnpm）

## 2. 安装步骤

### 步骤 1: 克隆项目（如果需要）

```bash
# 如果是从 Git 克隆
git clone <repository-url>
cd cursor-vue3-kuangjia-demo
```

### 步骤 2: 安装依赖

```bash
npm install
```

这将安装所有必要的依赖包，包括：
- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- TypeScript
- Vite
- ESLint & Prettier

### 步骤 3: 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动，浏览器会自动打开。

## 3. 项目结构说明

```
cursor-vue3-kuangjia-demo/
├── src/                    # 源代码目录
│   ├── components/         # 公共组件
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态管理
│   ├── types/             # TypeScript 类型
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── public/                # 静态资源
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明
```

## 4. 功能演示

### 用户管理模块

访问 `http://localhost:3000/user`

**功能：**
- ✅ 查看用户列表（分页）
- ✅ 搜索用户（按用户名、邮箱）
- ✅ 新增用户
- ✅ 编辑用户
- ✅ 查看用户详情
- ✅ 删除用户
- ✅ 批量删除

**操作步骤：**
1. 点击"新增"按钮，填写用户信息
2. 表单会自动验证（用户名、邮箱格式、手机号格式）
3. 点击"确定"保存
4. 在列表中可以看到新增的用户
5. 点击"编辑"可以修改用户信息
6. 点击"删除"可以删除用户

### 商品管理模块

访问 `http://localhost:3000/goods`

**功能：**
- ✅ 查看商品列表（分页）
- ✅ 搜索商品（按商品名称、分类）
- ✅ 新增商品
- ✅ 编辑商品
- ✅ 查看商品详情
- ✅ 删除商品
- ✅ 批量删除

**操作步骤：**
1. 点击"新增"按钮，填写商品信息
2. 选择商品分类、输入价格和库存
3. 表单会自动验证必填项
4. 点击"确定"保存
5. 商品会显示在列表中，价格以红色高亮显示

## 5. 开发指南

### 5.1 如何添加新的模块

**示例：添加"订单管理"模块**

#### 1. 定义类型 (`src/types/index.ts`)

```typescript
export interface Order {
  id?: number
  orderNo: string
  userName: string
  totalAmount: number
  status: number
  createTime?: string
}
```

#### 2. 创建 Store (`src/stores/order.ts`)

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, PageData, PageParams } from '@/types'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const loading = ref(false)

  const getOrderList = async (params: PageParams): Promise<PageData<Order>> => {
    // 实现获取订单列表的逻辑
  }

  const addOrder = async (order: Order): Promise<boolean> => {
    // 实现添加订单的逻辑
  }

  const updateOrder = async (order: Order): Promise<boolean> => {
    // 实现更新订单的逻辑
  }

  const deleteOrder = async (id: number): Promise<boolean> => {
    // 实现删除订单的逻辑
  }

  return {
    orders,
    loading,
    getOrderList,
    addOrder,
    updateOrder,
    deleteOrder
  }
})
```

#### 3. 创建页面 (`src/views/order/index.vue`)

```vue
<template>
  <crud-table
    :config="crudConfig"
    :loading="orderStore.loading"
    @load="handleLoad"
    @add="handleAdd"
    @update="handleUpdate"
    @delete="handleDelete"
  />
</template>

<script setup lang="ts">
import { useOrderStore } from '@/stores/order'
import CrudTable from '@/components/CrudTable.vue'
import type { CrudConfig, Order, PageData } from '@/types'

const orderStore = useOrderStore()

const crudConfig: CrudConfig<Order> = {
  searchFields: [
    { prop: 'orderNo', label: '订单号', type: 'input' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'orderNo', label: '订单号', minWidth: 150 },
    { prop: 'userName', label: '用户', width: 120 },
    { prop: 'totalAmount', label: '金额', width: 120 },
    { prop: 'status', label: '状态', width: 100 },
    { prop: 'createTime', label: '创建时间', width: 180 }
  ],
  formFields: [
    { prop: 'orderNo', label: '订单号', type: 'input', required: true },
    { prop: 'userName', label: '用户', type: 'input', required: true },
    { prop: 'totalAmount', label: '金额', type: 'number', required: true },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { label: '待付款', value: 0 },
        { label: '已付款', value: 1 },
        { label: '已完成', value: 2 }
      ]
    }
  ]
}

const handleLoad = async (params: Record<string, unknown>): Promise<PageData<Order>> => {
  return await orderStore.getOrderList(params as PageParams)
}

const handleAdd = async (data: Order): Promise<boolean> => {
  return await orderStore.addOrder(data)
}

const handleUpdate = async (data: Order): Promise<boolean> => {
  return await orderStore.updateOrder(data)
}

const handleDelete = async (id: number): Promise<boolean> => {
  return await orderStore.deleteOrder(id)
}
</script>
```

#### 4. 添加路由 (`src/router/index.ts`)

```typescript
{
  path: '/order',
  name: 'Order',
  component: () => import('@/views/order/index.vue'),
  meta: { title: '订单管理', icon: 'Document' }
}
```

完成！新模块就可以使用了。

### 5.2 如何自定义表格列显示

**使用 slot 自定义显示：**

```vue
<template>
  <crud-table :config="crudConfig" @load="handleLoad">
    <!-- 自定义状态列 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
    
    <!-- 自定义价格列 -->
    <template #price="{ row }">
      <span style="color: red; font-weight: bold">
        ¥{{ row.price.toFixed(2) }}
      </span>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
const crudConfig = {
  columns: [
    { prop: 'status', label: '状态', width: 100, slot: 'status' },
    { prop: 'price', label: '价格', width: 120, slot: 'price' }
  ],
  // ...
}
</script>
```

### 5.3 如何添加表单验证规则

```typescript
formFields: [
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
]
```

## 6. 常用命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 7. 开发调试

### 7.1 Vue DevTools

安装 [Vue DevTools](https://devtools.vuejs.org/) 浏览器扩展，可以：
- 查看组件树
- 检查组件状态
- 调试 Pinia Store
- 查看路由信息

### 7.2 VSCode 插件推荐

- **Volar**: Vue 3 官方插件
- **TypeScript Vue Plugin (Volar)**: TypeScript 支持
- **ESLint**: 代码检查
- **Prettier**: 代码格式化
- **Auto Rename Tag**: 自动重命名标签
- **Path Intellisense**: 路径智能提示

### 7.3 调试技巧

```typescript
// 1. 使用 console.log
console.log('数据：', data)

// 2. 使用 debugger
debugger

// 3. 使用 Vue DevTools
// 在浏览器中打开 DevTools，切换到 Vue 标签

// 4. 检查网络请求
// 在浏览器 DevTools 的 Network 标签中查看 API 请求
```

## 8. 常见问题

### Q1: 端口被占用怎么办？

**解决方法：** 修改 `vite.config.ts` 中的端口号

```typescript
server: {
  port: 3001,  // 改为其他端口
  // ...
}
```

### Q2: 如何对接真实的后端 API？

**解决方法：**

1. 修改 `vite.config.ts` 中的 proxy 配置：

```typescript
proxy: {
  '/api': {
    target: 'http://your-backend-url.com',  // 修改为真实的后端地址
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

2. 在 Store 中使用 request 工具发起真实请求：

```typescript
import request from '@/utils/request'

const getUserList = async (params: PageParams) => {
  const response = await request.get<PageData<User>>('/users', { params })
  return response.data
}
```

### Q3: 数据刷新后丢失怎么办？

**原因：** 当前使用内存数据模拟，刷新后会重置。

**解决方法：**
- 对接真实后端 API
- 或者使用 localStorage 持久化数据

### Q4: 如何添加登录功能？

**步骤：**

1. 创建登录页面 `src/views/login/index.vue`
2. 创建用户认证 Store `src/stores/auth.ts`
3. 添加路由守卫检查登录状态
4. 在 request.ts 中添加 token 处理

### Q5: 如何修改主题颜色？

**方法：**

1. 使用 Element Plus 的 CSS 变量覆盖：

```css
:root {
  --el-color-primary: #42b983;  /* 修改主题色 */
}
```

2. 或者使用 Element Plus 的主题定制功能

## 9. 部署指南

### 9.1 构建项目

```bash
npm run build
```

构建完成后，会在 `dist/` 目录生成静态文件。

### 9.2 部署到服务器

**方式 1: 使用 Nginx**

```nginx
server {
  listen 80;
  server_name your-domain.com;
  
  root /path/to/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass http://backend-server:8080;
  }
}
```

**方式 2: 使用 Apache**

在 `dist/` 目录创建 `.htaccess` 文件：

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**方式 3: 使用 Vercel / Netlify**

直接导入 Git 仓库，自动构建和部署。

## 10. 下一步

- 📖 阅读 [README.md](./README.md) 了解项目详情
- 📖 阅读 [USAGE.md](./USAGE.md) 学习使用技巧
- 📖 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 理解架构设计
- 🎯 开始开发你的第一个模块
- 🚀 将项目部署到生产环境

## 11. 获取帮助

如果遇到问题：

1. 检查浏览器控制台的错误信息
2. 查看 [Vue 3 文档](https://cn.vuejs.org/)
3. 查看 [Element Plus 文档](https://element-plus.org/)
4. 查看 [Vite 文档](https://cn.vitejs.dev/)

祝你开发愉快！🎉

