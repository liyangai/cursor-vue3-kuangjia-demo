// 通用响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页请求参数
export interface PageParams {
  page: number
  pageSize: number
}

// 分页响应数据
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户类型
export interface User {
  id?: number
  name: string
  email: string
  phone: string
  role: string
  status: number
  createTime?: string
  updateTime?: string
}

// 商品类型
export interface Goods {
  id?: number
  name: string
  category: string
  price: number
  stock: number
  description: string
  status: number
  createTime?: string
  updateTime?: string
}

// 表单操作类型
export type FormMode = 'add' | 'edit' | 'view'

// 表格列配置
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  formatter?: (row: unknown, column: unknown, cellValue: unknown, index: number) => string
  slot?: string
}

// CRUD 配置
export interface CrudConfig<T = unknown> {
  columns: TableColumn[]
  searchFields?: Array<{
    prop: keyof T
    label: string
    type?: 'input' | 'select' | 'date'
    options?: Array<{ label: string; value: unknown }>
  }>
  formFields: Array<{
    prop: keyof T
    label: string
    type?: 'input' | 'textarea' | 'select' | 'number' | 'date'
    options?: Array<{ label: string; value: unknown }>
    required?: boolean
    rules?: unknown[]
  }>
}
