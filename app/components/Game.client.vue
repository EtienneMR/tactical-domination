<script setup lang="ts">
import { GameClient } from "~/game/Game.js"

const STATUS_TOAST_ID = "EventSource_Status"

const toast = useToast()

const props = defineProps<{
  gameId: string
}>()

const loading = defineModel<boolean>()

const gamediv = ref()

const gameClient = new GameClient(props.gameId, () => (loading.value = false))

const eventState = gameClient.eventSourceState

// @ts-expect-error Permet le debug
window.gameClient = gameClient

onMounted(() => nextTick(async () => gameClient.init(gamediv.value)))

onUnmounted(gameClient.destroy.bind(gameClient))

onNuxtReady(() =>
  watch(
    eventState,
    state => {
      toast.remove(STATUS_TOAST_ID)
      if (state == "CLOSED") {
        toast.add({
          id: STATUS_TOAST_ID,
          title: "Déconnecté",
          description: "Vous avez été déconnecté",
          color: "red",
          icon: "i-heroicons-exclamation-triangle-16-solid",
          timeout: Infinity,
          actions: [{ label: "Actualiser", click: () => location.reload() }]
        })
      } else if (state == "CONNECTING") {
        toast.add({
          id: STATUS_TOAST_ID,
          title: "Connexion",
          description: "Connexion en cours",
          color: "orange",
          timeout: Infinity
        })
      }
    },
    { immediate: true }
  )
)
</script>

<template>
  <div class="flex-1 flex flex-col px-4 pb-[1px]">
    <Teleport to="#header">
      <UButton
        v-if="eventState == 'OPEN'"
        color="green"
        trailing-icon="i-mdi-access-point"
        size="xs"
        aria-label="Connexion OK"
        @click="gameClient.connect()"
      />
      <UButton
        v-else-if="eventState == 'CONNECTING'"
        label="Connexion"
        color="red"
        trailing-icon="i-mdi-access-point-off"
        size="xs"
        aria-label="Connexion en cours"
        @click="gameClient.connect()"
      />
      <UButton
        v-else-if="eventState == 'CLOSED'"
        label="Déconnecté"
        color="red"
        trailing-icon="i-mdi-server-remove"
        size="xs"
        aria-label="Connexion déconnecté"
        @click="gameClient.connect()"
      />
      <UButton
        v-else
        color="gray"
        trailing-icon="i-mdi-help"
        size="xs"
        aria-label="Connexion inconnu"
        @click="gameClient.connect()"
      />
      <UsersSlideover :gameClient="gameClient" class="ml-2" />
    </Teleport>
    <div class="flex-1 gamediv" ref="gamediv"></div>
  </div>
</template>

<style>
.gamediv > canvas {
  position: absolute;
}
</style>
