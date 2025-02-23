<template>
  <ChatContainer class="male-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.male-chat {
  :deep(.chat-container) {
    background-color: #F5F5F5;
  }
  :deep(.chat-container.warm) {
    background-color: #e2f6ff;
  }
  :deep(.chat-container) {
     --mine-bubble-color: #b1d6f8;
  }
  :deep(.option-btn) {
    background: #6096d3;
  }
  :deep(.option-btn:hover) {
    background: #3c7ec9;
  }
}
</style> 