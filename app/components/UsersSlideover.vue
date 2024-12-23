<script setup lang="ts">
import type { GameClient } from "~/game/Game.js";

const isOpen = ref(false);

const { gameClient } = defineProps<{
  gameClient: GameClient;
}>();

const { gameRef } = gameClient;

const groupedUsers = computed(() => {
  const teams = new Map<number | null, User[]>();

  for (const cell of gameRef.value?.state.map ?? []) {
    if (cell.building == "castle" && cell.owner != null) {
      teams.set(cell.owner, []);
    }
    teams.set(null, []);
  }

  for (const user of gameRef.value?.users ?? []) {
    teams.get(user.index)?.push(user);
  }

  return teams;
});

const groupedUsersKeys = computed(() =>
  Array.from(groupedUsers.value.keys()).toSorted(
    (a, b) => (a ?? 100) - (b ?? 100)
  )
);

async function joinTeam(team: number | null) {
  await $fetch("/api/jointeam", {
    method: "POST",
    query: { team, gid: gameClient.gid, uid: gameClient.settings.uid },
  });
}
</script>

<template>
  <div>
    <UButton
      icon="i-mdi-account"
      size="xs"
      aria-label="Joueurs"
      @click="isOpen = true"
    />

    <USlideover v-model="isOpen">
      <TransitionGroup
        name="list"
        tag="div"
        class="p-4 pb-0 flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden"
      >
        <SlideoverH1 key="title">
          <UIcon name="i-mdi-account" />
          <span class="flex-1">Joueurs</span>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-mdi-close"
            @click="isOpen = false"
          />
        </SlideoverH1>
        <hr key="separator" class="text-gray-500" />

        <template v-for="index of groupedUsersKeys" :key="`team-${index}`">
          <SlideoverH2>
            <UIcon name="i-mdi-flag" />
            <span class="flex-1">{{ index ?? "Spectateurs" }}</span>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              icon="i-mdi-account-multiple-plus"
              @click="joinTeam(index)"
            />
          </SlideoverH2>
          <span
            v-for="user of groupedUsers.get(index)"
            :key="`user-${user.uid}`"
            class="flex items-center gap-1"
          >
            <UIcon name="i-mdi-account" /> {{ user.name }}
          </span>
        </template>
      </TransitionGroup>
    </USlideover>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  margin-bottom: -2.5rem;
}
</style>
