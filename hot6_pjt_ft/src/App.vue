<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { startWarmModePolling, stopWarmModePolling } from "./store/warmMode";

onMounted(() => {
  startWarmModePolling();
});

onUnmounted(() => {
  stopWarmModePolling();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
}
</style>

