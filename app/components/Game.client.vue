<script setup lang="ts">
import { GameClient } from "~/game/Game.js";

const props = defineProps<{
  gid: string;
}>();

const gamediv = ref();

const gameClient = new GameClient(props.gid);

// @ts-expect-error Permet le debug
window.webSocket = gameClient.webSocket;
// @ts-expect-error Permet le debug
window.gameClient = gameClient;

watch(gameClient.events.state, (st) => gameClient.messages.push(st), {
  immediate: true,
});

onMounted(() => nextTick(async () => gameClient.init(gamediv.value)));

onUnmounted(gameClient.unmount.bind(gameClient));
</script>

<template>
  <div>
    <div id="status">
      <p>{{ gameClient.events.state }}</p>
    </div>
    <div id="game" ref="gamediv"></div>
  </div>
</template>

<style>
body {
  margin: 0;
  overflow: hidden;
}
#game {
  width: 100vw;
  height: 100vh;
}
#status {
  position: absolute;
  padding: 0 1rem;
  top: 0;
  left: 0;
  right: 0;
}
</style>
