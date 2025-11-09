import { BaseApi } from './base'
import type { Goods } from '@/types'

/**
 * 商品 API
 */
class GoodsApi extends BaseApi<Goods> {
  constructor() {
    super('/goods')
  }

  // 可以在这里添加商品特有的 API 方法
  // 例如：上架、下架、批量修改价格等

  /**
   * 修改商品状态（上架/下架）
   */
  async updateStatus(id: number, status: number): Promise<Goods> {
    return await this.update(id, { status } as Goods)
  }

  /**
   * 批量修改价格
   */
  async batchUpdatePrice(ids: number[], price: number): Promise<void> {
    await Promise.all(ids.map((id) => this.update(id, { price } as Goods)))
  }
}

// 导出单例
export const goodsApi = new GoodsApi()
