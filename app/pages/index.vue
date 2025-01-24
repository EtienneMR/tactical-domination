<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core"

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
</script>

<template>
  <div class="flex-1 p-4">
    <ClientOnly>
      <Teleport to="#header">
        <SlideoversSettings />
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
      <TabsCreateGame v-else-if="selectedTab == 1" v-model="disabled" />
      <TabsGameMechanics v-else-if="selectedTab == 2" />
    </Transition>
  </div>
</template>

<style scoped>
.tab-enter-active,
.tab-leave-active {
  transition: opacity 0.25s ease;
}

.tab-enter-from,
.tab-leave-to {
  opacity: 0;
}
</style>
