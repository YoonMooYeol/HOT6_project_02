<template>
  <div class="foot-bar">
    <button class="heart-button" 
      @click="toggleWarmMode">
      {{ state.isWarmMode ? "♥︎" : "♡" }}
    </button>
    <input 
      v-model="newMessage" 
      @keyup.enter="handleSend"
      placeholder="메시지 입력" 
      :disabled="isSending || state.isPopupVisible"
    />
    <button class="send-button" 
      @click="handleSend"
      :disabled="isSending || state.isPopupVisible">
      {{ isSending ? "..." : "➢" }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useMessages } from "../store/message";

const emit = defineEmits(["updateWarmMode", "showOptions"]);
const { messages, saveMessage, getWarmMode, toggleWarmMode, state } = useMessages();
const newMessage = ref("");
const isSending = ref(false);

// 재귀적 setTimeout을 위한 타임아웃 ID
let warmModeTimeoutId = null;

// 웜모드 상태를 업데이트하는 함수
const checkWarmMode = async () => {
  try {
    // store의 getWarmMode 함수를 사용해 내부 state 업데이트
    await getWarmMode();
    // 업데이트된 상태를 부모 컴포넌트에 알림
    emit("updateWarmMode", state.isWarmMode);
  } catch (error) {
    console.error("Error checking warm mode:", error);
  }
};

// 글로벌 폴링(App.vue에서 시작)로 대체합니다.
// onMounted(() => {
//   // 컴포넌트 마운트 시 즉시 체크하고 재귀적 폴링 시작
//   checkWarmMode();
// });

// onUnmounted(() => {
//   // 로컬 타이머 제거 코드는 필요하지 않습니다.
// });

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const data = await saveMessage(newMessage.value);
    
    messages.value.push({
      text: data.input_content,
      input_content: data.input_content,
      isMine: parseInt(data.user) === state.currentUserId,
      isOriginal: true,
      createdAt: new Date(data.created_at),
      id: data.id,
      user: data.user,
    });
    
    // 번역 API 호출 후 옵션을 받으면 부모 컴포넌트에 이벤트 전달
    if (data.translated_content && Array.isArray(data.translated_content)) {
      emit("showOptions", data.translated_content, data.id);
    }
    
    newMessage.value = "";
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.foot-bar {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #ffffff;
  width: 100%;
  max-width: 390px;
  border-radius: 0px;
}
.heart-button {
  margin-left: 8px;
  padding: 7px 12px;
  border-radius: 30px;
  border: none;
  background: #eaeaea;
  font-size: 18px;
  cursor: pointer;
  margin-right: 8px;
}
input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 20px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 16px;
}
.send-button {
  margin-left: 8px;
  padding: 7px 9px;
  border-radius: 30px;
  border: none;
  background-color: #eaeaea;
  color: rgb(0, 0, 0);
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s ease;
}
.send-button:hover {
  background-color: #979595;
}
input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
