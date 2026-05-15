<template>
  <div class="loader">
    <EosLoader />
  </div>
</template>

<script setup lang="ts">
import { EosLoader } from 'eos-ui-kit'
</script>

<style lang="scss" scoped>
.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
