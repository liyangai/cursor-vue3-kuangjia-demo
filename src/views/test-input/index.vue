<template>
  <div class="test-input-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>MyInput 事件透传测试</span>
        </div>
      </template>

      <div class="test-section">
        <h3>测试1: blur 事件透传</h3>
        <p class="desc">输入内容后失去焦点，查看是否触发原生 blur 事件</p>
        <MyInput placeholder="请输入内容后点击其他地方" clearable @blur="onBlur" />
        <div v-if="blurInfo" class="event-info">
          <el-tag type="success">✅ blur 事件已触发</el-tag>
          <p>触发时间: {{ blurInfo.time }}</p>
          <p>事件类型: {{ blurInfo.type }}</p>
        </div>
      </div>

      <el-divider />

      <div class="test-section">
        <h3>测试2: 自定义 my-blur 事件</h3>
        <p class="desc">输入内容后失去焦点，查看是否触发自定义 my-blur 事件</p>
        <MyInput title="带标题的输入框" placeholder="请输入内容" clearable @my-blur="onMyBlur" />
        <div v-if="myBlurInfo" class="event-info">
          <el-tag type="warning">🎉 my-blur 自定义事件已触发</el-tag>
          <p>输入的值: {{ myBlurInfo.value }}</p>
          <p>触发时间: {{ myBlurInfo.time }}</p>
        </div>
      </div>

      <el-divider />

      <div class="test-section">
        <h3>测试3: 同时监听 blur 和 my-blur</h3>
        <p class="desc">两个事件都会触发，互不影响</p>
        <MyInput
          title="用户名"
          placeholder="请输入用户名"
          clearable
          show-word-limit
          maxlength="20"
          @blur="onBothBlur"
          @my-blur="onBothMyBlur"
        />
        <div class="event-info">
          <div v-if="bothEvents.blur" class="event-item">
            <el-tag type="info">blur 事件触发次数: {{ bothEvents.blurCount }}</el-tag>
            <p>最后触发: {{ bothEvents.blur }}</p>
          </div>
          <div v-if="bothEvents.myBlur" class="event-item">
            <el-tag type="warning">my-blur 事件触发次数: {{ bothEvents.myBlurCount }}</el-tag>
            <p>最后输入值: {{ bothEvents.myBlur }}</p>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="test-section">
        <h3>测试4: 其他 ElInput 事件透传</h3>
        <p class="desc">测试 input、change、focus、clear 等事件是否正常透传</p>
        <MyInput
          v-model="inputValue"
          title="全事件测试"
          placeholder="随便输入点什么"
          clearable
          @input="onInput($event)"
          @change="onChange"
          @focus="onFocus"
          @clear="onClear"
        />
        <div class="event-info">
          <p><strong>当前值:</strong> {{ inputValue }}</p>
          <div class="event-logs">
            <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
              <el-tag :type="getLogType(log.event)" size="small">{{ log.event }}</el-tag>
              <span class="log-time">{{ log.time }}</span>
              <span v-if="log.value !== undefined" class="log-value">值: {{ log.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <div class="test-section">
        <h3>测试5: 属性透传 + 插槽</h3>
        <p class="desc">测试 ElInput 的原生属性和插槽是否正常透传</p>
        <MyInput title="搜索" placeholder="请输入搜索内容" size="large" clearable>
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary">搜索</el-button>
          </template>
        </MyInput>
      </div>

      <div class="test-section">
        <MyInput title="价格" placeholder="请输入价格" type="number">
          <template #prepend>¥</template>
          <template #append>.00</template>
        </MyInput>
      </div>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>控制台日志</span>
          <el-button size="small" @click="clearLogs">清空日志</el-button>
        </div>
      </template>
      <div class="console-logs">
        <p class="tip">💡 打开浏览器控制台查看详细日志</p>
        <p class="tip">所有事件触发时都会在控制台输出详细信息</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyInput from '@/components/MyInput.vue'
import { Search } from '@element-plus/icons-vue'

// 测试1: blur 事件
const blurInfo = ref<{ time: string; type: string } | null>(null)
const onBlur = (event: FocusEvent) => {
  console.log('📍 blur 事件触发:', event)
  blurInfo.value = {
    time: new Date().toLocaleTimeString(),
    type: event.type
  }
}

// 测试2: my-blur 事件
const myBlurInfo = ref<{ value: string; time: string } | null>(null)
const onMyBlur = (value: string, event: FocusEvent) => {
  console.log('🎉 my-blur 自定义事件触发:', { value, event })
  myBlurInfo.value = {
    value,
    time: new Date().toLocaleTimeString()
  }
}

// 测试3: 同时监听
const bothEvents = ref({
  blur: '',
  myBlur: '',
  blurCount: 0,
  myBlurCount: 0
})

const onBothBlur = (event: FocusEvent) => {
  console.log('📍 同时监听 - blur 事件:', event)
  bothEvents.value.blur = new Date().toLocaleTimeString()
  bothEvents.value.blurCount++
}

const onBothMyBlur = (value: string, event: FocusEvent) => {
  console.log('🎉 同时监听 - my-blur 事件:', { value, event })
  bothEvents.value.myBlur = value
  bothEvents.value.myBlurCount++
}

// 测试4: 其他事件
const inputValue = ref('')
const eventLogs = ref<Array<{ event: string; time: string; value?: string }>>([])

const addLog = (event: string, value?: string) => {
  eventLogs.value.unshift({
    event,
    time: new Date().toLocaleTimeString(),
    value
  })
  // 只保留最近10条
  if (eventLogs.value.length > 10) {
    eventLogs.value = eventLogs.value.slice(0, 10)
  }
}

const onInput = (value: string) => {
  console.log('⌨️ input 事件:', value)
  addLog('input', value)
}

const onChange = (value: string) => {
  console.log('🔄 change 事件:', value)
  addLog('change', value)
}

const onFocus = (event: FocusEvent) => {
  console.log('👆 focus 事件:', event)
  addLog('focus')
}

const onClear = () => {
  console.log('🗑️ clear 事件触发')
  addLog('clear')
}

const getLogType = (event: string) => {
  const types: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
    input: 'success',
    change: 'warning',
    focus: 'info',
    clear: 'danger'
  }
  return types[event] || 'info'
}

const clearLogs = () => {
  eventLogs.value = []
  blurInfo.value = null
  myBlurInfo.value = null
  bothEvents.value = {
    blur: '',
    myBlur: '',
    blurCount: 0,
    myBlurCount: 0
  }
  console.clear()
}
</script>

<style scoped>
.test-input-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-section {
  margin-bottom: 30px;
}

.test-section h3 {
  color: #303133;
  font-size: 18px;
  margin-bottom: 10px;
}

.desc {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.event-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.event-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.event-item {
  margin-bottom: 10px;
}

.event-logs {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.log-item:hover {
  background-color: #f5f7fa;
}

.log-time {
  color: #909399;
  font-size: 12px;
}

.log-value {
  color: #409eff;
  font-size: 13px;
  font-weight: 500;
}

.console-logs {
  padding: 20px;
  text-align: center;
}

.tip {
  color: #909399;
  font-size: 14px;
  margin: 10px 0;
}
</style>
