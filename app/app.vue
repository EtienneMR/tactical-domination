<script setup lang="ts">
const route = useRoute();

useHead({
  htmlAttrs: {
    lang: "fr",
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
  <div class="flex flex-col justify-center min-h-[100vh]">
    <UNotifications />
    <div class="p-3 flex items-center border-b border-black">
      <NuxtLink href="/">
        <NuxtImg src="/title.png" height="36" width="99" alt="Accueil" />
      </NuxtLink>
      <UTooltip
        :text="runtimeConfig.public.gitMessage"
        class="ml-3"
        :popper="{ placement: 'bottom', arrow: true }"
      >
        <UBadge variant="outline">{{ runtimeConfig.public.gitVersion }}</UBadge>
      </UTooltip>
      <UButton
        icon="i-mdi-github"
        variant="outline"
        size="2xs"
        class="ml-1"
        target="_blank"
        to="https://github.com/EtienneMR/tactical-domination"
        aria-label="github"
      ></UButton>
      <UButton
        variant="outline"
        size="2xs"
        class="ml-1 p-1"
        target="_blank"
        to="https://etiennemr.fr"
        aria-label="etiennemr.fr"
      >
        <img
          src="https://share.etiennemr.fr/f/icons/icon.png"
          class="h-4 w-4"
        />
      </UButton>

      <div id="header" class="flex flex-1 justify-end"></div>
    </div>
    <NuxtPage />
  </div>
</template>

<style>
body {
  @apply bg-bondi-blue-500;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
