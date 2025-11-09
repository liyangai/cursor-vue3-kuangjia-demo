import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建 Service Worker
export const worker = setupWorker(...handlers)
