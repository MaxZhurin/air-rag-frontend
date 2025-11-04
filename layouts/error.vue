<template>
  <div class="error-layout">
    <div>
      <layout-the-header-error />

      <main class="error-layout__content">
        <slot />
      </main>

      <modals-container />
    </div>
  </div>
</template>

<script setup lang="ts">
import {ModalsContainer} from 'vue-final-modal';

defineOptions({
  name: 'ErrorLayout',
});
</script>

<style lang="scss">
.error-layout {
  &__content {
    display: flex;
  }

  &__content-is-loading {
    position: absolute;
    display: block;
    margin: 15% 50%;
  }

  &__content-page {
    flex-grow: 1;
    max-width: 100%;
  }
}
</style>
