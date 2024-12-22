<script setup lang="ts">
const { icon, label } = defineProps<{
  icon: string;
  label: string;
}>();
</script>

<template>
  <h2
    class="text-md font-semibold flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 mt-4 first-of-type:mt-0"
  >
    <UIcon :name="icon" /> {{ label }}
  </h2>
</template>
