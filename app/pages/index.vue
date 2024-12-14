<script setup lang="ts">
import displayError from "~/game/utils/displayError";
import { MAPS } from "~~/shared/consts";
import usePlayerId from "~/game/utils/usePlayerId";

async function createAndJoinGame(mapName: string) {
  const gid = `${Math.floor(Math.random() * 1000000)}`;
  try {
    await $fetch("/api/setupgame", {
      method: "POST",
      query: {
        pid: usePlayerId(),
        gid: `g${gid}`,
        v: useRuntimeConfig().public.gitVersion,
        mapName,
      },
    });
    await useRouter().push(`/${gid}`);
  } catch (error) {
    nuxtApp.runWithContext(()=>displayError(
      "Impossible de créer une partie",
      "Nous n'avons pas pu créer votre partie",
      error
    ));
  }
}
</script>

<template>
  <div class="flex-1 p-4">
    <h1>Créer une partie</h1>
    <p v-for="map of MAPS">
      <UButton
        @click="createAndJoinGame(map.id)"
        trailing
        icon="i-heroicons-arrow-right-20-solid"
      >
        {{ map.name }} </UButton
      ><UBadge class="ml-3">{{ map.label }}</UBadge>
    </p>
  </div>
</template>
