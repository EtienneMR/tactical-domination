<script setup lang="ts">
const route = useRoute();

useHead({
  htmlAttrs: {
    lang: "en",
  },
  link: [
    {
      rel: "icon",
      type: "image/ico",
      href: "/favicon.ico",
    },
  ],
});

useSeoMeta({
  title: "Tactical domination",
  ogTitle: "Tactical domination",
  ogUrl: () => `https://tactical-domination.etiennemr.fr${route.path}`,
  description: "Jouez a Tactical domination.",
  ogDescription: "Jouez a Tactical domination.",
  ogImage: "https://tactical-domination.etiennemr.fr/title.png",
  twitterTitle: "Tactical domination",
  twitterDescription: "Jouez a Tactical domination.",
  twitterImage: "https://tactical-domination.etiennemr.fr/title.png",
  twitterCard: "summary_large_image",
});

const runtimeConfig = useRuntimeConfig();
</script>

<template>
  <div class="flex flex-col justify-center h-[100vh]">
    <UNotifications />
    <div class="p-3 flex gap-x-3 items-center border-b border-black">
      <NuxtLink href="/">
        <NuxtImg src="/title.png" height="36" width="99" alt="Accueil" />
      </NuxtLink>
      <UTooltip
        text="Version du jeu"
        :popper="{ placement: 'right', arrow: true }"
      >
        <UBadge variant="outline">{{
          runtimeConfig.public.gitVersion
        }}</UBadge></UTooltip
      >
      <div id="header" class="flex flex-1 justify-end"></div>
    </div>
    <NuxtPage />
  </div>
</template>
