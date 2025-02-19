<template>
  <div class="app">
    <div class="chat-container" :class="{ warm: isWarmMode }">
      <navBar :isWarmMode="isWarmMode" />
      <div class="chat-content">
        <p v-if="messages.length === 0" class="empty-message">메시지가 없습니다.</p>
        <div
          v-for="(message, index) in sortedMessages"
          :key="index"
          :class="['message-container', message.isMine ? 'mine' : 'other']"
        >
          <div class="chat-bubble">
            <div v-if="message.input_content" class="input-content">{{ message.input_content }}</div>
            <div class="output-content">{{ message.text }}</div>
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
                    @click="selectOption(option, index)">
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <footBar 
        @updateWarmMode="updateWarmMode"
        @showOptions="showOptions" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import NavBar from "../components/NavBar.vue";
import FootBar from "../components/FootBar.vue";
import { useMessages } from "../store/message";

const { messages, getAllMessages } = useMessages();
const isPopupVisible = ref(false);
const options = ref([]);
const isWarmMode = ref(false);
const currentMessageId = ref(null);

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
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  } catch (error) {
    console.error('메시지 로드 실패:', error);
  }
};

// 메시지 변경 감지
watch(messages, () => {
  const chatContent = document.querySelector('.chat-content');
  if (chatContent) {
    chatContent.scrollTop = chatContent.scrollHeight;
  }
}, { deep: true });

onMounted(() => {
  loadMessages();
});

// 새로고침 이벤트 리스너
window.addEventListener('focus', () => {
  loadMessages();
});

const showOptions = (newOptions, messageId) => {
  options.value = newOptions;
  currentMessageId.value = messageId;
  isPopupVisible.value = true;
};

const selectOption = async (option, index) => {
  try {
    console.log('선택된 옵션:', option);
    console.log('선택된 인덱스:', index);
    console.log('메시지 ID:', currentMessageId.value);

    // API 호출
    const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/select-translation/${currentMessageId.value}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_index: index
      })
    });

    if (!response.ok) {
      throw new Error('API 호출 실패');
    }

    const responseData = await response.json();
    console.log('서버 응답:', responseData);

    // output_content를 사용하여 메시지 추가
    messages.value.push({ 
      text: responseData.output_content,
      input_content: responseData.input_content,  // 서버에서 받은 원본 메시지 사용
      isMine: true,
      isOriginal: false,
      createdAt: new Date(responseData.created_at)
    });
    
    isPopupVisible.value = false;
  } catch (error) {
    console.error('옵션 선택 처리 실패:', error);
  }
};

const updateWarmMode = (newState) => {
  console.log('Updating warm mode:', newState);  // 디버깅용
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
  background-color: #FFFFFF;
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
  margin: 2px 0;
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

.input-content {
  font-size: 0.85em;
  color: #666;
  margin-bottom: 4px;
}

.output-content {
  font-size: 1em;
  color: #000;
}
</style>
