import { ref, Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { PageData, PageParams } from '@/types'
import type { BaseApi } from '@/api/base'

/**
 * CRUD 配置选项
 */
export interface UseCRUDOptions {
  /** 默认每页数量 */
  pageSize?: number
  /** 是否自动加载数据 */
  autoLoad?: boolean
  /** 成功提示消息 */
  successMessage?: {
    add?: string
    update?: string
    delete?: string
  }
  /** 删除确认消息 */
  deleteConfirmMessage?: string
}

/**
 * CRUD 返回类型
 */
export interface UseCRUDReturn<T> {
  // 响应式状态
  list: Ref<T[]>
  total: Ref<number>
  loading: Ref<boolean>
  currentPage: Ref<number>
  pageSize: Ref<number>

  // 方法
  loadList: (searchParams?: Partial<T>) => Promise<void>
  handleAdd: (data: T) => Promise<boolean>
  handleUpdate: (data: T) => Promise<boolean>
  handleDelete: (id: number) => Promise<boolean>
  handleBatchDelete: (ids: number[]) => Promise<boolean>
  refresh: () => Promise<void>
  reset: () => Promise<void>
  handlePageChange: (page: number) => Promise<void>
  handleSizeChange: (size: number) => Promise<void>
}

/**
 * 通用 CRUD Composable
 *
 * @example
 * ```ts
 * const {
 *   list,
 *   loading,
 *   loadList,
 *   handleAdd,
 *   handleUpdate,
 *   handleDelete
 * } = useCRUD(userApi, {
 *   pageSize: 10,
 *   autoLoad: true
 * })
 * ```
 */
export function useCRUD<T extends Record<string, any>>(
  api: BaseApi<T>,
  options: UseCRUDOptions = {}
): UseCRUDReturn<T> {
  const {
    pageSize: defaultPageSize = 10,
    autoLoad = false,
    successMessage = {
      add: '添加成功',
      update: '更新成功',
      delete: '删除成功'
    },
    deleteConfirmMessage = '确定要删除此条数据吗？'
  } = options

  // ========== 响应式状态 ==========
  const list = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const searchParams = ref<Partial<T>>({})

  // ========== 核心方法 ==========

  /**
   * 加载列表数据
   */
  const loadList = async (params?: Partial<T>) => {
    loading.value = true
    try {
      // 合并搜索参数
      if (params !== undefined) {
        searchParams.value = params
      }

      const requestParams: PageParams & Partial<T> = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...searchParams.value
      }

      const data = await api.getList(requestParams)
      list.value = data.list
      total.value = data.total
    } catch (error) {
      console.error('加载列表失败:', error)
      ElMessage.error('加载数据失败')
      list.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加数据
   */
  const handleAdd = async (data: T): Promise<boolean> => {
    loading.value = true
    try {
      await api.create(data)
      ElMessage.success(successMessage.add!)

      // 添加成功后，跳转到最后一页（如果数据会被添加到末尾）
      // 或者刷新当前页（如果数据会被添加到开头）
      await refresh()
      return true
    } catch (error) {
      console.error('添加失败:', error)
      ElMessage.error('添加失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新数据
   */
  const handleUpdate = async (data: T): Promise<boolean> => {
    if (!data.id) {
      ElMessage.warning('缺少 ID 参数')
      return false
    }

    loading.value = true
    try {
      await api.update(data.id, data)
      ElMessage.success(successMessage.update!)

      // 更新成功后刷新当前页
      await refresh()
      return true
    } catch (error) {
      console.error('更新失败:', error)
      ElMessage.error('更新失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除数据（带二次确认）
   */
  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      await ElMessageBox.confirm(deleteConfirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      loading.value = true
      await api.delete(id)
      ElMessage.success(successMessage.delete!)

      // 如果删除后当前页没有数据了，返回上一页
      if (list.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }

      await refresh()
      return true
    } catch (error) {
      if (error === 'cancel') {
        // 用户取消删除
        return false
      }
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async (ids: number[]): Promise<boolean> => {
    if (!ids || ids.length === 0) {
      ElMessage.warning('请选择要删除的数据')
      return false
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 条数据吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      loading.value = true
      await api.batchDelete(ids)
      ElMessage.success(successMessage.delete!)

      // 批量删除后，如果当前页没有数据了，返回第一页
      await reset()
      return true
    } catch (error) {
      if (error === 'cancel') {
        return false
      }
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新当前页
   */
  const refresh = async () => {
    await loadList()
  }

  /**
   * 重置到第一页
   */
  const reset = async () => {
    currentPage.value = 1
    searchParams.value = {}
    await loadList()
  }

  /**
   * 页码改变
   */
  const handlePageChange = async (page: number) => {
    currentPage.value = page
    await loadList()
  }

  /**
   * 每页数量改变
   */
  const handleSizeChange = async (size: number) => {
    pageSize.value = size
    currentPage.value = 1
    await loadList()
  }

  // ========== 自动加载 ==========
  if (autoLoad) {
    loadList()
  }

  return {
    // 响应式状态
    list,
    total,
    loading,
    currentPage,
    pageSize,

    // 方法
    loadList,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    refresh,
    reset,
    handlePageChange,
    handleSizeChange
  }
}
