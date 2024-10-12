<script setup lang="ts">
useSeoMeta({
  title: "Tactical domination",
  ogTitle: "Tactical domination",
  description: "Jouez a Tactical domination.",
  ogDescription: "Jouez a Tactical domination.",
  ogImage: "https://tactical-domination.etiennemr.fr/title.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div class="flex flex-col justify-center h-[100vh]">
    <div class="p-3 border-b border-black">
      <NuxtLink href="/">
        <NuxtImg src="/title.png" height="36" width="99" alt="accueil" />
      </NuxtLink>
    </div>
    <NuxtPage />
  </div>
</template>
