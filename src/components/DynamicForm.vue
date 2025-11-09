<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
    <el-form-item v-for="item in items" :key="item.key" :label="item.label" :prop="item.key">
      <slot :name="item.key">
        <component
          :is="getComponent(item)"
          v-bind="getProps(item)"
          v-model="formData[item.key]"
        ></component>
      </slot>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch } from 'vue'
import { ElInput, ElInputNumber, ElSelect } from 'element-plus'
import { omit } from 'lodash-es'

interface FormItem {
  key: string
  label: string
  type?: string | object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>
  hidden?: boolean
}

const props = defineProps<{
  formItems: FormItem[]
  rules?: Record<string, any>
  modelValue?: Record<string, any>
}>()

const emit = defineEmits(['update:modelValue'])

// 内部表单数据，避免与外部 modelValue 冲突
const formData = ref<Record<string, any>>({ ...props.modelValue })

// 初始化时拷贝一次外部值，不再持续 watch
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.value = { ...newVal }
    }
  },
  { deep: true, immediate: true }
)

// 内部 formData 改变时同步给外部
watch(
  formData,
  (newVal) => {
    // 只在真正变化时才 emit
    if (JSON.stringify(newVal) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', newVal)
    }
  },
  { deep: true }
)

const formRef = ref()

// 组件映射
const componentMap: Record<string, any> = {
  input: ElInput,
  number: ElInputNumber,
  select: ElSelect
}

// 过滤掉隐藏的表单项
const items = computed(() => props.formItems.filter((item) => !item.hidden))

function getComponent(item: FormItem) {
  if (item.type && typeof item.type === 'string') {
    return componentMap[item.type] || ElInput
  }
  return item.type || ElInput
}

const rootProps = ['label', 'key', 'type', 'hidden']

function getProps(item: FormItem) {
  if (item.props) return item.props
  return omit(item, rootProps)
}

// 暴露 formRef 给父组件
defineExpose({
  formRef
})
</script>
