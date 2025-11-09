<template>
  <div class="dynamic-table">
    <!-- 搜索表单 -->
    <el-card v-if="searchFields && searchFields.length" class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item
          v-for="field in searchFields"
          :key="field.prop.toString()"
          :label="field.label"
        >
          <el-input
            v-if="!field.type || field.type === 'input'"
            v-model="(searchForm as any)[field.prop]"
            :placeholder="`请输入${field.label}`"
            clearable
            style="width: 200px"
          />
          <el-select
            v-else-if="field.type === 'select'"
            v-model="(searchForm as any)[field.prop]"
            :placeholder="`请选择${field.label}`"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="opt in field.options"
              :key="opt.value as string"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="table-card">
      <div class="toolbar">
        <slot name="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="!selectedIds.length"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </slot>
        <div class="toolbar-right">
          <slot name="toolbar-right" />
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="data"
        border
        stripe
        :loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column v-if="showSelection" type="selection" width="55" />
        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :formatter="column.formatter"
        >
          <template v-if="column.slot" #default="scope">
            <slot :name="column.slot" :row="scope.row" :column="column" :index="scope.$index" />
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column v-if="showActions" label="操作" :width="actionWidth" fixed="right">
          <template #default="scope">
            <slot name="actions" :row="scope.row" :index="scope.$index">
              <el-button type="primary" link :icon="View" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </slot>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="showPagination"
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Search, Refresh, Plus, Delete, Edit, View } from '@element-plus/icons-vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Data = Record<string, any>

interface SearchField {
  prop: string | number | symbol
  label: string
  type?: 'input' | 'select' | 'date'
  options?: Array<{ label: string; value: unknown }>
}

interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  formatter?: (row: unknown, column: unknown, cellValue: unknown, index: number) => string
  slot?: string
}

interface Props {
  /** 表格数据 */
  data: Data[]
  /** 表格列配置 */
  columns: TableColumn[]
  /** 搜索字段配置 */
  searchFields?: SearchField[]
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

interface Emits {
  (e: 'search', params: Record<string, unknown>): void
  (e: 'reset'): void
  (e: 'add'): void
  (e: 'edit', row: Data): void
  (e: 'view', row: Data): void
  (e: 'delete', row: Data): void
  (e: 'batch-delete', ids: number[]): void
  (e: 'selection-change', selection: Data[]): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  searchFields: () => [],
  loading: false,
  total: 0,
  page: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  showPagination: true,
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  showSelection: true,
  showActions: true,
  actionWidth: 200
})

const emit = defineEmits<Emits>()

// 搜索表单
const searchForm = reactive<Record<string, unknown>>({})

// 选中的行
const selectedIds = ref<number[]>([])

// 当前页码
const currentPage = computed({
  get: () => props.page,
  set: (value) => emit('page-change', value)
})

// 每页数量
const currentPageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('size-change', value)
})

// 搜索
const handleSearch = () => {
  emit('search', { ...searchForm })
}

// 重置
const handleReset = () => {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = ''
  })
  emit('reset')
}

// 选择改变
const handleSelectionChange = (selection: Data[]) => {
  selectedIds.value = selection.map((item) => (item as unknown as { id: number }).id)
  emit('selection-change', selection)
}

// 新增
const handleAdd = () => {
  emit('add')
}

// 编辑
const handleEdit = (row: Data) => {
  emit('edit', row)
}

// 查看
const handleView = (row: Data) => {
  emit('view', row)
}

// 删除
const handleDelete = (row: Data) => {
  emit('delete', row)
}

// 批量删除
const handleBatchDelete = () => {
  emit('batch-delete', selectedIds.value)
}

// 分页改变
const handleCurrentChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

// 暴露方法
defineExpose({
  getSelectedIds: () => selectedIds.value,
  clearSelection: () => {
    selectedIds.value = []
  }
})
</script>

<style scoped>
.dynamic-table {
  width: 100%;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  min-height: 500px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
