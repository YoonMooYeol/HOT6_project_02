<template>
  <ChatContainer class="female-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.female-chat {
  ::v-deep(.female-chat) .chat-container {
    background-color: #F5F5F5;
  }
  ::v-deep(.female-chat) .chat-container.warm {
    background-color: #ffe2e2;
  }
  ::v-deep(.female-chat) {
    --mine-bubble-color: #ffebf0;
  }
  ::v-deep(.female-chat) .option-btn {
  background: #d58080;
  }
  ::v-deep(.female-chat) .option-btn:hover {
    background: #ce5d5d;
  }
}
</style>
