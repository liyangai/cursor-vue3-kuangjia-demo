import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'

// 启动 Mock Service Worker
async function enableMocking() {
  if (import.meta.env.MODE !== 'production') {
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass' // 未处理的请求直接通过
    })
  }
}

enableMocking().then(() => {
  const app = createApp(App)
  const pinia = createPinia()

  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)

  app.mount('#app')
})
