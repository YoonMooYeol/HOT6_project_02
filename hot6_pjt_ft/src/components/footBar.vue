<template>
  <div class="foot-bar" :class="{ warm: state.isWarmMode }">
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
import { ref, onMounted } from "vue";
import { useMessages } from "../store/message";

const emit = defineEmits(['updateWarmMode', 'showOptions']);
const { messages, saveMessage, getWarmMode, toggleWarmMode, state } = useMessages();
const newMessage = ref("");
const isSending = ref(false);
const getInitialWarmMode = async () => {
  try {
    const warmMode = await getWarmMode();
    state.isWarmMode = warmMode;
    emit('updateWarmMode', warmMode);
  } catch (error) {
    console.error('Error getting warm mode:', error);
  }
};

// 컴포넌트 마운트 시 초기 상태 가져오기
onMounted(() => {
  getInitialWarmMode();
});

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const data = await saveMessage(newMessage.value);
    
    // 사용자 메시지 추가
    messages.value.push({
      text: data.input_content,
      isMine: true,
      createdAt: new Date(data.created_at),
      id: data.id
    });

    if (data.translated_content) {
      const options = data.translated_content.split('\n').map(opt => opt.replace(/"/g, ''));
      emit('showOptions', options, data.id);
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
