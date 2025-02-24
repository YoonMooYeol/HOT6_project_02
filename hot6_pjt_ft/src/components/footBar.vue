<template>
  <div class="foot-bar">
    <button class="heart-button" 
      @click="toggleWarmMode">
      {{ warmState.isWarmMode ? "♥︎" : "♡" }}
    </button>
    <input
      ref="chatInput" 
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
      <svg-icon :type="'mdi'" :path="mdiVolumeHigh" />
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useMessages } from "../store/message";
import { toggleWarmMode, state as warmState } from "../store/warmMode";
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiVolumeHigh } from '@mdi/js';

const emit = defineEmits(["updateWarmMode", "showOptions"]);
const { messages, saveMessage, state: messageState } = useMessages();
const newMessage = ref("");
const isSending = ref(false);

// 입력창에 포커스를 주기 위한 ref
const chatInput = ref(null);

const toggleTts = () => {
  warmState.ttsEnabled = !warmState.ttsEnabled;
};

/**
 * @function focusInput
 * @description 채팅 입력창에 포커스를 설정합니다.
 */
const focusInput = () => {
  if (chatInput.value) {
    chatInput.value.focus();
  }
};

/**
 * @function handleSend
 * @description 메시지 전송 시, 웜모드이고 옵션(번역)이 필요한 경우에는 아래와 같이 처리하여
 * 옵션 취소 시 입력창 내용을 유지하고, 옵션 선택 확정 시 부모에서 clearMessage() 호출을 통해
 * 입력창을 초기화합니다.
 */
const handleSend = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  const textToSend = newMessage.value.trim();
  isSending.value = true;
  
  if (!warmState.isWarmMode) {
    // 낙관적 업데이트: 임시 메시지 추가. 즉시 messages 배열에 푸시됨
    const tempId = Date.now();
    const optimisticMsg = {
      text: textToSend,
      input_content: textToSend,
      isMine: true,
      isOriginal: true,
      createdAt: new Date(),
      id: tempId,
      user: messageState.currentUserId,
    };
    messages.value.push(optimisticMsg);

    try {
      const data = await saveMessage(textToSend);
      // 서버 응답을 받은 후, 임시 메시지를 실제 메시지 데이터로 대체
      messages.value = messages.value.map((msg) =>
        msg.id === tempId
          ? {
              text: data.input_content,
              input_content: data.input_content,
              isMine: parseInt(data.user) === messageState.currentUserId,
              isOriginal: true,
              createdAt: new Date(data.created_at),
              id: data.id,
              user: data.user,
            }
          : msg
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // 전송 실패 시 임시 메시지 제거
      messages.value = messages.value.filter((msg) => msg.id !== tempId);
    } finally {
      isSending.value = false;
      newMessage.value = "";
    }
  }

  if (warmState.isWarmMode) {
    let shouldClearInput = false;
    try {
      const data = await saveMessage(textToSend);
      console.log("data:", data);
      if (data.options && Array.isArray(data.options)) {
        if (data.options.length > 0) {
          // 옵션이 존재하면 옵션팝업을 띄우고 입력값은 유지함
          emit("showOptions", data.options, data.id, textToSend);
        } else {
          shouldClearInput = true;
        }
      } else {
        emit("showOptions", data.options, data.id, textToSend);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      isSending.value = false;
      if (shouldClearInput) {
        newMessage.value = "";
      }
    }
  }
};

// 부모(ChatContainer)에서 옵션 선택 확정 시 호출할 수 있도록 clearMessage() 메서드를 노출합니다.
const clearMessage = () => {
  newMessage.value = "";
};

defineExpose({ clearMessage, focusInput });
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
