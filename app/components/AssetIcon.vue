<script setup lang="ts">
import useSettings from "~/game/utils/useSettings.js"

const settings = useSettings()

const props = defineProps<{
  asset: string,
  label: string
}>()
</script>
<template>
  <span class="font-bold">
    <ClientOnly fallback-tag="div" class="h-[1em] w-[1em]">
      <img :src="`/assets/${settings.bundle}/${props.asset}`" class="inline h-[1em] w-[1em]" alt="">
    </ClientOnly> {{ props.label }}
  </span>
</template>