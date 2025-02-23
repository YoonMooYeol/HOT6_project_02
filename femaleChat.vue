<template>
  <ChatContainer class="female-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.female-chat {
  :deep(.chat-container) {
    background-color: #F5F5F5;
  }
  :deep(.chat-container.warm) {
    background-color: #ffe2e2;
  }
  :deep(.chat-container) {
    --mine-bubble-color: #ffebf0;
  }
  :deep(.option-btn) {
    background: #d58080;
  }
  :deep(.option-btn:hover) {
    background: #ce5d5d;
  }
}
</style>