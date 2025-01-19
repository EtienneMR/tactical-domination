<script setup lang="ts">
const { disabled, image, name, label } = defineProps<{
  disabled: boolean;
  image: {
    src: string;
    default: boolean;
  };
  name: string;
  label?: string;
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <div class="flex items-center">
    <UButton
      @click="emit('click')"
      trailing
      icon="i-heroicons-arrow-right-20-solid"
      class="p-1.5"
      :disabled="disabled"
    >
      <img
        :src="image.src"
        width="64"
        height="64"
        alt=""
        :class="image.default ? 'p-1' : ''"
        style="image-rendering: pixelated"
      />
      <span>{{ name }}</span>
    </UButton>
    <UBadge v-if="label" class="ml-3">{{ label }}</UBadge>
  </div>
</template>
