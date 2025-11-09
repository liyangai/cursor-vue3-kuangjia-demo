<template>
  <div>
    <div v-if="title" class="input-title">{{ title }}</div>
    <ElInput ref="elRef" v-bind="mergedProps" @blur="handleBlur">
      <template v-for="(_slot, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ElInput>
  </div>
</template>

<script lang="ts" setup>
import { ElInput, type InputProps } from 'element-plus'
import { computed, ref, useAttrs } from 'vue'

interface MyInutputProps {
  title?: string
  color?: string
}

// 只定义自定义事件，blur 事件通过 $attrs 自动透传
const emit = defineEmits<{
  (e: 'my-blur', value: string, event: FocusEvent): void
}>()

const props = defineProps<Partial<InputProps> & MyInutputProps>()
const attrs = useAttrs()

// 合并 $attrs 和 props，排除 onBlur（因为我们要拦截它）
const mergedProps = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const { onBlur: _onBlur, ...restAttrs } = attrs as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { ...restAttrs, ...(props as any) }
})

const elRef = ref(null)

// 拦截 blur 事件
const handleBlur = (event: FocusEvent) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  console.log('MyInput 拦截到 blur 事件，输入值:', value)

  // 触发自定义事件 my-blur
  emit('my-blur', value, event)

  // 调用父组件传递的 onBlur 回调（如果有的话），实现真正的透传
  // attrs.onBlur 就是父组件通过 @blur 传递的事件监听器
  if (attrs.onBlur && typeof attrs.onBlur === 'function') {
    attrs.onBlur(event)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineExpose<{ elRef: any }>({
  elRef
})
</script>

<style scoped>
.input-title {
  margin-bottom: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}
</style>
