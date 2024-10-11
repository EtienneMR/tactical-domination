<script setup lang="ts">
function getValue() {
  return `${Math.floor(Math.random() * 1000000)}`;
}

const id = useState(getValue);

onBeforeRouteLeave(() => void (id.value = getValue()));
</script>

<template>
  <div class="flex-1 p-4">
    <UButton :to="'/' + id" trailing icon="i-heroicons-arrow-right-20-solid">
      g{{ id }}
    </UButton>
  </div>
</template>
