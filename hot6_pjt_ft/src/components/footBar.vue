<template>
  <div class="foot-bar">
    <button class="heart-button" @click="toggleWarmMode">
      {{ warmState.isWarmMode ? "♥︎" : "♡" }}
    </button>
    <div class="input-wrapper">
      <input
        ref="chatInput"
        v-model="newMessage"
        @keyup.enter="handleSend"
        placeholder="메시지 입력"
        :disabled="isSending || messageState.isPopupVisible"
      />
      <div class="translate-toggle">
        <button type="button" class="dropup-button" @click="toggleTranslateOptions">▲</button>
        <div v-if="translateOptionsVisible" class="dropup-menu" >
          <ul>
            <li @click="selectLanguage('en')">English</li>
            <li @click="selectLanguage('ko')">한국어</li>
            <li @click="selectLanguage('ja')">日本語</li>
          </ul>
        </div>
      </div>
    </div>
    <button class="send-button" @click="handleSend" :disabled="isSending || messageState.isPopupVisible">
      {{ isSending ? "..." : "➢" }}
    </button>
    <button class="speak-button" @click="toggleTts" :class="{ active: warmState.ttsEnabled }">
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
  nextTick(() => {
    if (chatInput.value) {
      chatInput.value.focus();
    }
  });
};

/**
 * @function handleSend
 * @description 메시지 전송 시, 웜모드 관련 처리 및 메시지 전송을 처리합니다.
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
      focusInput();
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
      focusInput();
    }
  }
};

// 부모(ChatContainer)에서 옵션 선택 확정 시 호출할 수 있도록 clearMessage() 메서드를 노출합니다.
const clearMessage = () => {
  newMessage.value = "";
  focusInput();
};

// ===== 번역 기능 추가 =====
const translateOptionsVisible = ref(false);
const selectedLanguage = ref("en");

const toggleTranslateOptions = () => {
  translateOptionsVisible.value = !translateOptionsVisible.value;
};

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
  translateOptionsVisible.value = false;
  handleTranslate();
};

const handleTranslate = async () => {
  if (!newMessage.value.trim()) return;
  try {
    // 인증 토큰을 로컬스토리지 혹은 세션스토리지에서 가져옵니다.
    const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    const response = await fetch("http://127.0.0.1:8000/api/v1/chat/translate-language/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        input_content: newMessage.value,
        target_language: selectedLanguage.value
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Translation API error response:", errorText);
      throw new Error("번역 API 호출 실패");
    }
  
    console.log("input_content:", newMessage.value);
    console.log("target_language:", selectedLanguage.value);
    console.log("response:", response);
    const data = await response.json();
    if (data.translated_text) {
      newMessage.value = data.translated_text;
    }
  } catch (error) {
    console.error("Error translating message:", error);
  }
};
// ============================

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
/* 번역 관련 UI 스타일 */
.input-wrapper {
  position: relative;
  flex-grow: 1;
  /* 인풋과 같은 높이에 맞추기 위해 block 요소로 처리 */
}

.input-wrapper input {
  width: 100%;
  padding-right: 80px; /* 번역 토글 영역을 위한 여백 */
}

.translate-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
}

.translate-toggle .translate-button {
  margin-right: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  background-color: #e0e0e0;
  color: #000;
  cursor: pointer;
  font-size: 14px;
}

.dropup-button {
  padding: 4px;
  border: none;
  background-color: #e0e0e0;
  cursor: pointer;
  font-size: 12px;
  border-radius: 8px;
}

.dropup-menu {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0px -2px 5px rgba(0,0,0,0.2);
  margin-bottom: 2px;
  z-index: 100;
}

.dropup-menu ul {
  list-style: none;
  padding: 4px;
  margin: 0;
}

.dropup-menu li {
  padding: 4px 8px;
  cursor: pointer;
}

.dropup-menu li:hover {
  background-color: #f0f0f0;
}
</style>
