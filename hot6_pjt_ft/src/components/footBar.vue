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

/**
 * @function handleSend
 * @description 메시지 전송 시, 웜모드이고 옵션(번역)이 필요한 경우 메시지를 전송한 후 입력창 초기화를 하지 않아
 * 사용자가 옵션 취소 시 작성한 메시지를 그대로 재편집할 수 있도록 함.
 */
const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  // 전송할 메시지를 미리 저장
  const textToSend = newMessage.value.trim();

  isSending.value = true;
  try {
    const data = await saveMessage(textToSend);

    messages.value.push({
      text: data.input_content,
      input_content: data.input_content,
      isMine: parseInt(data.user) === messageState.currentUserId,
      isOriginal: true,
      createdAt: new Date(data.created_at),
      id: data.id,
      user: data.user,
    });

    // 웜모드이고 API 결과에 옵션(번역 내용)이 있는 경우 새로운 메시지로 바로 입력창을 비우지 않음
    if (warmState.isWarmMode && data.translated_content && Array.isArray(data.translated_content)) {
      // 원본 메시지를 함께 전달하여 부모에서 옵션 취소 시 필요시 재사용할 수 있도록 함.
      emit("showOptions", data.translated_content, data.id, textToSend);
      // 이 경우 newMessage.value를 초기화하지 않아 입력창에는 원본 메시지가 그대로 남게 됩니다.
    } else {
      // 웜모드가 아니라면 또는 옵션이 없는 경우엔 일반 동작대로 입력창을 초기화합니다.
      newMessage.value = "";
    }
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
