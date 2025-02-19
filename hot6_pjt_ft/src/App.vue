<template>
  <div class="app">
    <div class="chat-container" :class="{ warm: isWarmMode }">
      <navBar />
      <div class="chat-content">
        <p v-if="messages.length === 0" class="empty-message">메시지가 없습니다.</p>
        <div
          v-for="(message, index) in sortedMessages"
          :key="index"
          :class="['message-container', message.isMine ? 'mine' : 'other']"
        >
          <div class="chat-bubble">
            <span class="message-text">{{ message.text }}</span>
          </div>
        </div>
      </div>

      <div v-if="isPopupVisible" class="popup">
        <div class="popup-content">
          <button class="close-btn" @click="isPopupVisible = false">×</button>
          <div class="options">
            <button v-for="(option, index) in options" 
                    :key="index" 
                    class="option-btn"
                    @click="selectOption(option)">
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <footBar @updateWarmMode="updateWarmMode" />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from "vue";
import NavBar from "./components/NavBar.vue";
import FootBar from "./components/FootBar.vue";
import { useMessages } from "./store/message";

const { messages, getAllMessages } = useMessages();
const isLiked = ref(false);
const isPopupVisible = ref(false);
const options = ref([]);
const pendingMessage = ref("");
const selectedMessage = ref("");
const isWarmMode = ref(false);

// 스크롤을 즉시 최하단으로 이동하는 함수
const scrollToBottom = () => {
  const chatContent = document.querySelector('.chat-content');
  if (chatContent) {
    chatContent.scrollTop = chatContent.scrollHeight;
  }
};

// 메시지 변경을 감지하여 스크롤 이동
watch(messages, () => {
  scrollToBottom();
}, { deep: true });  // deep watch로 변경

// 메시지를 생성 시간순으로 정렬
const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
});

// 메시지 로드 함수
const loadMessages = async () => {
  try {
    await getAllMessages();
    scrollToBottom();  // 로드 후 즉시 스크롤
  } catch (error) {
    console.error('메시지 로드 실패:', error);
  }
};

// 컴포넌트 마운트 시 메시지 로드
onMounted(() => {
  loadMessages();
});

// 새로고침 이벤트 리스너 추가
window.addEventListener('focus', () => {
  loadMessages();
});

const handleSendMessage = (messageData) => {
  messages.value.push({ 
    text: messageData.text, 
    isMine: true 
  });
  scrollToBottom();  // 메시지 추가 후 즉시 스크롤
};

const showOptions = (newOptions) => {
  options.value = newOptions;
  isPopupVisible.value = true;
};

const selectOption = (option) => {
  messages.value.push({ 
    text: option, 
    isMine: false 
  });
  isPopupVisible.value = false;
  scrollToBottom();  // 옵션 선택 후 즉시 스크롤
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
};

const togglePopup = () => {
  isPopupVisible.value = false;
};

const refreshOptions = () => {
  options.value = ["새 선택 1", "새 선택 2", "새 선택 3"];
};

const updateWarmMode = (newState) => {
  console.log('Warm mode updated:', newState);
  isWarmMode.value = newState;
};
</script>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d8faff;
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
  background-color: #dddddd;
  transition: background-color 0.3s ease;
}

.chat-container.warm {
  background-color: #FFE0E0;
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
}

.mine .chat-bubble {
  background-color: #ffebf0;
}

.other .chat-bubble {
  background-color: #fff;
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
  background: #ff69b4;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.option-btn:hover {
  background: #ff1493;
}
</style>

