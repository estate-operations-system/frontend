<template>
  <div class="user-operations">
    <h3>Работа с конкретным пользователем (ID):</h3>
    
    <div class="id-input">
      <input
        v-model="localUserId"
        placeholder="Введите ID"
        type="number"
        @input="onIdChange"
      />
    </div>
    
    <div class="buttons">
      <button 
        @click="$emit('get-user', localUserId)"
        :disabled="!localUserId"
      >
        Получить по ID
      </button>
      <button 
        @click="$emit('update-user', localUserId)"
        :disabled="!localUserId"
      >
        Обновить
      </button>
      <button 
        @click="$emit('delete-user', localUserId)"
        :disabled="!localUserId"
        class="delete-btn"
      >
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  userId?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:userId': [id: string]
  'get-user': [id: string]
  'update-user': [id: string]
  'delete-user': [id: string]
}>()

const localUserId = ref(props.userId || '')

const onIdChange = () => {
  emit('update:userId', localUserId.value)
}

watch(() => props.userId, (newId) => {
  localUserId.value = newId || ''
})
</script>