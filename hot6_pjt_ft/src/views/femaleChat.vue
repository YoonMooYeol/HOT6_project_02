<template>
  <ChatContainer class="female-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.female-chat {
  /* 여성 채팅 전용 mine 메시지 색상 등 커스터마이징 */
  /* 이제 ChatContainer 내부의 deep 셀렉터로 적용됩니다. */
}
</style>
