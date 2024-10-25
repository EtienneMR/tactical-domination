<script setup lang="ts">
useSeoMeta({
  title: "Tactical domination",
  ogTitle: "Tactical domination",
  description: "Jouez a Tactical domination.",
  ogDescription: "Jouez a Tactical domination.",
  ogImage: "https://tactical-domination.etiennemr.fr/title.png",
  twitterCard: "summary_large_image",
});

const runtimeConfig = useRuntimeConfig();
</script>

<template>
  <div class="flex flex-col justify-center h-[100vh]">
    <UNotifications />
    <div
      class="p-3 border-b flex justify-between align-middle items-center border-black"
    >
      <NuxtLink href="/">
        <NuxtImg src="/title.png" height="36" width="99" alt="Accueil" />
      </NuxtLink>
      <span>V {{ runtimeConfig.public.gitVersion }}</span>
      <div id="header" class="w-[99px] flex justify-end"></div>
    </div>
    <NuxtPage />
  </div>
</template>
