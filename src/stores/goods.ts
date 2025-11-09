import { defineStore } from 'pinia'
import type { Goods, PageData, PageParams } from '@/types'
import { goodsApi } from '@/api'
import { useCRUD } from '@/composables'

export const useGoodsStore = defineStore('goods', () => {
  // 使用 CRUD composable
  const {
    list: goodsList,
    total,
    loading,
    currentPage,
    pageSize,
    loadList,
    handleAdd: addGoods,
    handleUpdate: updateGoods,
    handleDelete: deleteGoods,
    handleBatchDelete: batchDeleteGoods,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset
  } = useCRUD(goodsApi, {
    pageSize: 10,
    autoLoad: false,
    successMessage: {
      add: '添加商品成功',
      update: '更新商品成功',
      delete: '删除商品成功'
    },
    deleteConfirmMessage: '确定要删除该商品吗？'
  })

  /**
   * 获取商品列表（兼容原有接口）
   */
  const getGoodsList = async (params: PageParams & Partial<Goods>): Promise<PageData<Goods>> => {
    currentPage.value = params.page
    pageSize.value = params.pageSize

    await loadList(params)

    return {
      list: goodsList.value,
      total: total.value,
      page: currentPage.value,
      pageSize: pageSize.value
    }
  }

  /**
   * 修改商品状态（上架/下架）
   */
  const updateGoodsStatus = async (id: number, status: number): Promise<boolean> => {
    loading.value = true
    try {
      await goodsApi.updateStatus(id, status)
      await refresh()
      return true
    } catch (error) {
      console.error('修改商品状态失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量修改价格
   */
  const batchUpdatePrice = async (ids: number[], price: number): Promise<boolean> => {
    loading.value = true
    try {
      await goodsApi.batchUpdatePrice(ids, price)
      await refresh()
      return true
    } catch (error) {
      console.error('批量修改价格失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    goodsList,
    total,
    loading,
    currentPage,
    pageSize,

    // 方法
    getGoodsList,
    addGoods,
    updateGoods,
    deleteGoods,
    batchDeleteGoods,
    updateGoodsStatus,
    batchUpdatePrice,
    handlePageChange,
    handleSizeChange,
    refresh,
    reset
  }
})
