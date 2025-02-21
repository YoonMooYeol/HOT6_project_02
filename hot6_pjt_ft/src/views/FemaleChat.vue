<template>
  <ChatContainer class="female-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.app {
  background-color: #D9D9D9;
}

.chat-container {
  background-color: #F5F5F5;
}

.chat-container.warm {
  background-color: #ffe2e2;
}

.mine .chat-bubble {
  background-color: #ffbece;
}

.option-btn {
  background: #BE7272;
}

.option-btn:hover {
  background: #a64a4a;
}

.female-chat {
  /* 여성 채팅에서는 기본 mine 메시지 색상을 지정합니다. */
  --mine-bubble-color: #ffebf0;
}
</style>
