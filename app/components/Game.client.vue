<script setup lang="ts">
import { GameClient } from "~/game/Game.js";

const props = defineProps<{
  room: string;
}>();

const msg = ref("");
const gamediv = ref();

const gameClient = new GameClient(props.room);

// @ts-expect-error Permet le debug
window.webSocket = gameClient.webSocket;
// @ts-expect-error Permet le debug
window.gameClient = gameClient;

watch(gameClient.webSocket.state, (st) => gameClient.messages.push(st), {
  immediate: true,
});

onMounted(() => nextTick(async () => gameClient.init(gamediv.value)));

onUnmounted(gameClient.unmount.bind(gameClient));
</script>

<template>
  <div class="fixed top-4 left-4">
    <p>Status: {{ gameClient.webSocket.state }}</p>
    <hr />
    <p v-for="message in gameClient.messages">{{ message }}</p>
    <form @submit.prevent="gameClient.webSocket.websocket.send(msg)">
      <input v-model="msg" />
      <button type="submit">Envoyer</button>
    </form>
    <div id="game" ref="gamediv"></div>
  </div>
</template>

<style>
body {
  margin: 0;
}
</style>
