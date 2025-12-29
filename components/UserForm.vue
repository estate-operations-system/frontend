<template>
  <div class="user-form">
    <h3 v-if="title">{{ title }}</h3>
    
    <div class="form-group">
      <input 
        v-model="localUser.name" 
        placeholder="Имя" 
        class="form-input"
      />
    </div>
    
    <div class="form-group">
      <input 
        v-model="localUser.email" 
        placeholder="Email" 
        type="email" 
        class="form-input"
      />
    </div>
    
    <div class="form-group">
      <input 
        v-model.number="localUser.age" 
        placeholder="Возраст" 
        type="number" 
        min="0"
        class="form-input"
      />
    </div>
    
    <slot :user="localUser" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface User {
  name: string
  email: string
  age: number
}

interface Props {
  user?: User
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  user: () => ({ name: '', email: '', age: 0 }),
  title: ''
})

const emit = defineEmits<{
  'update:user': [user: User]
}>()

const localUser = ref<User>({ ...props.user })

watch(localUser, (newValue) => {
  emit('update:user', newValue)
}, { deep: true })

watch(() => props.user, (newUser) => {
  if (newUser) {
    localUser.value = { ...newUser }
  }
})
</script>