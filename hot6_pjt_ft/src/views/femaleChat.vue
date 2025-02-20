<template>
  <!-- 전체 앱을 감싸는 최상위 컨테이너 -->
  <div class="app">
    <!-- 채팅창을 감싸는 컨테이너. isWarmMode에 따라 배경색이 변경됨 -->
    <div class="chat-container" :class="{ warm: state.isWarmMode }">
      <!-- 상단 네비게이션 바 컴포넌트. isWarmMode 상태를 props로 전달 -->
      <navBar />

      <!-- 실제 채팅 메시지들이 표시되는 영역 -->
      <div class="chat-content">
        <!-- 메시지가 없을 때 표시되는 안내 문구 -->
        <p v-if="messages.length === 0" class="empty-message">메시지가 없습니다.</p>

        <!-- 메시지 목록을 순회하며 각 메시지를 표시 -->
        <div
          v-for="(message, index) in sortedMessages"
          :key="index"
          :class="['message-container', message.isMine ? 'mine' : 'other']"
        >
          <!-- 개별 메시지 말풍선 -->
          <div class="chat-bubble">
            <!-- 원본 메시지 (회색, 작은 글씨로 표시) -->
            <div v-if="message.input_content && !message.isOriginal" class="input-content">
              {{ message.input_content }}
            </div>
            <!-- 번역된 메시지 또는 원본 메시지 (일반 크기로 표시) -->
            <div class="output-content">{{ message.text }}</div>
          </div>
        </div>
      </div>

      <!-- 번역 옵션 선택을 위한 팝업 창 -->
      <div v-if="state.isPopupVisible" class="popup">
        <div class="popup-content">
          <!-- 팝업 닫기 버튼 -->
          <button class="close-btn" @click="state.isPopupVisible = false">×</button>
          <!-- 번역 옵션 버튼들을 표시하는 영역 -->
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

      <!-- 하단 입력 바 컴포넌트. 모드 변경과 옵션 표시 이벤트를 처리 -->
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

const { messages, getAllMessages, state } = useMessages();
const options = ref([]);

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
  nextTick(() => {
      chatContent.scrollTop = chatContent.scrollHeight;
    });
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
  state.currentMessageId = messageId;
  state.isPopupVisible = true;
};

const selectOption = async (option, index) => {
  try {
    console.log('선택된 옵션:', option);
    console.log('선택된 인덱스:', index);
    console.log('메시지 ID:', state.currentMessageId);

    // API 호출
    const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/select-translation/${state.currentMessageId}/`, {
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
    
    // 서버 응답 데이터를 메시지 목록에 추가
    messages.value = messages.value.map(msg => {
      if (msg.id === responseData.id) {
        return {
          ...msg,
          text: responseData.output_content,  // 번역된 메시지로 업데이트
          isOriginal: false
        };
      }
      return msg;
    });
    
    state.isPopupVisible = false;
  } catch (error) {
    console.error('옵션 선택 처리 실패:', error);
  }
};

const updateWarmMode = (newState) => {
  console.log('Updating warm mode:', newState);  // 디버깅용
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
  display: flex;
  flex-direction: column;
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
  font-size: 0.8em;
  color: #666;
  margin-bottom: 4px;
}

.output-content {
  font-size: 1em;
  color: #000;
}
</style>
