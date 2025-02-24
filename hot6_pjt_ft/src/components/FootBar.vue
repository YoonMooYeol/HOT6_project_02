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
 * @description 메시지 전송 시, 웜모드이고 옵션(번역)이 필요한 경우에는 아래와 같이 처리하여
 * 옵션 취소 시 입력창의 내용을 유지하고, 옵션 선택 확정 시는 부모에서 clearMessage() 호출을 통해 입력창을 초기화합니다.
 */
const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

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

    if (warmState.isWarmMode) {
      if (data.translated_content && Array.isArray(data.translated_content)) {
        if (data.translated_content.length > 0) {
          // 번역 옵션이 있을 경우: 부모(ChatContainer)에 이벤트 전달 → 
          // 옵션 취소 시 입력값은 그대로, 선택 시 부모에서 clearMessage 호출
          emit("showOptions", data.translated_content, data.id, textToSend);
        } else {
          // 옵션 선택 확정 시(번역 옵션 배열이 비어있는 경우) 바로 입력창 초기화
          newMessage.value = "";
        }
      } else {
        emit("showOptions", data.translated_content, data.id, textToSend);
      }
    } else {
      newMessage.value = "";
    }
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    isSending.value = false;
  }
};

// 부모(ChatContainer)에서 옵션 선택 확정 시 호출할 수 있도록 clearMessage() 메서드를 노출합니다.
const clearMessage = () => {
  newMessage.value = "";
};

defineExpose({ clearMessage });
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
