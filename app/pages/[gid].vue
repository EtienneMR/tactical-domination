<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <Game :gid="'g'+(route.params.gid as string)"></Game>
</template>
