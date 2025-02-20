<template>
  <!-- 전체 앱을 감싸는 최상위 컨테이너 -->
  <div class="app">
    <!-- 채팅창을 감싸는 컨테이너. isWarmMode에 따라 배경색이 변경됨 -->
    <div class="chat-container" :class="{ warm: warmState.isWarmMode }">
      <!-- 상단 네비게이션 바 컴포넌트. isWarmMode 상태를 props로 전달 -->
      <navBar />

      <!-- 실제 채팅 메시지들이 표시되는 영역 -->
      <div class="chat-content">
        <!-- 메시지가 없을 때 표시되는 안내 문구 -->
        <p v-if="messages.length === 0" class="empty-message">메시지가 없습니다.</p>

        <!-- 메시지 목록을 순회하며 각 메시지를 표시 -->
        <div
          v-for="(message, index) in sortedMessages"
          :key="index"
          :class="['message-container', message.isMine ? 'mine' : 'other']"
        >
          <!-- 개별 메시지 말풍선 -->
          <div class="chat-bubble">
            <!-- 내 메시지일 때는 원본과 번역 모두 표시 -->
            <template v-if="message.isMine">
              <div v-if="message.input_content" class="input-content">
                {{ message.input_content }}
              </div>
              <div v-if="message.text && !message.isOriginal" class="output-content">
                {{ message.text }}
              </div>
            </template>
            <!-- 상대방 메시지일 때는 번역된 메시지만 표시 -->
            <template v-else>
              <div class="output-content">
                {{ message.text }}
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 번역 옵션 선택을 위한 팝업 창 -->
      <div v-if="state.isPopupVisible" class="popup">
        <div class="popup-content">
          <!-- 팝업 닫기 버튼 -->
          <button class="close-btn" @click="state.isPopupVisible = false">×</button>
          <!-- 번역 옵션 버튼들을 표시하는 영역 -->
          <div class="options">
            <button v-for="(option, index) in options" 
                    :key="index" 
                    class="option-btn"
                    @click="selectOption(option, index)">
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- 하단 입력 바 컴포넌트. 모드 변경과 옵션 표시 이벤트를 처리 -->
      <footBar 
        @updateWarmMode="updateWarmMode"
        @showOptions="showOptions" 
      />
    </div>
  </div>
</template>

<script setup>
import NavBar from "../components/NavBar.vue";
import FootBar from "../components/FootBar.vue";
import { useChat } from "../composables/useChat";
import { onMounted, onUnmounted } from "vue";

const {
  sortedMessages,
  messages,
  options,
  state,
  warmState,
  showOptions,
  selectOption,
  updateWarmMode,
  setupChat
} = useChat();

let cleanup;
onMounted(() => {
  cleanup = setupChat();
});

onUnmounted(() => {
  if (cleanup) cleanup();
});
</script>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d8faff;
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
  background-color: #FFFFFF;
  transition: background-color 0.3s ease;
}

.chat-container.warm {
  background-color: #FFE0E0;
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
  gap: 4px;
}

.mine .chat-bubble {
  background-color: #ffebf0;
}

.other .chat-bubble {
  background-color: #fff;
}

/* 입력 메시지와 출력 메시지의 스타일 통일 */
.input-content, .output-content {
  font-size: 1em;
  color: #000;
  line-height: 1.4;
  word-break: break-word;
}

/* 번역된 메시지가 있을 때만 입력 메시지 스타일 변경 */
.chat-bubble:has(.output-content) .input-content {
  font-size: 0.9em;
  color: #666;
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
  background: #ff69b4;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.option-btn:hover {
  background: #ff1493;
}
</style>
