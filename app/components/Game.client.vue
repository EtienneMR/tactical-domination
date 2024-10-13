<script setup lang="ts">
import { GameClient } from "~/game/Game.js";

const props = defineProps<{
  gid: string;
}>();

const loading = defineModel<boolean>();

const gamediv = ref();

const gameClient = new GameClient(props.gid, () => (loading.value = false));

// @ts-expect-error Permet le debug
window.gameClient = gameClient;

onMounted(() => nextTick(async () => gameClient.init(gamediv.value)));

onUnmounted(gameClient.destroy.bind(gameClient));
</script>

<template>
  <div class="flex-1 flex flex-col px-4">
    <div>
      <p>{{ gameClient.events.state }}</p>
    </div>
    <div class="flex-1 gamediv" ref="gamediv"></div>
    <div>
      <p>{{ gameClient.events.state }}</p>
    </div>
  </div>
</template>

<style>
.gamediv > canvas {
  position: absolute;
}
</style>
