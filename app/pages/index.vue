<script setup lang="ts">
import MapButton from "~/components/MapButton.vue";
import displayError from "~/game/utils/displayError";
import useSettings from "~/game/utils/useSettings";

const disabled = ref(false);

async function createAndJoinGame(mapName: string) {
  disabled.value = true;
  const gameId = generateId("g");
  try {
    await $fetch("/api/setupgame", {
      method: "POST",
      query: {
        userId: useSettings().userId,
        gameId: `${gameId}`,
        v: useRuntimeConfig().public.gitVersion,
        mapName,
      },
    });
    await useRouter().push(`/${gameId.substring(1)}`);
  } catch (error) {
    displayError(
      "Impossible de créer une partie",
      "Nous n'avons pas pu créer votre partie",
      error
    );
  }
  disabled.value = false;
}

function createAndJoinRandomGame() {
  const maps = MAPS.filter((m) => m.label == "1v1");
  const selected = maps[Math.floor(Math.random() * maps.length)]!.id;
  return createAndJoinGame(selected);
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
      <MapButton
        v-for="(map, i) of MAPS"
        :disabled="disabled"
        :image="{
          src: map.image
            ? `/maps/${map.id}.png`
            : `/assets/base/buildings/${i % 4}_castle.png`,
          default: !!map.image,
        }"
        :name="map.name"
        :label="map.label"
        @click="createAndJoinGame(map.id)"
      />
      <MapButton
        :disabled="disabled"
        :image="{ src: `/maps/random.png`, default: false }"
        name="Aléatoire"
        label="1v1"
        @click="createAndJoinRandomGame()"
      />
    </div>
  </div>
</template>

<style scoped>
.maplist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100vw, 300px), 1fr));
  grid-gap: 1em;
  justify-items: stretch;
  width: 100%;
}
</style>
