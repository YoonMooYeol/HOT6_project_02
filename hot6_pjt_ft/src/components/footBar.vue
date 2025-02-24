<template>
  <div class="foot-bar">
    <button class="heart-button" 
      @click="toggleWarmMode">
      {{ warmState.isWarmMode ? "♥︎" : "♡" }}
    </button>
    <input 
      v-model="newMessage" 
      @keyup.enter="handleSend"
      placeholder="메시지 입력" 
      :disabled="isSending || messageState.isPopupVisible"
    />
    <button class="send-button" 
      @click="handleSend"
      :disabled="isSending || messageState.isPopupVisible">
      {{ isSending ? "..." : "➢" }}
    </button>
    <button class="speak-button" 
      @click="toggleTts" 
      :class="{ active: warmState.ttsEnabled }">
      말하기
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMessages } from "../store/message";
import { toggleWarmMode, state as warmState } from "../store/warmMode";

const emit = defineEmits(["updateWarmMode", "showOptions"]);
const { messages, saveMessage, state: messageState } = useMessages();
const newMessage = ref("");
const isSending = ref(false);

const toggleTts = () => {
  warmState.ttsEnabled = !warmState.ttsEnabled;
};

const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;
  
  isSending.value = true;
  try {
    const data = await saveMessage(newMessage.value);
    
    messages.value.push({
      text: data.input_content,
      input_content: data.input_content,
      isMine: parseInt(data.user) === messageState.currentUserId,
      isOriginal: true,
      createdAt: new Date(data.created_at),
      id: data.id,
      user: data.user,
    });
    
    // 번역 API 호출 후 옵션을 받으면 부모 컴포넌트에 이벤트 전달
    if (data.translated_content && Array.isArray(data.translated_content)) {
      emit("showOptions", data.translated_content, data.id);
    }
    // 사용자가 취소하면 메세지를 보내지 않기
    
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
.speak-button {
  margin-left: 8px;
  padding: 7px 9px;
  border-radius: 30px;
  border: none;
  background-color: #ccc;
  color: rgb(0, 0, 0);
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}
.speak-button.active {
  background-color: #d9ead3;
}
.speak-button:hover {
  background-color: #bbb;
}
.speak-button.active:hover {
  background-color: #b6d7a8;
}
input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}
</style>
