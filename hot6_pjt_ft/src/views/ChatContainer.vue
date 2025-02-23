<template>
  <div class="app">
    <div class="chat-container" :class="{ warm: warmState.isWarmMode }">
      <NavBar />
      <div class="chat-content" ref="chatContent">
        <p v-if="messages.length === 0" class="empty-message">메시지가 없습니다.</p>
        <div
          v-for="(message, index) in sortedMessages"
          :key="index"
          :class="['message-container', message.isMine ? 'mine' : 'other']"
        >
          <div class="chat-bubble" :class="{ 'mine-bubble': message.isMine }">
            <!-- 내 메시지(오른쪽) && 웜모드일 경우 원본 메시지 표시 -->
            <div
              v-if="message.isMine && message.input_content && !message.isOriginal && warmState.isWarmMode"
              class="input-content"
            >
              {{ message.input_content }}
            </div>
            <div class="output-content">{{ message.text }}</div>
          </div>
        </div>
      </div>

      <div v-if="messageState.isPopupVisible" class="popup">
        <div class="popup-content">
          <button class="close-btn" @click="messageState.isPopupVisible = false">×</button>
          <div class="options">
            <button
              v-for="(option, idx) in options"
              :key="idx"
              class="option-btn"
              @click="selectOption(option, idx)"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <FootBar @updateWarmMode="updateWarmMode" @showOptions="showOptions" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "../components/navBar.vue";
import FootBar from "../components/footBar.vue";
import { useMessages } from "../store/message";
import { state as warmState, startWarmModePolling, stopWarmModePolling } from "../store/warmMode";

const router = useRouter();
const { messages, getAllMessages, state: messageState, getCurrentUser } = useMessages();

const chatContent = ref(null);
const options = ref([]);

// 양쪽에서 동일하게 currentUserId로 내 메시지 여부를 설정합니다.
const sortedMessages = computed(() => {
  return [...messages.value]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((msg) => ({
      ...msg,
      isMine: msg.user === messageState.currentUserId
    }));
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight;
    }
  });
};

const loadMessages = async () => {
  try {
    await getAllMessages();
    scrollToBottom();
  } catch (error) {
    console.error("메시지 로드 실패:", error);
  }
};

watch(messages, scrollToBottom, { deep: true });

onMounted(() => {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  if (!token) {
    router.push("/login");
    return;
  }
  // 로그인한 사용자 정보 API를 호출하여 성별 확인 후 올바른 채팅창으로 리다이렉트
  getCurrentUser().then((userData) => {
    // 하드코딩된 테스트: 여자는 femaleChat, 남자는 maleChat으로 분기
    if (userData.gender === 'F' && router.currentRoute.value.name !== 'femaleChat') {
      router.replace({ name: "femaleChat" });
    } else if (userData.gender === 'M' && router.currentRoute.value.name !== 'maleChat') {
      router.replace({ name: "maleChat" });
    }
  }).catch(err => {
    console.error("Failed to get user details", err);
  });
  
  // 채팅방 시작 시 웜모드를 false로 초기화
  warmState.isWarmMode = false;

  // 현재의 창으로 돌아올 때 메세지 로드
  loadMessages();
  window.addEventListener("focus", loadMessages);

  // 채팅방에서만 웜모드 폴링 실행(3초마다 폴링)
  startWarmModePolling();
});

onUnmounted(() => {
  window.removeEventListener("focus", loadMessages);
  // 폴링 중지
  stopWarmModePolling();
});

const showOptions = (newOptions, messageId) => {
  options.value = newOptions;
  messageState.currentMessageId = messageId;
  messageState.isPopupVisible = true;
};

const selectOption = async (option, index) => {
  try {
    console.log("선택된 옵션:", option);
    console.log("선택된 인덱스:", index);
    console.log("메시지 ID:", messageState.currentMessageId);
    console.log("현재 사용자 ID:", messageState.currentUserId);
    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("인증이 필요합니다.");
    }
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/chat/select-translation/${messageState.currentMessageId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selected_index: index })
      }
    );
    if (!response.ok) {
      throw new Error("API 호출 실패");
    }
    const responseData = await response.json();
    console.log("서버 응답:", responseData);
    messages.value = messages.value.map((msg) =>
      msg.id === responseData.id
        ? { ...msg, text: responseData.output_content, isOriginal: false }
        : msg
    );
    messageState.isPopupVisible = false;
  } catch (error) {
    console.error("옵션 선택 처리 실패:", error);
  }
};

const updateWarmMode = (newState) => {
  warmState.isWarmMode = newState;
};
</script>

<style>
/* 공통 스타일 */
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d1d1d1;
}

.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 390px;
  height: 90vh;
  border-radius: 15px;
  margin-right: 30px;
  overflow: hidden;
  background-color: #ffffff;
  transition: background-color 0.3s ease;
}

.chat-container.warm {
  background-color: #ffe0e0;
}

.chat-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.message-container {
  display: flex;
  width: 100%;
  margin: 5px 0;
}

.message-container.mine {
  justify-content: flex-end;
}

.message-container.other {
  justify-content: flex-start;
}

.chat-bubble {
  max-width: 75%;
  padding: 10px;
  border-radius: 15px;
  background-color: white;
  margin: 2px 0;
  display: flex;
  flex-direction: column;
}

/* 기본 mine 메시지 스타일 - 필요에 따라 male/female에서 덮어쓰거나 prop으로 전달 가능 */
.chat-bubble.mine-bubble {
  background-color: var(--mine-bubble-color, #ffebf0);
}

.empty-message {
  text-align: center;
  color: #888;
  font-size: 14px;
}

.popup {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  background: white;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 90%;
}

.option-btn {
  padding: 10px;
  width: 80%;
  border: none;
  background: #d58080;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.option-btn:hover {
  background: #ce5d5d;
}

.input-content {
  font-size: 0.8em;
  color: #666;
  margin-bottom: 4px;
}

.output-content {
  font-size: 1em;
  color: #000;
}

/* femaleChat 스타일 */
.app.female-chat .chat-container {
  background-color: #F5F5F5;
}
.app.female-chat .chat-container.warm {
  background-color: #ffe2e2;
}
.app.female-chat {
  --mine-bubble-color: #ffebf0;
}
.app.female-chat .option-btn {
  background: #d58080;
}
.app.female-chat .option-btn:hover {
  background: #ce5d5d;
}

/* maleChat 스타일 */
.app.male-chat .chat-container {
  background-color: #F5F5F5;
}
.app.male-chat .chat-container.warm {
  background-color: #e2f6ff;
}
.app.male-chat {
  --mine-bubble-color: #b1d6f8;
}
.app.male-chat .option-btn {
  background: #6096d3;
}
.app.male-chat .option-btn:hover {
  background: #3c7ec9;
}
</style> 