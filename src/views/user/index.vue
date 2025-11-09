<template>
  <crud-table
    ref="crudTableRef"
    :config="crudConfig"
    :loading="userStore.loading"
    :on-load="handleLoad"
    :on-add="handleAdd"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
  >
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import CrudTable from '@/components/CrudTable.vue'
import type { CrudConfig, User, PageData } from '@/types'

const userStore = useUserStore()
const crudTableRef = ref()

// CRUD 配置
const crudConfig: CrudConfig<User> = {
  // 搜索字段
  searchFields: [
    {
      prop: 'name',
      label: '用户名',
      type: 'input'
    },
    {
      prop: 'email',
      label: '邮箱',
      type: 'input'
    }
  ],
  // 表格列
  columns: [
    {
      prop: 'id',
      label: 'ID',
      width: 80
    },
    {
      prop: 'name',
      label: '用户名',
      minWidth: 120
    },
    {
      prop: 'email',
      label: '邮箱',
      minWidth: 180
    },
    {
      prop: 'role',
      label: '角色',
      width: 120
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      slot: 'status'
    },
    {
      prop: 'createTime',
      label: '创建时间',
      width: 180
    }
  ],
  // 表单字段
  formFields: [
    {
      prop: 'name',
      label: '用户名',
      type: 'input',
      required: true,
      rules: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
      ]
    },
    {
      prop: 'email',
      label: '邮箱',
      type: 'input',
      required: true,
      rules: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ]
    },
    {
      prop: 'role',
      label: '角色',
      type: 'select',
      required: true,
      options: [
        { label: '管理员', value: '管理员' },
        { label: '普通用户', value: '普通用户' }
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
}

// 加载数据
const handleLoad = async (params: Record<string, unknown>): Promise<PageData<User>> => {
  return await userStore.getUserList(
    params as unknown as Parameters<typeof userStore.getUserList>[0]
  )
}

// 新增
const handleAdd = async (data: User): Promise<boolean> => {
  return await userStore.addUser(data)
}

// 更新
const handleUpdate = async (data: User): Promise<boolean> => {
  return await userStore.updateUser(data)
}

// 删除
const handleDelete = async (id: number): Promise<boolean> => {
  return await userStore.deleteUser(id)
}
</script>

<style scoped>
/* 页面特定样式 */
</style>
