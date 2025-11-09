import { http, HttpResponse } from 'msw'
import type { User, Goods, PageData, ApiResponse } from '@/types'
import { mockUsers, mockGoods } from '@/utils/mockData'

// 用于存储数据的变量（模拟数据库）
const users: User[] = [...mockUsers]
const goods: Goods[] = [...mockGoods]

// 生成新 ID
const generateUserId = () => Math.max(...users.map((u) => u.id || 0), 0) + 1
const generateGoodsId = () => Math.max(...goods.map((g) => g.id || 0), 0) + 1

export const handlers = [
  // ==================== 用户管理 API ====================

  // 获取用户列表
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const name = url.searchParams.get('name') || ''
    const email = url.searchParams.get('email') || ''

    // 过滤数据
    let filteredData = [...users]
    if (name) {
      filteredData = filteredData.filter((user) => user.name.includes(name))
    }
    if (email) {
      filteredData = filteredData.filter((user) => user.email.includes(email))
    }

    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    const response: ApiResponse<PageData<User>> = {
      code: 200,
      message: '成功',
      data: {
        list,
        total: filteredData.length,
        page,
        pageSize
      }
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // 新增用户
  http.post('/api/users', async ({ request }) => {
    const user = (await request.json()) as User

    const newUser: User = {
      ...user,
      id: generateUserId(),
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }

    users.unshift(newUser)

    const response: ApiResponse<User> = {
      code: 200,
      message: '添加成功',
      data: newUser
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // 更新用户
  http.put('/api/users/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const user = (await request.json()) as User

    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
      users[index] = {
        ...user,
        id,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      const response: ApiResponse<User> = {
        code: 200,
        message: '更新成功',
        data: users[index]
      }

      return HttpResponse.json(response, { status: 200 })
    }

    const errorResponse: ApiResponse = {
      code: 404,
      message: '用户不存在',
      data: null
    }

    return HttpResponse.json(errorResponse, { status: 404 })
  }),

  // 删除用户
  http.delete('/api/users/:id', ({ params }) => {
    const id = Number(params.id)
    const index = users.findIndex((u) => u.id === id)

    if (index !== -1) {
      users.splice(index, 1)

      const response: ApiResponse = {
        code: 200,
        message: '删除成功',
        data: null
      }

      return HttpResponse.json(response, { status: 200 })
    }

    const errorResponse: ApiResponse = {
      code: 404,
      message: '用户不存在',
      data: null
    }

    return HttpResponse.json(errorResponse, { status: 404 })
  }),

  // ==================== 商品管理 API ====================

  // 获取商品列表
  http.get('/api/goods', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const pageSize = Number(url.searchParams.get('pageSize')) || 10
    const name = url.searchParams.get('name') || ''
    const category = url.searchParams.get('category') || ''

    // 过滤数据
    let filteredData = [...goods]
    if (name) {
      filteredData = filteredData.filter((item) => item.name.includes(name))
    }
    if (category) {
      filteredData = filteredData.filter((item) => item.category.includes(category))
    }

    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = filteredData.slice(start, end)

    const response: ApiResponse<PageData<Goods>> = {
      code: 200,
      message: '成功',
      data: {
        list,
        total: filteredData.length,
        page,
        pageSize
      }
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // 新增商品
  http.post('/api/goods', async ({ request }) => {
    const goodsItem = (await request.json()) as Goods

    const newGoods: Goods = {
      ...goodsItem,
      id: generateGoodsId(),
      createTime: new Date().toLocaleString('zh-CN'),
      updateTime: new Date().toLocaleString('zh-CN')
    }

    goods.unshift(newGoods)

    const response: ApiResponse<Goods> = {
      code: 200,
      message: '添加成功',
      data: newGoods
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  // 更新商品
  http.put('/api/goods/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const goodsItem = (await request.json()) as Goods

    const index = goods.findIndex((g) => g.id === id)
    if (index !== -1) {
      goods[index] = {
        ...goodsItem,
        id,
        updateTime: new Date().toLocaleString('zh-CN')
      }

      const response: ApiResponse<Goods> = {
        code: 200,
        message: '更新成功',
        data: goods[index]
      }

      return HttpResponse.json(response, { status: 200 })
    }

    const errorResponse: ApiResponse = {
      code: 404,
      message: '商品不存在',
      data: null
    }

    return HttpResponse.json(errorResponse, { status: 404 })
  }),

  // 删除商品
  http.delete('/api/goods/:id', ({ params }) => {
    const id = Number(params.id)
    const index = goods.findIndex((g) => g.id === id)

    if (index !== -1) {
      goods.splice(index, 1)

      const response: ApiResponse = {
        code: 200,
        message: '删除成功',
        data: null
      }

      return HttpResponse.json(response, { status: 200 })
    }

    const errorResponse: ApiResponse = {
      code: 404,
      message: '商品不存在',
      data: null
    }

    return HttpResponse.json(errorResponse, { status: 404 })
  })
]
