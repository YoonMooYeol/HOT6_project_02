<template>
  <div class="female-chat">
    <ChatContainer class="female-chat" />
  </div>
</template>

<script setup>
import ChatContainer from "./ChatContainer.vue";
</script>

<style scoped>
.female-chat {
  /* 여성 채팅 전용 mine 메시지 색상 등 커스터마이징 */
  /* 이제 ChatContainer 내부의 deep 셀렉터로 적용됩니다. */
  .app {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #D9D9D9;
  }

  .chat-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 390px;
    height: 90vh;
    border-radius: 15px;
    margin-right: 30px;
    overflow: hidden;
    background-color: #F5F5F5;
    transition: background-color 0.3s ease;
  }

  .chat-container.warm {
    background-color: #ffe2e2;
  }

  .chat-content {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
  }

  .message-container {
    display: flex;
    width: 100%;
    margin: 5px 0;
  }

  .message-container.mine {
    justify-content: flex-end;
  }

  .message-container.other {
    justify-content: flex-start;
  }

  .chat-bubble {
    max-width: 75%;
    padding: 10px;
    border-radius: 15px;
    background-color: white;
    margin: 2px 0;
    display: flex;
    flex-direction: column;
  }

  .mine .chat-bubble {
    background-color: #ffbece;
  }

  .other .chat-bubble {
    background-color: #c2e2ff;
  }

  .empty-message {
    text-align: center;
    color: #888;
    font-size: 14px;
  }

  .popup {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: 380px;
    background: white;
    padding: 15px;
    border-radius: 15px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
  }

  .options {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 90%;
  }

  .option-btn {
    padding: 10px;
    width: 80%;
    border: none;
    background: #BE7272;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s;
  }

  .option-btn:hover {
    background: #a64a4a;
  }

  .input-content {
    font-size: 0.8em;
    color: #666;
    margin-bottom: 4px;
  }

  .output-content {
    font-size: 1em;
    color: #000;
  }

  /* 여성용 채팅 스타일을 여기서 정의 */
  ::v-deep(.female-chat) .chat-container {
    background-color: #F5F5F5;
  }
  ::v-deep(.female-chat) .chat-container.warm {
    background-color: #ffe2e2;
  }

  ::v-deep(.female-chat) {
    --mine-bubble-color: #ffbece;  /* 내 메시지 색상 */
  }

  ::v-deep(.female-chat) .option-btn {
    background: #BE7272;
  }
  ::v-deep(.female-chat) .option-btn:hover {
    background: #a64a4a;
  }
}
</style>
