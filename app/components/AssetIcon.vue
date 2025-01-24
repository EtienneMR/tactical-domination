<script setup lang="ts">
import useSettings from "~/game/utils/useSettings.js"
import manifest from "~~/public/assets/manifest.json"


const settings = useSettings()

const props = defineProps<{
  asset: string,
  label: string
}>()

const assetPath = computed(() => {
  return manifest.bundles.find(b => b.name == settings.activeBundle)?.assets.find(asset => asset.alias == `${settings.activeBundle}:${props.asset}`)?.src
})

</script>
<template>
  <span class="font-bold">
    <ClientOnly fallback-tag="div" class="h-[1em] w-[1em]">
      <img :src="assetPath" class="inline h-[1em] w-[1em]" alt="">
    </ClientOnly> {{ props.label }}
  </span>
</template>