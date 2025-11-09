# DynamicForm 更新说明

## ✅ 已完成适配

DynamicForm 已按照你的要求重构，其他文件也已更新以适配新的 API。

## 🔄 DynamicForm 变更

### 从对话框组件 → 纯表单组件

#### ❌ 之前的 API

```vue
<dynamic-form
  v-model="dialogVisible"
  :mode="formMode"
  :fields="fields"
  :data="formData"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

- 包含 `el-dialog`
- 自带标题、按钮
- 使用 `fields` 配置

#### ✅ 现在的 API

```vue
<dynamic-form
  ref="formRef"
  v-model="formData"
  :form-items="formItems"
  :rules="rules"
/>
```

- 纯表单组件
- 无对话框
- 使用 `formItems` 配置
- 支持 `v-model` 双向绑定

## 📋 API 对比

| 属性/事件 | 旧版 | 新版 | 说明 |
|----------|------|------|------|
| **Props** |
| `modelValue` | ✅ 对话框显示/隐藏 | ✅ 表单数据 | 用途变化 |
| `mode` | ✅ add/edit/view | ❌ 移除 | 由父组件控制 |
| `fields` | ✅ 字段配置 | ❌ 移除 | 改为 formItems |
| `formItems` | ❌ 无 | ✅ 字段配置 | 新格式 |
| `rules` | ❌ 从 fields 推导 | ✅ 独立配置 | 更灵活 |
| `data` | ✅ 表单数据 | ❌ 移除 | 改用 v-model |
| **Events** |
| `submit` | ✅ 提交事件 | ❌ 移除 | 由父组件处理 |
| `cancel` | ✅ 取消事件 | ❌ 移除 | 由父组件处理 |
| `update:modelValue` | ✅ 对话框 | ✅ 表单数据 | 用途变化 |

## 🔧 FormItems 格式

### 旧格式 (fields)

```typescript
interface FormField {
  prop: keyof T
  label: string
  type?: 'input' | 'textarea' | 'select' | 'number'
  options?: Array<{ label: string; value: unknown }>
  required?: boolean
  rules?: unknown[]
}
```

### 新格式 (formItems)

```typescript
interface FormItem {
  key: string  // 之前是 prop
  label: string
  type?: string | object  // 支持 Vue 组件
  props?: Record<string, any>  // 组件属性
  hidden?: boolean  // 动态隐藏
}
```

## 📝 CrudTable 适配

### 主要变更

1. **添加 el-dialog 包裹**

```vue
<el-dialog v-model="dialogVisible" :title="dialogTitle">
  <dynamic-form ref="formRef" v-model="formData" :form-items="formItems" :rules="rules" />
  <template #footer>
    <el-button @click="handleCancel">取消</el-button>
    <el-button type="primary" @click="handleSubmit">确定</el-button>
  </template>
</el-dialog>
```

2. **转换 fields 为 formItems**

```typescript
const formItems = computed(() => {
  return props.config.formFields.map((field) => ({
    key: field.prop.toString(),  // prop → key
    label: field.label,
    type: field.type,
    props: field.options ? { options: field.options } : undefined,
    hidden: false
  }))
})
```

3. **独立管理 rules**

```typescript
const formRules = computed(() => {
  const rules: Record<string, any> = {}
  props.config.formFields.forEach((field) => {
    if (field.required) {
      rules[field.prop.toString()] = [
        { required: true, message: `请输入${field.label}`, trigger: 'blur' }
      ]
    }
    if (field.rules) {
      rules[field.prop.toString()] = field.rules
    }
  })
  return rules
})
```

4. **表单验证**

```typescript
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.formRef.validate()  // 调用 Element Plus 的 validate
    let success = false
    if (formMode.value === 'add') {
      success = await props.onAdd(formData.value as T)
    } else if (formMode.value === 'edit') {
      success = await props.onUpdate(formData.value as T)
    }
    
    if (success) {
      ElMessage.success(formMode.value === 'add' ? '新增成功' : '更新成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
```

## 🎯 使用示例

### 在 CrudTable 中（自动适配）

```vue
<crud-table
  :config="crudConfig"
  :on-load="handleLoad"
  :on-add="handleAdd"
  :on-update="handleUpdate"
  :on-delete="handleDelete"
/>
```

无需修改，完全兼容！

### 独立使用 DynamicForm

```vue
<template>
  <el-dialog v-model="visible">
    <dynamic-form
      ref="formRef"
      v-model="formData"
      :form-items="formItems"
      :rules="rules"
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
const formItems = [
  {
    key: 'name',
    label: '姓名',
    type: 'input'
  },
  {
    key: 'age',
    label: '年龄',
    type: 'number'
  }
]

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }]
}

const formData = ref({})
const formRef = ref()

const handleSubmit = async () => {
  await formRef.value.formRef.validate()
  console.log('提交:', formData.value)
}
</script>
```

## 🆕 新特性

### 1. 动态组件渲染

```vue
<component
  :is="getComponent(item)"
  v-bind="getProps(item)"
  v-model="formData[item.key]"
/>
```

### 2. 插槽支持

```vue
<dynamic-form ...>
  <template #name>
    <el-input v-model="formData.name" custom />
  </template>
</dynamic-form>
```

### 3. 动态隐藏字段

```typescript
const formItems = computed(() => [
  {
    key: 'adminCode',
    label: '管理员代码',
    type: 'input',
    hidden: userType.value !== 'admin'  // 根据条件隐藏
  }
])
```

### 4. 自定义组件

```typescript
import MyCustomInput from './MyCustomInput.vue'

const formItems = [
  {
    key: 'custom',
    label: '自定义',
    type: MyCustomInput,  // 直接传入 Vue 组件
    props: { customProp: 'value' }
  }
]
```

## 📦 依赖

需要安装 `lodash-es`：

```bash
npm install lodash-es
```

已在 DynamicForm 中使用：

```typescript
import { omit } from 'lodash-es'
```

## ✅ 验证清单

- [x] DynamicForm 重构完成
- [x] CrudTable 适配完成
- [x] formFields → formItems 转换
- [x] rules 独立管理
- [x] 表单验证逻辑适配
- [x] 对话框管理移至父组件
- [x] v-model 双向绑定
- [x] defineExpose 暴露 formRef
- [x] lodash-es 依赖检查
- [x] 无 Linter 错误（只有 any 的 warning）

## 🎉 完成

所有文件已更新以适配新的 DynamicForm API！

**主要改进：**
- ✅ 更纯粹的组件设计（关注点分离）
- ✅ 更灵活的使用方式
- ✅ 支持动态组件和插槽
- ✅ 更好的类型支持
- ✅ 向下兼容（CrudTable 自动适配）

现在可以正常运行了！🚀

