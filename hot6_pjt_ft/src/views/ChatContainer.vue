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
            <template v-if="message.isMine">
              <template v-if="message.input_content && message.input_content !== message.text">
                <!-- 웜모드로 보낸 경우: 원본과 변환된 메시지를 모두 출력 -->
                <div class="input-content">{{ message.input_content }}</div>
                <div class="output-content">{{ message.text }}</div>
              </template>
              <template v-else>
                <!-- 웜모드 외, 일반 메시지 출력 -->
                <div class="output-content">{{ message.text }}</div>
              </template>
            </template>
            <template v-else>
              <div class="output-content">{{ message.text }}</div>
            </template>
          </div>
        </div>
      </div>

      <div v-if="messageState.isPopupVisible" class="popup">
        <div class="popup-content">
          <button class="close-btn" @click="messageState.isPopupVisible = false">×</button>
          <button class="refresh-btn" @click="refreshOptions">↺</button>
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

      <FootBar ref="footBarRef" @updateWarmMode="updateWarmMode" @showOptions="showOptions" />
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
import { textToSpeech } from "../store/audio";

const router = useRouter();
const { messages, getAllMessages, state: messageState, getCurrentUser } = useMessages();

const chatContent = ref(null);
const options = ref([]);
const footBarRef = ref(null);

// 양쪽에서 동일하게 currentUserId로 내 메시지 여부를 설정합니다.
const sortedMessages = computed(() => {
  return [...messages.value]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((msg) => ({
      ...msg,
      isMine: msg.user === messageState.currentUserId
    }));
});

/**
 * @function scrollToBottom
 * @description 채팅 내용을 맨 아래로 스크롤합니다.
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContent.value) {
      chatContent.value.scrollTop = chatContent.value.scrollHeight;
    }
  });
};

/**
 * @function loadMessages
 * @description 메시지를 불러오고, 로드 후 채팅 내용을 맨 아래로 스크롤합니다.
 */
const loadMessages = async () => {
  try {
    await getAllMessages();
    scrollToBottom();
  } catch (error) {
    console.error("메시지 로드 실패:", error);
  }
};

watch(messages, scrollToBottom, { deep: true });

// 새로운 메시지 감시 및 TTS 실행
watch(messages, (newMessages, oldMessages) => {
  // 초기 로드 시(oldMessages가 없거나 길이가 줄어들 경우 무시)
  if (!oldMessages || newMessages.length <= oldMessages.length) return;
  const lastMsg = newMessages[newMessages.length - 1];
  console.log(messages.value[messages.value.length - 1]);
  // 좌측 메시지인 경우 웜모드가 켜져있으면 웜모드 메시지 재생
  if (!lastMsg.isMine && warmState.isWarmMode && warmState.ttsEnabled) {
    // 사용자 성별의 반대: "M"이면 "F", 그렇지 않으면 "M"
    const oppositeGender =
      messageState.userGender && messageState.userGender.toUpperCase() === "M" ? "F" : "M";
    textToSpeech(lastMsg.text, oppositeGender).catch((error) =>
      console.error("TTS error on incoming left message:", error)
    );
  }
}, { deep: true });

onMounted(() => {
  const token =
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  if (!token) {
    router.push("/login");
    return;
  }
  // 로그인한 사용자 정보 API를 호출하여 성별 확인 후 올바른 채팅창으로 리다이렉트
  getCurrentUser()
    .then((userData) => {
      // 하드코딩된 테스트: 여자는 femaleChat, 남자는 maleChat으로 분기
      if (userData.gender === "F" && router.currentRoute.value.name !== "femaleChat") {
        router.replace({ name: "femaleChat" });
      } else if (userData.gender === "M" && router.currentRoute.value.name !== "maleChat") {
        router.replace({ name: "maleChat" });
      }
    })
    .catch((err) => {
      console.error("Failed to get user details", err);
    });

  // 채팅방 시작 시 웜모드를 false로 초기화
  warmState.isWarmMode = false;

  // 현재의 창으로 돌아올 때 메세지 로드
  loadMessages();
  window.addEventListener("focus", loadMessages);

  // 메세지를 0.1초(100ms)마다 가져오도록 polling 타이머 추가
  const messageInterval = setInterval(loadMessages, 100);
  // 채팅방에서만 웜모드 폴링 실행(3초마다 폴링)
  startWarmModePolling();

  // 채팅방 진입 시 FootBar의 입력창에 커서를 자동으로 설정
  nextTick(() => {
    if (footBarRef.value && typeof footBarRef.value.focusInput === "function") {
      footBarRef.value.focusInput();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("focus", loadMessages);
  // 메세지 polling 타이머 해제
  clearInterval(messageInterval);
  // 폴링 중지
  stopWarmModePolling();
});

/**
 * @function showOptions
 * @description 옵션 팝업을 띄우고, 선택 가능한 옵션들을 설정합니다.
 */
const showOptions = (newOptions, messageId, inputContent) => {
  options.value = newOptions;
  messageState.currentMessageId = messageId;
  messageState.currentInputContent = inputContent;
  messageState.isPopupVisible = true;
};

/**
 * @function selectOption
 * @description 사용자가 옵션을 선택하면 서버로 전송한 후, 
 * 옵션 선택 확정 시 FootBar의 입력창을 초기화합니다.
 */
const selectOption = async (option, index) => {
  try {
    console.log("선택된 옵션:", option);
    console.log("선택된 인덱스:", index);
    console.log("현재 사용자 ID:", messageState.currentUserId);
    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("인증이 필요합니다.");
    }
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/chat/select-translation/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selected_index: index, input_content: messageState.currentInputContent, warm_options: options.value })
      }
    );
    console.log("selected_index:", index);
    console.log("input_content:", messageState.currentInputContent);
    console.log("warm_options:", options.value);
    if (!response.ok) {
      throw new Error("API 호출 실패");
    }
    const responseData = await response.json();
    messages.value = messages.value.map((msg) =>
      msg.id === responseData.id
        ? { ...msg, text: responseData.output_content, isOriginal: false }
        : msg
    );
    // 옵션 선택 후 채팅창이 바로 최하단으로 스크롤되도록 호출
    scrollToBottom();
    // 옵션 선택 확정 시 팝업을 닫고 FootBar의 입력창 초기화 처리
    messageState.isPopupVisible = false;
    if (footBarRef.value && typeof footBarRef.value.clearMessage === "function") {
      footBarRef.value.clearMessage();
    }
    // 옵션 처리 후에도 채팅 입력란에 커서 두기
    nextTick(() => {
      if (footBarRef.value && typeof footBarRef.value.focusInput === "function") {
        footBarRef.value.focusInput();
      }
    });
    if (warmState.isWarmMode && warmState.ttsEnabled) {
      await textToSpeech(option, messageState.userGender);
    }
  } catch (error) {
    console.error("옵션 선택 처리 실패:", error);
  }
};

/**
 * @function refreshOptions
 * @description 옵션을 새로고침하여 새로운 옵션 후보들을 불러옵니다.
 */
 const refreshOptions = async () => {
  try {
    console.log("옵션 새로고침 실행");

    if (!messageState.currentMessageId) {
      console.error("새로고침할 메시지가 선택되지 않았습니다.");
      return;
    }

    const token =
      localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (!token) {
      throw new Error("인증이 필요합니다.");
    }

    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/chat/refresh-translation/${messageState.currentMessageId}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // 서버에서 반환한 에러 메시지 확인
      throw new Error("옵션 새로고침 API 호출 실패");
    }

    const responseData = await response.json();
    console.log("새로운 옵션:", responseData);

    options.value = responseData.options || []; // 새로운 옵션 리스트 반영
  } catch (error) {
    console.error("옵션 새로고침 실패:", error);
    alert("옵션을 새로고침하는 데 실패했습니다."); //사용자에게 알림
  }
};

/**
 * @function updateWarmMode
 * @description 웜 모드 활성/비활성 상태를 업데이트합니다.
 */
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

.refresh-btn {
  position: absolute;
  top: 10px;
  left: 15px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #ff7a7a;
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