<script setup lang="ts">
import displayError from "~/game/utils/displayError";
import usePlayerId from "~/game/utils/usePlayerId";
import { MAPS } from "~~/shared/consts";

const disabled = ref(false);

async function createAndJoinGame(mapName: string) {
  disabled.value = true;
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
    displayError(
      "Impossible de créer une partie",
      "Nous n'avons pas pu créer votre partie",
      error
    );
  }
  disabled.value = false;
}
</script>

<template>
  <div class="flex-1 p-4">
    <h1>Créer une partie</h1>
    <div class="maplist">
      <div v-for="map of MAPS" class="flex items-center">
        <UButton
          @click="createAndJoinGame(map.id)"
          trailing
          icon="i-heroicons-arrow-right-20-solid"
          :disabled="disabled"
        >
          <img
            :src="`/maps/${map.id}.png`"
            width="64"
            height="64"
            :aria-labelledby="`map-icon-${map.id}`"
          />
          <span :id="`map-icon-${map.id}`">{{ map.name }}</span>
        </UButton>
        <UBadge class="ml-3">{{ map.label }}</UBadge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maplist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100vw, 400px), 1fr));
  grid-gap: 1em;
  justify-items: stretch;
  width: 100%;
}
</style>
