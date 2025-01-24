<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section>
    <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
    <p class="px-4 mb-1"><slot></slot></p>
  </section>
</template>
