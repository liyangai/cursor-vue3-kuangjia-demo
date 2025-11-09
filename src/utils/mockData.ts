import type { User, Goods } from '@/types'

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    role: '管理员',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    role: '普通用户',
    status: 1,
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    role: '普通用户',
    status: 0,
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00'
  }
]

// 模拟商品数据
export const mockGoods: Goods[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    category: '手机',
    price: 7999,
    stock: 100,
    description: '全新 iPhone 15 Pro，配备 A17 Pro 芯片',
    status: 1,
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: 'MacBook Pro',
    category: '电脑',
    price: 12999,
    stock: 50,
    description: 'MacBook Pro 14 英寸，M3 芯片',
    status: 1,
    createTime: '2024-01-02 10:00:00',
    updateTime: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    name: 'AirPods Pro',
    category: '耳机',
    price: 1999,
    stock: 200,
    description: 'AirPods Pro 第二代，支持主动降噪',
    status: 1,
    createTime: '2024-01-03 10:00:00',
    updateTime: '2024-01-03 10:00:00'
  }
]
