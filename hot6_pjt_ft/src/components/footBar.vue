<template>
  <div class="foot-bar" :class="{ warm: warmState.isWarmMode }">
    <button class="heart-button" 
      @click="handleToggleWarmMode">
      {{ warmState.isLoading ? "..." : (warmState.isWarmMode ? "♥︎" : "♡") }}
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
import { useWarm } from "../store/warm";

const emit = defineEmits(['updateWarmMode', 'showOptions']);
const { messages, saveMessage, state } = useMessages();
const { warmState, getWarmMode, toggleWarmMode } = useWarm();

const newMessage = ref("");
const isSending = ref(false);
let warmCheckInterval = null;
let lastCheckTime = 0;  // 마지막 체크 시간
const CHECK_INTERVAL = 3000;  // 체크 간격을 3초로 증가

// 웜모드 상태 체크 함수
const checkWarmMode = async () => {
  const now = Date.now();
  // 마지막 체크로부터 3초가 지나지 않았다면 스킵
  if (now - lastCheckTime < CHECK_INTERVAL) return;
  
  try {
    const warmMode = await getWarmMode();
    if (warmState.isWarmMode !== warmMode) {
      emit('updateWarmMode', warmMode);
    }
    lastCheckTime = now;
  } catch (error) {
    console.error('웜모드 상태 체크 실패:', error);
  }
};

// 웜모드 토글 핸들러
const handleToggleWarmMode = async () => {
  try {
    await toggleWarmMode();
    emit('updateWarmMode', warmState.isWarmMode);
    lastCheckTime = Date.now();  // 토글 후 바로 체크하지 않도록 시간 업데이트
  } catch (error) {
    console.error('Error toggling warm mode:', error);
  }
};

// 컴포넌트 마운트 시 인터벌 시작
onMounted(() => {
  checkWarmMode();  // 초기 상태 체크
  warmCheckInterval = setInterval(checkWarmMode, 1000);  // 1초마다 체크 시도 (실제로는 3초 간격)
});

onUnmounted(() => {
  if (warmCheckInterval) {
    clearInterval(warmCheckInterval);
  }
});

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const data = await saveMessage(newMessage.value);
    const currentUserId = 3;  // 임시로 고정
    
    // 사용자 메시지 추가
    messages.value.push({
      text: data.input_content,
      input_content: data.input_content,
      isMine: data.user === currentUserId,
      isOriginal: true,
      createdAt: new Date(data.created_at),
      id: data.id
    });

    if (data.translated_content && data.translated_content.length > 0) {
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

.foot-bar.warm {
  background-color: #FFE0E0;
}

.heart-button.warm {
  background-color: #ffebf0;
}
</style>
