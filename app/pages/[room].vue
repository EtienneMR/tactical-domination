<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <Game :room="(route.params.room as string)"></Game>
</template>
