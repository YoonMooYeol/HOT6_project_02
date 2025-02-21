<template>
  <ChatContainer class="male-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.male-chat {
  /* 남성 채팅의 mine 메시지 배경색을 변경 */
  --mine-bubble-color: #cce6ff;
}

</style>
  