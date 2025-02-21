<template>
  <ChatContainer class="female-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.female-chat {
  /* 여성 채팅에서는 기본 mine 메시지 색상을 지정합니다. */
  --mine-bubble-color: #ffebf0;
}
</style>
