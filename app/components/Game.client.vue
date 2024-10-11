<script setup lang="ts">
import { GameClient } from "~/game/Game.js";

const props = defineProps<{
  gid: string;
}>();

const loading = defineModel<boolean>();

const gamediv = ref();

const gameClient = new GameClient(props.gid, () => (loading.value = false));

// @ts-expect-error Permet le debug
window.webSocket = gameClient.webSocket;
// @ts-expect-error Permet le debug
window.gameClient = gameClient;

watch(gameClient.events.state, (st) => gameClient.messages.push(st), {
  immediate: true,
});

onMounted(() => nextTick(async () => gameClient.init(gamediv.value)));

onUnmounted(gameClient.destroy.bind(gameClient));
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="px-4">
      <p>{{ gameClient.events.state }}</p>
    </div>
    <div class="flex-1 w-[100vw]" ref="gamediv"></div>
  </div>
</template>

<style>
body {
  margin: 0;
  overflow: hidden;
}
</style>
