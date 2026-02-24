import { defineNuxtPlugin } from '#app'
import Button from '~/components/ui/Button.vue'
import Card from '~/components/ui/Card.vue'
import Alert from '~/components/ui/Alert.vue'
import Input from '~/components/ui/Input.vue'
import Badge from '~/components/ui/Badge.vue'
import Pagination from '~/components/ui/Pagination.vue'
import Spinner from '~/components/ui/Spinner.vue'
import Breadcrumb from '~/components/ui/Breadcrumb.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('Card', Card)
  nuxtApp.vueApp.component('Alert', Alert)
  nuxtApp.vueApp.component('Input', Input)
  nuxtApp.vueApp.component('Badge', Badge)
  nuxtApp.vueApp.component('Pagination', Pagination)
  nuxtApp.vueApp.component('Spinner', Spinner)
  nuxtApp.vueApp.component('Breadcrumb', Breadcrumb)
})

