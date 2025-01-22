<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core"
import MapButton from "~/components/MapButton.vue"
import displayError from "~/game/utils/displayError"
import useSettings from "~/game/utils/useSettings"

const route = useRoute()
const router = useRouter()
const breakpoints = useBreakpoints(breakpointsTailwind)
const smallerMd = breakpoints.smaller("sm")
const loaded = useState("loaded", () => false)
const isVerticalTabs = computed(() => smallerMd.value && loaded.value)

onNuxtReady(() => (loaded.value = true))

const tabs = [
  {
    label: "Parties en cours",
    icon: "i-mdi-content-save-outline",
    disabled: true,
  },
  {
    label: "Nouvelle partie",
    icon: "i-mdi-earth",
  },
  {
    label: "Règles du jeu",
    icon: "i-mdi-book-outline",
  },
]

const players = Object.keys(
  MAPS.reduce((l, m) => ({ ...l, [m.players]: true }), {})
).toSorted()

const disabled = ref(false)
const selectedTab = computed({
  get() {
    const index = tabs.findIndex((item) => item.label === route.query?.t)
    if (index === -1) {
      return tabs.findIndex((item) => !item.disabled)
    }

    return index
  },
  set(value) {
    router.replace({
      query: { t: tabs[value]?.label },
    })
  },
})
const selectedMods = ref([] as string[])
const selectedPlayers = ref([] as string[])

const maps = computed(() =>
  MAPS.filter(
    (m) =>
      (selectedPlayers.value.length == 0 ||
        selectedPlayers.value.includes(m.players)) &&
      (selectedMods.value.length == 0 || selectedMods.value.includes(m.mode))
  )
    .toSorted((m1, m2) => m1.players.localeCompare(m2.players))
    .toSorted((m1, m2) => m1.mode.localeCompare(m2.mode))
)

async function createAndJoinGame(mapName: string) {
  disabled.value = true
  const gameId = generateId("g")
  try {
    await $fetch("/api/setupgame", {
      method: "POST",
      query: {
        userId: useSettings().userId,
        gameId: `${gameId}`,
        v: useRuntimeConfig().public.gitVersion,
        mapName,
      },
    })
    await useRouter().push(`/${gameId.substring(1)}`)
  } catch (error) {
    displayError(
      "Impossible de créer une partie",
      "Nous n'avons pas pu créer votre partie",
      error
    )
  }
  disabled.value = false
}

function createAndJoinRandomGame() {
  const selected =
    maps.value[Math.floor(Math.random() * maps.value.length)]?.id
  if (selected) return createAndJoinGame(selected)
}
</script>

<template>
  <div class="flex-1 p-4">
    <ClientOnly>
      <Teleport to="#header">
        <SettingsSlideover />
      </Teleport>
    </ClientOnly>
    <div class="flex flex-col items-center mb-4">
      <NuxtImg src="/title.png" class="max-w-full sm:max-w-lg"></NuxtImg>
      <h1 class="text-xl font-bold hidden md:block">
        Le jeu de stratégie 2d en ligne
      </h1>
    </div>

    <UTabs :items="tabs" class="w-full" :orientation="isVerticalTabs ? 'vertical' : 'horizontal'" v-model="selectedTab">
      <template #icon="{ item, selected }">
        <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0 me-2"
          :class="[selected && 'text-primary-500 dark:text-primary-400']" />
      </template>
    </UTabs>
    <Transition mode="out-in" name="tab">
      <div v-if="selectedTab == 0"></div>
      <div v-else-if="selectedTab == 1">
        <div class="mb-2 flex flex-wrap justify-center gap-1">
          <USelectMenu multiple class="w-64" :options="players" v-model="selectedPlayers">
            <template #label>
              <span v-if="selectedPlayers.length" class="truncate">{{
                selectedPlayers.join(", ")
                }}</span>
              <span v-else class="text-gray-500">Disposition des joueurs</span>
            </template>
          </USelectMenu>
          <USelectMenu multiple class="w-64" value-attribute="name" :options="MAP_MODES" v-model="selectedMods">
            <template #label>
              <span v-if="selectedMods.length" class="truncate">{{
                selectedMods
                  .map((mn) => MAP_MODES.find((m) => m.name == mn)!.label)
                  .join(", ")
              }}</span>
              <span v-else class="text-gray-500">Mode de jeu</span>
            </template>
          </USelectMenu>
        </div>

        <TransitionGroup name="maplist" tag="div" class="maplist overflow-visible">
          <MapButton v-for="map of maps" :key="map.id" :disabled="disabled" :image="{
            src: map.image
              ? `/maps/${map.id}.png`
              : `/assets/base/buildings/${MAPS.findIndex((m) => m.id == map.id) % 4
              }_castle.png`,
            default: !map.image,
          }" :name="map.name" :labels="[
              map.players,
              MAP_MODES.find((m) => m.name == map.mode)!.label,
            ]" @click="createAndJoinGame(map.id)" />
          <MapButton key="random" :disabled="disabled" :image="{ src: `/maps/random.png`, default: false }" :labels="[]"
            name="Aléatoire" @click="createAndJoinRandomGame()" />
        </TransitionGroup>
      </div>
      <div v-else-if="selectedTab == 2">
        <h2 class="text-lg font-semibold">Règles</h2>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.maplist {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
  grid-gap: 1em;
  justify-items: stretch;
  width: 100%;
}

.maplist-move,
.maplist-enter-active,
.maplist-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.maplist-enter-from,
.maplist-leave-to {
  opacity: 0;
}

.maplist-leave-active {
  position: fixed;
}

.tab-enter-active,
.tab-leave-active {
  transition: opacity 0.25s ease;
}

.tab-enter-from,
.tab-leave-to {
  opacity: 0;
}
</style>
