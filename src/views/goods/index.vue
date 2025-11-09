<template>
  <crud-table
    ref="crudTableRef"
    :config="crudConfig"
    :loading="goodsStore.loading"
    :on-load="handleLoad"
    :on-add="handleAdd"
    :on-update="handleUpdate"
    :on-delete="handleDelete"
  >
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '上架' : '下架' }}
      </el-tag>
    </template>
    <template #price="{ row }">
      <span style="color: #f56c6c; font-weight: bold">¥{{ row.price.toFixed(2) }}</span>
    </template>
  </crud-table>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGoodsStore } from '@/stores/goods'
import CrudTable from '@/components/CrudTable.vue'
import type { CrudConfig, Goods, PageData } from '@/types'

const goodsStore = useGoodsStore()
const crudTableRef = ref()

// CRUD 配置
const crudConfig: CrudConfig<Goods> = {
  // 搜索字段
  searchFields: [
    {
      prop: 'name',
      label: '商品名称',
      type: 'input'
    },
    {
      prop: 'category',
      label: '分类',
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
      label: '商品名称',
      minWidth: 150
    },
    {
      prop: 'category',
      label: '分类',
      width: 120
    },
    {
      prop: 'price',
      label: '价格',
      width: 120,
      slot: 'price'
    },
    {
      prop: 'stock',
      label: '库存',
      width: 100
    },
    {
      prop: 'description',
      label: '描述',
      minWidth: 200
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
      label: '商品名称',
      type: 'input',
      required: true,
      rules: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ]
    },
    {
      prop: 'category',
      label: '分类',
      type: 'select',
      required: true,
      options: [
        { label: '手机', value: '手机' },
        { label: '电脑', value: '电脑' },
        { label: '平板', value: '平板' },
        { label: '耳机', value: '耳机' },
        { label: '其他', value: '其他' }
      ]
    },
    {
      prop: 'price',
      label: '价格',
      type: 'number',
      required: true,
      rules: [{ required: true, message: '请输入价格', trigger: 'blur' }]
    },
    {
      prop: 'stock',
      label: '库存',
      type: 'number',
      required: true,
      rules: [{ required: true, message: '请输入库存', trigger: 'blur' }]
    },
    {
      prop: 'description',
      label: '描述',
      type: 'textarea',
      required: true,
      rules: [
        { required: true, message: '请输入描述', trigger: 'blur' },
        { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
      ]
    },
    {
      prop: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { label: '上架', value: 1 },
        { label: '下架', value: 0 }
      ]
    }
  ]
}

// 加载数据
const handleLoad = async (params: Record<string, unknown>): Promise<PageData<Goods>> => {
  return await goodsStore.getGoodsList(
    params as unknown as Parameters<typeof goodsStore.getGoodsList>[0]
  )
}

// 新增
const handleAdd = async (data: Goods): Promise<boolean> => {
  return await goodsStore.addGoods(data)
}

// 更新
const handleUpdate = async (data: Goods): Promise<boolean> => {
  return await goodsStore.updateGoods(data)
}

// 删除
const handleDelete = async (id: number): Promise<boolean> => {
  return await goodsStore.deleteGoods(id)
}
</script>

<style scoped>
/* 页面特定样式 */
</style>
