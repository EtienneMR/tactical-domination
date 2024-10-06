<script setup lang="ts">
import { Application, Assets, Container, Sprite } from "pixi.js";

const status = ref("Unknown");
const msg = ref("");
const messages = reactive([] as string[]);

const ws = new WebSocket("ws://localhost:3000/_ws");

const app = new Application();

// @ts-expect-error Permet le debug
window.ws = ws;

function update() {
  status.value =
    ws.readyState == ws.CLOSED
      ? "CLOSED"
      : ws.readyState == ws.CLOSING
      ? "CLOSING"
      : ws.readyState == ws.CONNECTING
      ? "CONNECTING"
      : ws.readyState == ws.OPEN
      ? "OPEN"
      : "Unknown";

  console.log(status.value);
}

async function writeMessage({ data }: MessageEvent) {
  messages.push(typeof data == "string" ? data : await data.text());
}

watch(status, (st) => messages.push(st));

onUnmounted(() => {
  ws.close();
  ws.removeEventListener("open", update);
  ws.removeEventListener("close", update);
  ws.removeEventListener("message", update);
  ws.removeEventListener("message", writeMessage);
  app.canvas.remove();
  app.destroy();
});

ws.addEventListener("open", update);
ws.addEventListener("close", update);
ws.addEventListener("message", update);
ws.addEventListener("message", writeMessage);
update();

// Initialize the application
await app.init({ background: "#1099bb", resizeTo: window });

// Append the application canvas to the document body
document.body.appendChild(app.canvas);

// Create and add a container to the stage
const container = new Container();

app.stage.addChild(container);

// Load the bunny texture
const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

// Create a 5x5 grid of bunnies in the container
for (let i = 0; i < 25; i++) {
  const bunny = new Sprite(texture);

  bunny.x = (i % 5) * 40;
  bunny.y = Math.floor(i / 5) * 40;
  container.addChild(bunny);
}

// Move the container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

// Center the bunny sprites in local container coordinates
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

// Listen for animate update
app.ticker.add((time) => {
  // Continuously rotate the container!
  // * use delta to create frame-independent transform *
  container.rotation -= 0.01 * time.deltaTime;
});
</script>

<template>
  <div>
    <p>Status: {{ status }}</p>
    <hr />
    <p v-for="message in messages">{{ message }}</p>
    <form @submit.prevent="ws.send(msg)">
      <input v-model="msg" />
      <button type="submit">Envoyer</button>
    </form>
  </div>
</template>
