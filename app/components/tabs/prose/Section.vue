<script setup lang="ts">
defineProps<{
  title: string,
  icon: string
}>()
</script>

<template>
  <section>
    <h1 class="flex gap-1 items-center text-xl font-bold mb-1"><UIcon :name="icon"/>{{ title }}</h1>
      <div class="px-4 mb-1"><slot></slot></div>
  </section>
</template>
