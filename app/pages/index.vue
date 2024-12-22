<script setup lang="ts">
import displayError from "~/game/utils/displayError";
import useSettings from "~/game/utils/useSettings";
import { MAPS } from "~~/shared/consts";

const disabled = ref(false);

async function createAndJoinGame(mapName: string) {
  disabled.value = true;
  const gid = generateId("g");
  try {
    await $fetch("/api/setupgame", {
      method: "POST",
      query: {
        uid: useSettings().uid,
        gid: `${gid}`,
        v: useRuntimeConfig().public.gitVersion,
        mapName,
      },
    });
    await useRouter().push(`/${gid.substring(1)}`);
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
    <ClientOnly>
      <Teleport to="#header">
        <SettingsSlideover />
      </Teleport>
    </ClientOnly>
    <h1>Créer une partie</h1>
    <div class="maplist">
      <div v-for="map of MAPS" class="flex items-center">
        <UButton
          @click="createAndJoinGame(map.id)"
          trailing
          icon="i-heroicons-arrow-right-20-solid"
          :disabled="disabled"
        >
          <img :src="`/maps/${map.id}.png`" width="64" height="64" alt="" />
          <span>{{ map.name }}</span>
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
