<template>
  <div class="auth">
    <PageTitle
      :title="emailMode === 'register' ? 'Регистрация' : 'Вход'"
      :subtitle="emailMode === 'register' ? 'Создайте новый аккаунт' : 'Войдите в свой аккаунт'"
    />

    <EosCard>
      <form
        class="auth__form"
        @submit.prevent="step === 1 ? handleSendCode() : handleVerifyCode()"
      >
        <template v-if="step === 1">
          <EosInput
            v-if="emailMode === 'register'"
            v-model="formData.name"
            :type="InputType.Text"
            placeholder="Введите ваше имя"
            :disabled="isLoading"
          />

          <EosInput
            v-model="formData.email"
            :type="InputType.Email"
            placeholder="Введите вашу почту"
            :disabled="isLoading"
          />

          <EosButton
            type="submit"
            :loading="isLoading"
          >
            Отправить код
          </EosButton>
        </template>

        <template v-else-if="step === 2">
          <EosInput
            v-model="formData.code"
            :type="InputType.Text"
            placeholder="Код из письма"
            :disabled="isLoading"
          />

          <EosButton
            type="submit"
            :loading="isLoading"
          >
            Подтвердить
          </EosButton>
        </template>
      </form>

      <p
        v-if="status"
        :class="['auth__status', `auth__status--${statusClass}`]"
      >
        {{ status }}
      </p>

      <p class="auth__footer p1">
        {{ emailMode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?' }}
        <EosButton
          :variant="ButtonVariant.Tertiary"
          @click="switchEmailMode"
        >
          {{ emailMode === 'register' ? 'Войти' : 'Зарегистрироваться' }}
        </EosButton>
      </p>
    </EosCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { EosButton, EosInput, ButtonVariant, InputType, EosCard } from 'eos-ui-kit'
import PageTitle from '~/components/PageTitle.vue'

const { sendRegistrationCode, verifyRegistrationCode, sendLoginCode, verifyLoginCode } = useAuth()

const emailMode = ref<'login' | 'register'>('login')
const step = ref(1)
const status = ref('')
const statusClass = ref('')
const isLoading = ref(false)

const formData = ref({
  name: '',
  email: '',
  code: ''
})

const switchEmailMode = () => {
  emailMode.value = emailMode.value === 'login' ? 'register' : 'login'
  step.value = 1
  formData.value = { name: '', email: '', code: '' }
  status.value = ''
  statusClass.value = ''
}

const handleSendCode = async () => {
  isLoading.value = true
  status.value = ''
  statusClass.value = ''

  try {
    if (emailMode.value === 'register') {
      if (!formData.value.name || !formData.value.email) {
        status.value = 'Заполните имя и email'
        statusClass.value = 'error'
        return
      }
      await sendRegistrationCode(formData.value.email, formData.value.name)
    } else {
      if (!formData.value.email) {
        status.value = 'Введите email'
        statusClass.value = 'error'
        return
      }
      await sendLoginCode(formData.value.email)
    }

    status.value = 'Код отправлен на ваш email'
    statusClass.value = 'success'
    step.value = 2
  } catch (error: any) {
    status.value = error.message || 'Ошибка отправки кода'
    statusClass.value = 'error'
  } finally {
    isLoading.value = false
  }
}

const handleVerifyCode = async () => {
  if (!formData.value.code) {
    status.value = 'Введите код подтверждения'
    statusClass.value = 'error'
    return
  }

  isLoading.value = true
  status.value = ''
  statusClass.value = ''

  try {
    if (emailMode.value === 'register') {
      await verifyRegistrationCode(formData.value.email, formData.value.code, formData.value.name)
    } else {
      await verifyLoginCode(formData.value.email, formData.value.code)
    }

    status.value = 'Авторизация успешна! Перенаправление...'
    statusClass.value = 'success'

    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  } catch (error: any) {
    status.value = error.message || 'Ошибка верификации'
    statusClass.value = 'error'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth {
  display: flex;
  flex-direction: column;
  gap: var(--eos-spacing-l);
  align-items: center;

  &__form {
    display: flex;
    flex-direction: column;
    gap: var(--eos-spacing-m);
  }

  &__footer {
    text-align: center;
    color: var(--eos-color-primary-900);
    margin-top: var(--eos-spacing-m);
  }

  &__status {
    margin-top: var(--eos-spacing-m);
    padding: var(--eos-spacing-s);
    border-radius: var(--eos-radius-m);
    text-align: center;
    font-size: var(--eos-font-size-m);

    &--success {
      color: var(--eos-color-success-700);
      background-color: var(--eos-color-success-100);
    }

    &--error {
      color: var(--eos-color-danger-700);
      background-color: var(--eos-color-danger-100);
    }
  }
}
</style>
