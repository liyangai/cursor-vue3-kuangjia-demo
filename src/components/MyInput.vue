<template>
  <div>
    <div>二次封装 input 自定义的内容</div>
    <ElInput v-bind="mergedProps" ref="elRef">
      <!-- <template v-for="(slot, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps" />
      </template> -->

      <template v-for="(_slot, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps"></slot>
      </template>
    </ElInput>
    <!-- <component :is="h(ElInput, { ...$attrs, ...props, ref: changeRef }, $slots)"></component> -->
  </div>
</template>

<script lang="ts" setup>
// <template>
//   <div>
//     <ElInput v-bind="$attrs" v-on="$listeners">
//       <slot name="prepend"></slot>
//       <slot name="append"></slot>
//       <slot></slot> <!-- 默认 slot -->
//     </ElInput>
//   </div>
// </template>

import { ElInput, type InputProps } from 'element-plus'
import { computed, ref, useAttrs } from 'vue'
interface MyInutputProps {
  title?: string
  color?: string
}

setTimeout(() => {
  emit('myBlur', '我是自定义的 input')
}, 1000)

const emit = defineEmits<{ (e: 'myBlur', value: string): void }>()

const props = defineProps<Partial<InputProps> & MyInutputProps>()
const attrs = useAttrs()

// 合并 $attrs 和 props，使用 any 避免类型过于复杂
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mergedProps = computed(() => ({ ...(attrs as any), ...(props as any) }))
const elRef = ref(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineExpose<{ elRef: any }>({
  elRef
})
</script>
