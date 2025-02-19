<template>
  <div class="foot-bar">
    <button class="heart-button" 
      @click="isLoading ? null : toggleLike">
      {{ isLoading ? "..." : (isWarmMode ? "♥︎" : "♡") }}
    </button>
    <input 
      v-model="newMessage" 
      placeholder="메시지 입력" 
    />
    <button class="send-button" 
      @click="handleSend">
      {{ isSending ? "..." : "➢" }}
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMessages } from "../store/message";

const emit = defineEmits(['updateWarmMode']);
const { messages, saveMessage } = useMessages();
const newMessage = ref("");
const isWarmMode = ref(false);
const isLoading = ref(false);
const isSending = ref(false);

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const data = await saveMessage(newMessage.value);
    
    // 사용자 메시지 추가
    messages.value.push({
      text: data.input_content,
      isMine: true,
      createdAt: new Date(data.created_at)
    });

    if (data.translated_content) {
      const options = data.translated_content.split('\n').map(opt => opt.replace(/"/g, ''));
      emit('showOptions', options);
    }
    newMessage.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    isSending.value = false;
  }
};

const toggleLike = async () => {
  if (isLoading.value) return;
  
  isLoading.value = true;
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/chat/toggle-warm-mode/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      isWarmMode.value = data.warm_mode;
      console.log('Emitting warm mode:', data.warm_mode);  // 디버깅용 로그
      emit('updateWarmMode', data.warm_mode);  // 부모 컴포넌트에 상태 전달
    }
  } catch (error) {
    console.error('Error toggling warm mode:', error);
  } finally {
    isLoading.value = false;
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
