<script setup lang="ts">
const { disabled, image, name, labels } = defineProps<{
  disabled: boolean;
  image: {
    src: string;
    default: boolean;
  };
  name: string;
  labels: string[];
}>();

const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    class="button flex items-center pr-2"
    :class="[disabled && 'opacity-50']"
    @click="emit('click')"
  >
    <img
      :src="image.src"
      width="64"
      height="64"
      alt=""
      :class="[image.default && 'p-3', 'mr-1', '-m-1']"
      style="image-rendering: pixelated"
    />
    <div class="flex-1 flex flex-col">
      <span>{{ name }}</span>
      <div class="flex-1 flex text-sm text-gray-300 justify-evenly">
        <span v-for="label in labels">{{ label }}</span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.button {
  border: 0.25rem solid transparent;
  border-image: url("/assets/base/ui/button.png") 5 fill;
  transition: opacity 0.25s ease;
}
</style>
