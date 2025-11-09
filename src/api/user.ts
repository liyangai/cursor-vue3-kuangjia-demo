import { BaseApi } from './base'
import type { User } from '@/types'

/**
 * 用户 API
 */
class UserApi extends BaseApi<User> {
  constructor() {
    super('/users')
  }

  // 可以在这里添加用户特有的 API 方法
  // 例如：修改密码、重置密码等

  /**
   * 修改用户状态
   */
  async updateStatus(id: number, status: number): Promise<User> {
    return await this.update(id, { status } as User)
  }
}

// 导出单例
export const userApi = new UserApi()
