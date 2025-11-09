import request from '@/utils/request'
import type { PageData, PageParams, ApiResponse } from '@/types'

/**
 * 通用 CRUD API 基类
 */
export class BaseApi<T> {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * 获取列表（支持分页和搜索）
   */
  async getList(params: PageParams & Partial<T>): Promise<PageData<T>> {
    const response = await request.get<PageData<T>>(this.baseUrl, { params })
    return response.data
  }

  /**
   * 根据 ID 获取详情
   */
  async getById(id: number): Promise<T> {
    const response = await request.get<T>(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * 创建
   */
  async create(data: T): Promise<T> {
    const response = await request.post<T>(this.baseUrl, data)
    return response.data
  }

  /**
   * 更新
   */
  async update(id: number, data: T): Promise<T> {
    const response = await request.put<T>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  /**
   * 删除
   */
  async delete(id: number): Promise<void> {
    await request.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * 批量删除
   */
  async batchDelete(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)))
  }
}
