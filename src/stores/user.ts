import { defineStore } from 'pinia'
import type { User, PageData, PageParams } from '@/types'
import { userApi } from '@/api'
import { useCRUD } from '@/composables'

export const useUserStore = defineStore('user', () => {
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
    handleDelete: deleteUser,
    handleBatchDelete: batchDeleteUsers,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset
  } = useCRUD(userApi, {
    pageSize: 10,
    autoLoad: false,
    successMessage: {
      add: '添加用户成功',
      update: '更新用户成功',
      delete: '删除用户成功'
    },
    deleteConfirmMessage: '确定要删除该用户吗？'
  })

  /**
   * 获取用户列表（兼容原有接口）
   */
  const getUserList = async (params: PageParams & Partial<User>): Promise<PageData<User>> => {
    currentPage.value = params.page
    pageSize.value = params.pageSize

    await loadList(params)

    return {
      list: users.value,
      total: total.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
  }

  /**
   * 修改用户状态
   */
  const updateUserStatus = async (id: number, status: number): Promise<boolean> => {
    loading.value = true
    try {
      await userApi.updateStatus(id, status)
      await refresh()
      return true
    } catch (error) {
      console.error('修改用户状态失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    users,
    total,
    loading,
    currentPage,
    pageSize,

    // 方法
    getUserList,
    addUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    updateUserStatus,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset
  }
})
