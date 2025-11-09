# Composable 使用指南

## useCRUD - 通用 CRUD Composable

### 概述

`useCRUD` 是一个通用的 CRUD 业务逻辑封装，解决了视图层与 API 层的耦合问题。

### 核心功能

- ✅ **自动化 CRUD 操作**：增删改查只需一行配置
- ✅ **状态管理**：自动管理 loading、分页、列表数据
- ✅ **错误处理**：统一的错误提示和异常捕获
- ✅ **二次确认**：删除操作自动弹出确认对话框
- ✅ **分页管理**：自动处理分页逻辑
- ✅ **类型安全**：完整的 TypeScript 类型支持

### 基础用法

#### 1. 在 Store 中使用

```typescript
import { defineStore } from 'pinia'
import { userApi } from '@/api'
import { useCRUD } from '@/composables'

export const useUserStore = defineStore('user', () => {
  // 使用 useCRUD
  const {
    list: users,           // 数据列表
    total,                 // 总数
    loading,               // 加载状态
    currentPage,           // 当前页码
    pageSize,              // 每页数量
    loadList,              // 加载列表
    handleAdd,             // 添加
    handleUpdate,          // 更新
    handleDelete,          // 删除
    handleBatchDelete,     // 批量删除
    refresh,               // 刷新当前页
    reset,                 // 重置到第一页
    handlePageChange,      // 页码改变
    handleSizeChange       // 每页数量改变
  } = useCRUD(userApi, {
    pageSize: 10,          // 默认每页10条
    autoLoad: false,       // 不自动加载
    successMessage: {
      add: '添加用户成功',
      update: '更新用户成功',
      delete: '删除用户成功'
    },
    deleteConfirmMessage: '确定要删除该用户吗？'
  })

  return {
    users,
    loading,
    loadList,
    handleAdd,
    handleUpdate,
    handleDelete
  }
})
```

#### 2. 在组件中直接使用

```vue
<template>
  <div>
    <el-table :data="users" v-loading="loading">
      <el-table-column prop="name" label="姓名" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="handleEdit(row)">编辑</el-button>
          <el-button @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { userApi } from '@/api'
import { useCRUD } from '@/composables'
import type { User } from '@/types'

// 直接使用
const {
  list: users,
  total,
  loading,
  currentPage,
  pageSize,
  loadList,
  handleAdd,
  handleUpdate,
  handleDelete,
  handlePageChange,
  handleSizeChange
} = useCRUD(userApi, {
  pageSize: 10,
  autoLoad: true  // 组件挂载时自动加载
})

// 编辑
const handleEdit = async (user: User) => {
  // 打开编辑对话框，提交后调用
  await handleUpdate(user)
}
</script>
```

### API 参考

#### 配置选项 (UseCRUDOptions)

```typescript
interface UseCRUDOptions {
  /** 默认每页数量，默认: 10 */
  pageSize?: number
  
  /** 是否自动加载数据，默认: false */
  autoLoad?: boolean
  
  /** 成功提示消息 */
  successMessage?: {
    add?: string      // 默认: '添加成功'
    update?: string   // 默认: '更新成功'
    delete?: string   // 默认: '删除成功'
  }
  
  /** 删除确认消息，默认: '确定要删除此条数据吗？' */
  deleteConfirmMessage?: string
}
```

#### 返回值 (UseCRUDReturn)

```typescript
interface UseCRUDReturn<T> {
  // ===== 响应式状态 =====
  
  /** 数据列表 */
  list: Ref<T[]>
  
  /** 总数 */
  total: Ref<number>
  
  /** 加载状态 */
  loading: Ref<boolean>
  
  /** 当前页码 */
  currentPage: Ref<number>
  
  /** 每页数量 */
  pageSize: Ref<number>
  
  // ===== 方法 =====
  
  /** 
   * 加载列表数据
   * @param searchParams 搜索参数
   */
  loadList: (searchParams?: Partial<T>) => Promise<void>
  
  /**
   * 添加数据
   * @param data 数据对象
   * @returns 是否成功
   */
  handleAdd: (data: T) => Promise<boolean>
  
  /**
   * 更新数据
   * @param data 数据对象（需包含 id）
   * @returns 是否成功
   */
  handleUpdate: (data: T) => Promise<boolean>
  
  /**
   * 删除数据（带二次确认）
   * @param id 数据 ID
   * @returns 是否成功
   */
  handleDelete: (id: number) => Promise<boolean>
  
  /**
   * 批量删除（带二次确认）
   * @param ids 数据 ID 数组
   * @returns 是否成功
   */
  handleBatchDelete: (ids: number[]) => Promise<boolean>
  
  /**
   * 刷新当前页
   */
  refresh: () => Promise<void>
  
  /**
   * 重置到第一页
   */
  reset: () => Promise<void>
  
  /**
   * 页码改变
   * @param page 新页码
   */
  handlePageChange: (page: number) => Promise<void>
  
  /**
   * 每页数量改变
   * @param size 新的每页数量
   */
  handleSizeChange: (size: number) => Promise<void>
}
```

### 使用场景

#### 场景 1：简单的列表页

```typescript
// 只需要基础的增删改查
const crud = useCRUD(userApi, { autoLoad: true })

// 在模板中使用
<el-table :data="crud.list.value" />
```

#### 场景 2：带搜索的列表页

```typescript
const crud = useCRUD(userApi)

// 搜索
const searchForm = reactive({ name: '', email: '' })

const handleSearch = () => {
  crud.loadList(searchForm)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, { name: '', email: '' })
  crud.reset()
}
```

#### 场景 3：Store 中使用

```typescript
export const useUserStore = defineStore('user', () => {
  const crud = useCRUD(userApi, {
    pageSize: 10,
    autoLoad: false
  })
  
  // 兼容原有接口
  const getUserList = async (params: PageParams) => {
    crud.currentPage.value = params.page
    crud.pageSize.value = params.pageSize
    await crud.loadList()
    
    return {
      list: crud.list.value,
      total: crud.total.value,
      page: crud.currentPage.value,
      pageSize: crud.pageSize.value
    }
  }
  
  // 添加特殊业务方法
  const updateUserStatus = async (id: number, status: number) => {
    await userApi.updateStatus(id, status)
    await crud.refresh()
  }
  
  return {
    ...crud,
    getUserList,
    updateUserStatus
  }
})
```

#### 场景 4：自定义提示消息

```typescript
const crud = useCRUD(userApi, {
  successMessage: {
    add: '用户添加成功！',
    update: '用户信息已更新',
    delete: '用户已删除'
  },
  deleteConfirmMessage: '删除后不可恢复，确定要删除该用户吗？'
})
```

#### 场景 5：自动加载

```typescript
// 组件挂载时自动加载第一页数据
const crud = useCRUD(userApi, {
  autoLoad: true,
  pageSize: 20
})
```

### 完整示例

```vue
<template>
  <div class="user-list">
    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="用户名">
        <el-input v-model="searchForm.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
      <el-button 
        type="danger" 
        :disabled="!selectedIds.length"
        @click="handleBatchDelete(selectedIds)"
      >
        批量删除
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table 
      :data="users" 
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { userApi } from '@/api'
import { useCRUD } from '@/composables'
import type { User } from '@/types'

// 使用 CRUD composable
const {
  list: users,
  total,
  loading,
  currentPage,
  pageSize,
  loadList,
  handleAdd: addUser,
  handleUpdate: updateUser,
  handleDelete,
  handleBatchDelete,
  refresh,
  reset,
  handlePageChange,
  handleSizeChange
} = useCRUD(userApi, {
  pageSize: 10,
  autoLoad: true,
  successMessage: {
    add: '添加用户成功',
    update: '更新用户成功',
    delete: '删除用户成功'
  }
})

// 搜索表单
const searchForm = reactive<Partial<User>>({
  name: '',
  email: ''
})

// 搜索
const handleSearch = () => {
  loadList(searchForm)
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, { name: '', email: '' })
  reset()
}

// 选中的 ID
const selectedIds = ref<number[]>([])
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map(item => item.id!)
}

// 表单对话框
const dialogVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formData = reactive<Partial<User>>({})

const dialogTitle = computed(() => {
  return formMode.value === 'add' ? '新增用户' : '编辑用户'
})

// 新增
const handleAdd = () => {
  formMode.value = 'add'
  Object.assign(formData, { name: '', email: '' })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (user: User) => {
  formMode.value = 'edit'
  Object.assign(formData, user)
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  let success = false
  if (formMode.value === 'add') {
    success = await addUser(formData as User)
  } else {
    success = await updateUser(formData as User)
  }
  
  if (success) {
    dialogVisible.value = false
  }
}
</script>
```

### 优势总结

#### 重构前（没有 composable）

```typescript
// ❌ 每个 Store 都要重复写这些代码
const users = ref<User[]>([])
const total = ref(0)
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)

const getUserList = async (params) => {
  loading.value = true
  try {
    const data = await userApi.getList(params)
    users.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const addUser = async (user) => {
  loading.value = true
  try {
    await userApi.create(user)
    ElMessage.success('添加成功')
    // ... 重新加载列表
  } finally {
    loading.value = false
  }
}

// ... 更多重复代码
```

#### 重构后（使用 composable）

```typescript
// ✅ 一行代码搞定
const crud = useCRUD(userApi, {
  pageSize: 10,
  autoLoad: true
})

// 直接使用
crud.list.value        // 数据列表
crud.handleAdd(user)   // 添加
crud.handleUpdate(user)  // 更新
crud.handleDelete(id)  // 删除
```

### 对比

| 方面 | 重构前 | 重构后 |
|------|--------|--------|
| **代码量** | 每个 Store 150+ 行 | 每个 Store 50 行 |
| **重复代码** | ❌ 大量重复 | ✅ 零重复 |
| **错误处理** | ⚠️ 需要手动处理 | ✅ 自动处理 |
| **加载状态** | ⚠️ 手动管理 | ✅ 自动管理 |
| **分页逻辑** | ⚠️ 手动处理 | ✅ 自动处理 |
| **二次确认** | ⚠️ 每次都要写 | ✅ 内置支持 |
| **易用性** | ⚠️ 需要理解细节 | ✅ 开箱即用 |

### 最佳实践

1. ✅ **在 Store 中使用** - 集中管理业务状态
2. ✅ **自定义提示消息** - 提供更好的用户体验
3. ✅ **组合使用** - 可以添加自定义业务方法
4. ✅ **类型安全** - 充分利用 TypeScript 类型
5. ✅ **解构使用** - 只导出需要的属性和方法

### 总结

`useCRUD` composable 提供了：

- ✅ **代码复用** - 减少 70% 的重复代码
- ✅ **自动化** - 自动处理加载、分页、错误
- ✅ **类型安全** - 完整的 TypeScript 支持
- ✅ **易于使用** - 简单直观的 API
- ✅ **灵活扩展** - 可以轻松添加自定义逻辑

这是一个**生产级别**的解决方案！🎉

