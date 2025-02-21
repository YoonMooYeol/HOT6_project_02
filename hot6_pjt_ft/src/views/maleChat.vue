<template>
  <!-- ChatContainer 내부에 모든 공통 구조 및 디자인이 포함됨 -->
  <ChatContainer class="male-chat" />
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.male-chat {
  /* 남성 채팅 전용 mine 메시지 색상 등 커스터마이징 */
  /* 실제 스타일 적용은 ChatContainer.vue의 deep 셀렉터로 처리됨 */
}
</style>
  