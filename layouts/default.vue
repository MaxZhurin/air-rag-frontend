<template>
  <div class="default-layout">
    <div class="default-layout__scrolled-container">
      <main class="default-layout__content">
        <slot/>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

defineOptions({
  name: 'DefaultLayout',
});
</script>
