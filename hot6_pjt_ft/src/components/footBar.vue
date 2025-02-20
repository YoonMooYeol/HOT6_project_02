<template>
  <div class="foot-bar">
    <button class="heart-button" 
      @click="toggleWarmMode">
      {{ state.isLoading ? "..." : (state.isWarmMode ? "♥︎" : "♡") }}
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

const emit = defineEmits(['updateWarmMode', 'showOptions']);
const { messages, saveMessage, getWarmMode, toggleWarmMode, state } = useMessages();
const newMessage = ref("");
const isSending = ref(false);
let warmModeInterval = null;  // 웜모드 체크 인터벌 ID 저장용

// 웜모드 상태 체크 함수
const checkWarmMode = async () => {
  try {
    const warmMode = await getWarmMode();
    if (state.isWarmMode !== warmMode) {
      state.isWarmMode = warmMode;
      emit('updateWarmMode', warmMode);
    }
  } catch (error) {
    console.error('Error checking warm mode:', error);
  }
};

// 컴포넌트 마운트 시
onMounted(() => {
  // 초기 상태는 웜모드 off
  state.isWarmMode = false;
  
  // 3초마다 웜모드 상태 체크
  warmModeInterval = setInterval(checkWarmMode, 3000);
});

// 컴포넌트 언마운트 시 인터벌 정리
onUnmounted(() => {
  if (warmModeInterval) {
    clearInterval(warmModeInterval);
  }
});

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const currentUserId = parseInt(localStorage.getItem('user_id')); // 로그인 시 저장된 user_id 가져오기
    const data = await saveMessage(newMessage.value);
    
    // 사용자 메시지 추가
    messages.value.push({
      text: data.input_content,
      input_content: data.input_content,
      isMine: parseInt(data.user) === currentUserId,  // user 값과 비교
      isOriginal: true,
      createdAt: new Date(data.created_at),
      id: data.id,
      user: data.user  // user 필드 추가
    });

    // translated_content가 있고 배열인 경우에만 옵션 표시
    if (data.translated_content && Array.isArray(data.translated_content)) {
      emit('showOptions', data.translated_content, data.id);
    }
    
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
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
  background-color: #FFFFFF;
  width: 100%;
  max-width: 370px;
  border-radius: 0px;
}

.heart-button {
  margin-left: 8px;
  padding: 7px 12px;
  border-radius: 30px;
  border: none;
  background: #EAEAEA;
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
  background-color: #EAEAEA;
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
