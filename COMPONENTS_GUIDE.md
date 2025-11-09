# 组件使用指南

## 组件拆分说明

为了提高组件的复用性和可维护性，我们将 `CrudTable` 组件拆分成了三个独立的组件：

```
CrudTable (容器组件)
├── DynamicTable (动态表格组件)
└── DynamicForm (动态表单组件)
```

### 组件职责

| 组件 | 职责 | 可独立使用 |
|------|------|-----------|
| **DynamicTable** | 数据展示、搜索、分页、批量操作 | ✅ 是 |
| **DynamicForm** | 表单展示、数据编辑、表单验证 | ✅ 是 |
| **CrudTable** | 组合表格和表单，提供完整的 CRUD 功能 | ✅ 是 |

## 1. DynamicTable 组件

### 功能特性

- ✅ 数据展示（表格）
- ✅ 搜索功能
- ✅ 分页功能
- ✅ 行选择
- ✅ 批量操作
- ✅ 自定义列（插槽）
- ✅ 自定义操作列
- ✅ 自定义工具栏

### 基础用法

```vue
<template>
  <dynamic-table
    :data="users"
    :columns="columns"
    :loading="loading"
    :total="total"
    :page="page"
    :page-size="pageSize"
    @add="handleAdd"
    @edit="handleEdit"
    @delete="handleDelete"
    @page-change="handlePageChange"
  >
    <!-- 自定义列 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </dynamic-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicTable } from '@/components'

const users = ref([...])
const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' }
]
</script>
```

### Props

```typescript
interface Props {
  /** 表格数据 */
  data: T[]
  
  /** 表格列配置 */
  columns: TableColumn[]
  
  /** 搜索字段配置（可选） */
  searchFields?: SearchField<T>[]
  
  /** 加载状态 */
  loading?: boolean
  
  /** 总数 */
  total?: number
  
  /** 当前页码 */
  page?: number
  
  /** 每页数量 */
  pageSize?: number
  
  /** 每页数量选项 */
  pageSizes?: number[]
  
  /** 是否显示分页 */
  showPagination?: boolean
  
  /** 分页布局 */
  paginationLayout?: string
  
  /** 是否显示选择框 */
  showSelection?: boolean
  
  /** 是否显示操作列 */
  showActions?: boolean
  
  /** 操作列宽度 */
  actionWidth?: string | number
}
```

### Events

```typescript
interface Emits {
  /** 搜索 */
  (e: 'search', params: Record<string, unknown>): void
  
  /** 重置 */
  (e: 'reset'): void
  
  /** 新增 */
  (e: 'add'): void
  
  /** 编辑 */
  (e: 'edit', row: T): void
  
  /** 查看 */
  (e: 'view', row: T): void
  
  /** 删除 */
  (e: 'delete', row: T): void
  
  /** 批量删除 */
  (e: 'batch-delete', ids: number[]): void
  
  /** 选择改变 */
  (e: 'selection-change', selection: T[]): void
  
  /** 页码改变 */
  (e: 'page-change', page: number): void
  
  /** 每页数量改变 */
  (e: 'size-change', size: number): void
}
```

### 插槽

```vue
<!-- 自定义列内容 -->
<template #columnName="{ row, column, index }">
  <span>{{ row.columnName }}</span>
</template>

<!-- 自定义操作列 -->
<template #actions="{ row, index }">
  <el-button @click="handleEdit(row)">编辑</el-button>
  <el-button @click="handleDelete(row)">删除</el-button>
</template>

<!-- 自定义工具栏左侧 -->
<template #toolbar-left>
  <el-button type="primary">自定义按钮</el-button>
</template>

<!-- 自定义工具栏右侧 -->
<template #toolbar-right>
  <el-button>导出</el-button>
</template>
```

### 完整示例

```vue
<template>
  <dynamic-table
    :data="users"
    :columns="columns"
    :search-fields="searchFields"
    :loading="loading"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :show-selection="true"
    :show-actions="true"
    @search="handleSearch"
    @reset="handleReset"
    @add="handleAdd"
    @edit="handleEdit"
    @view="handleView"
    @delete="handleDelete"
    @batch-delete="handleBatchDelete"
    @selection-change="handleSelectionChange"
    @page-change="handlePageChange"
    @size-change="handleSizeChange"
  >
    <!-- 自定义状态列 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
    
    <!-- 自定义工具栏 -->
    <template #toolbar-right>
      <el-button :icon="Download" @click="handleExport">导出</el-button>
    </template>
  </dynamic-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { DynamicTable } from '@/components'
import type { User } from '@/types'

const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const columns = [
  { prop: 'id', label: 'ID', width: 80 },
  { prop: 'name', label: '姓名', minWidth: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'status', label: '状态', width: 100, slot: 'status' }
]

const searchFields = [
  { prop: 'name', label: '姓名', type: 'input' },
  { prop: 'email', label: '邮箱', type: 'input' }
]

const handleSearch = (params: Record<string, unknown>) => {
  console.log('搜索参数:', params)
  // 调用 API 搜索
}

const handleAdd = () => {
  console.log('新增')
}

const handleEdit = (row: User) => {
  console.log('编辑:', row)
}
</script>
```

## 2. DynamicForm 组件

### 功能特性

- ✅ 动态表单生成
- ✅ 表单验证
- ✅ 多种表单控件（input、textarea、number、select）
- ✅ 三种模式（新增、编辑、查看）
- ✅ 对话框形式展示

### 基础用法

```vue
<template>
  <dynamic-form
    v-model="dialogVisible"
    :mode="formMode"
    :fields="formFields"
    :data="formData"
    @submit="handleSubmit"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DynamicForm } from '@/components'
import type { User, FormMode } from '@/types'

const dialogVisible = ref(false)
const formMode = ref<FormMode>('add')
const formData = ref<Partial<User>>({})

const formFields = [
  {
    prop: 'name',
    label: '姓名',
    type: 'input',
    required: true,
    rules: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
    ]
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    required: true,
    rules: [
      { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    required: true,
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
]

const handleSubmit = (data: User, mode: FormMode) => {
  console.log('提交数据:', data, mode)
  dialogVisible.value = false
}
</script>
```

### Props

```typescript
interface Props {
  /** 是否显示对话框 */
  modelValue: boolean
  
  /** 表单模式：add-新增 / edit-编辑 / view-查看 */
  mode: FormMode
  
  /** 表单字段配置 */
  fields: FormField<T>[]
  
  /** 表单数据 */
  data?: Partial<T>
  
  /** 对话框宽度 */
  width?: string
  
  /** 标签宽度 */
  labelWidth?: string
}
```

### Events

```typescript
interface Emits {
  /** 更新显示状态 */
  (e: 'update:modelValue', value: boolean): void
  
  /** 提交表单 */
  (e: 'submit', data: T, mode: FormMode): void
  
  /** 取消 */
  (e: 'cancel'): void
}
```

### 表单字段类型

```typescript
interface FormField<T> {
  /** 字段名 */
  prop: keyof T
  
  /** 标签 */
  label: string
  
  /** 控件类型 */
  type?: 'input' | 'textarea' | 'select' | 'number' | 'date'
  
  /** 下拉选项（type=select时使用） */
  options?: Array<{ label: string; value: unknown }>
  
  /** 是否必填 */
  required?: boolean
  
  /** 验证规则 */
  rules?: unknown[]
}
```

### 暴露的方法

```typescript
// 获取表单实例引用
const formRef = ref()

// 验证表单
await formRef.value?.validate()

// 重置表单
formRef.value?.resetFields()

// 清除验证
formRef.value?.clearValidate()
```

## 3. CrudTable 组件（组合组件）

### 功能特性

- ✅ 整合了 DynamicTable 和 DynamicForm
- ✅ 提供完整的 CRUD 功能
- ✅ 自动处理表格和表单的交互
- ✅ 向下兼容原有 API

### 用法

```vue
<template>
  <crud-table
    :config="crudConfig"
    :loading="loading"
    :on-load="handleLoad"
    :on-add="handleAdd"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
  >
    <!-- 自定义列插槽 -->
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { CrudTable } from '@/components'
import { userApi } from '@/api'
import type { CrudConfig, User, PageData } from '@/types'

const crudConfig: CrudConfig<User> = {
  searchFields: [
    { prop: 'name', label: '姓名', type: 'input' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '姓名', minWidth: 120 }
  ],
  formFields: [
    { prop: 'name', label: '姓名', type: 'input', required: true }
  ]
}

const handleLoad = async (params): Promise<PageData<User>> => {
  return await userApi.getList(params)
}

const handleAdd = async (user: User): Promise<boolean> => {
  await userApi.create(user)
  return true
}
</script>
```

## 使用场景对比

### 场景 1：完整的 CRUD 页面

**推荐使用：CrudTable**

```vue
<crud-table :config="crudConfig" :on-load="handleLoad" ... />
```

### 场景 2：只需要数据展示和操作，不需要表单

**推荐使用：DynamicTable**

```vue
<dynamic-table 
  :data="data" 
  :columns="columns" 
  @edit="openExternalEditPage"
/>
```

### 场景 3：只需要表单，数据从其他地方获取

**推荐使用：DynamicForm**

```vue
<dynamic-form 
  v-model="visible" 
  :fields="fields" 
  :data="formData"
  @submit="handleSubmit"
/>
```

### 场景 4：复杂的自定义需求

**推荐使用：DynamicTable + DynamicForm 组合**

```vue
<template>
  <!-- 自定义表格布局 -->
  <div class="custom-layout">
    <dynamic-table ... />
    
    <!-- 其他内容 -->
    <div class="custom-content">...</div>
    
    <!-- 自定义表单位置 -->
    <dynamic-form ... />
  </div>
</template>
```

## 组件优势

### 重构前（单一组件）

```
CrudTable.vue (389 行)
- 表格逻辑
- 表单逻辑
- 搜索逻辑
- 分页逻辑
- 全部耦合在一起
```

❌ **问题：**
- 单个文件太大，难以维护
- 表格和表单耦合，无法单独使用
- 修改一个功能可能影响另一个
- 代码复用性差

### 重构后（组件拆分）

```
DynamicTable.vue (200 行)
- 只负责表格相关逻辑

DynamicForm.vue (150 行)
- 只负责表单相关逻辑

CrudTable.vue (130 行)
- 组合上述两个组件
```

✅ **优势：**
- 单一职责，易于维护
- 组件可以独立使用
- 修改影响范围小
- 代码复用性高
- 更灵活的组合方式

## 迁移指南

### 原有代码无需修改

如果你已经在使用 `CrudTable`，**无需任何修改**，完全向下兼容：

```vue
<!-- 原有代码继续工作 -->
<crud-table :config="crudConfig" ... />
```

### 新项目推荐用法

1. **完整 CRUD**：使用 `CrudTable`
2. **只需表格**：使用 `DynamicTable`
3. **只需表单**：使用 `DynamicForm`
4. **自定义组合**：`DynamicTable` + `DynamicForm`

## 总结

通过组件拆分，我们实现了：

- ✅ **单一职责**：每个组件只做一件事
- ✅ **高复用性**：组件可以独立使用
- ✅ **易维护性**：代码更清晰，修改更容易
- ✅ **灵活性**：可以自由组合
- ✅ **向下兼容**：不影响现有代码

这是一个**生产级别**的组件设计！🎉

