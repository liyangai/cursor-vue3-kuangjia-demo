<template>
  <div class="crud-table">
    <!-- 动态表格 -->
    <dynamic-table
      :data="tableData"
      :columns="config.columns"
      :search-fields="config.searchFields"
      :loading="loading"
      :total="pagination.total"
      :page="pagination.page"
      :page-size="pagination.pageSize"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 传递所有插槽 -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template>
    </dynamic-table>

    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <dynamic-form ref="formRef" v-model="formData" :form-items="formItems" :rules="formRules" />
      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="formMode !== 'view'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DynamicTable from './DynamicTable.vue'
import DynamicForm from './DynamicForm.vue'
import type { CrudConfig, FormMode, PageData } from '@/types'

interface Props {
  config: CrudConfig<T>
  loading?: boolean
  onLoad: (params: Record<string, unknown>) => Promise<PageData<T>>
  onAdd: (data: T) => Promise<boolean>
  onUpdate: (data: T) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
}

const props = defineProps<Props>()

// 表格数据
const tableData = ref<T[]>([])

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 表单
const dialogVisible = ref(false)
const formMode = ref<FormMode>('add')
const formData = ref<Record<string, any>>({})
const formRef = ref()

// 对话框标题
const dialogTitle = computed(() => {
  const titles = {
    add: '新增',
    edit: '编辑',
    view: '查看'
  }
  return titles[formMode.value]
})

// 转换 formFields 为 formItems 格式
const formItems = computed(() => {
  return props.config.formFields.map((field) => ({
    key: field.prop.toString(),
    label: field.label,
    type: field.type,
    props: field.options ? { options: field.options } : undefined,
    hidden: false
  }))
})

// 表单验证规则
const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.config.formFields.forEach((field) => {
    if (field.required) {
      rules[field.prop.toString()] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
    if (field.rules) {
      rules[field.prop.toString()] = field.rules
    }
  })
  return rules
})

// 搜索参数
const searchParams = ref<Record<string, unknown>>({})

// 加载数据
const loadData = async () => {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...searchParams.value
  }
  try {
    const result = await props.onLoad(params)
    tableData.value = result.list
    pagination.total = result.total
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 搜索
const handleSearch = (params: Record<string, unknown>) => {
  searchParams.value = params
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchParams.value = {}
  pagination.page = 1
  loadData()
}

// 页码改变
const handlePageChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 每页数量改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadData()
}

// 新增
const handleAdd = () => {
  formMode.value = 'add'
  formData.value = {}
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: T) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 查看
const handleView = (row: T) => {
  formMode.value = 'view'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = (row: T) => {
  ElMessageBox.confirm('确认删除此条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const success = await props.onDelete((row as unknown as { id: number }).id)
      if (success) {
        ElMessage.success('删除成功')
        loadData()
      }
    })
    .catch(() => {
      // 取消删除
    })
}

// 批量删除
const handleBatchDelete = (ids: number[]) => {
  ElMessageBox.confirm(`确认删除选中的 ${ids.length} 条数据吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const promises = ids.map((id) => props.onDelete(id))
      await Promise.all(promises)
      ElMessage.success('删除成功')
      loadData()
    })
    .catch(() => {
      // 取消删除
    })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.formRef.validate()
    let success = false
    if (formMode.value === 'add') {
      success = await props.onAdd(formData.value as T)
    } else if (formMode.value === 'edit') {
      success = await props.onUpdate(formData.value as T)
    }

    if (success) {
      ElMessage.success(formMode.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消表单
const handleCancel = () => {
  dialogVisible.value = false
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.formRef?.resetFields()
}

// 初始化加载数据
loadData()

// 暴露方法
defineExpose({
  loadData,
  refresh: loadData
})
</script>

<style scoped>
.crud-table {
  padding: 20px;
}
</style>
