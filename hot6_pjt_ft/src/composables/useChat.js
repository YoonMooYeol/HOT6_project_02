import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useMessages } from "../store/message";
import { useRouter } from 'vue-router';
import { useWarm } from "../store/warm";

export const useChat = () => {
  const { messages, getAllMessages, state, selectTranslation } = useMessages();
  const { warmState } = useWarm();
  const options = ref([]);
  const router = useRouter();

  const CHECK_INTERVAL = 3000;
  let lastMessageCheckTime = 0;
  let messageCheckInterval = null;

  // 메시지 정렬
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  });

  // 메시지 로드
  const loadMessages = async () => {
    const now = Date.now();
    if (now - lastMessageCheckTime < CHECK_INTERVAL) return;

    try {
      await getAllMessages();
      const chatContent = document.querySelector('.chat-content');
      if (chatContent) {
        chatContent.scrollTop = chatContent.scrollHeight;
      }
      lastMessageCheckTime = now;
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      if (error.message === '인증이 필요합니다.') {
        router.push('/login');
      }
    }
  };

  // 메시지 변경 감지
  watch(messages, () => {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      nextTick(() => {
        chatContent.scrollTop = chatContent.scrollHeight;
      });
    }
  }, { deep: true });

  // 옵션 표시
  const showOptions = (newOptions, messageId) => {
    options.value = newOptions;
    state.currentMessageId = messageId;
    state.isPopupVisible = true;
  };

  // 옵션 선택
  const selectOption = async (option, index) => {
    try {
      const responseData = await selectTranslation(state.currentMessageId, index);
      messages.value = messages.value.map(msg => {
        if (msg.id === responseData.id) {
          return {
            ...msg,
            text: responseData.output_content,
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

  // 웜모드 업데이트
  const updateWarmMode = async (newState) => {
    try {
      // warmState가 서버 응답값으로 자동 업데이트
    } catch (error) {
      console.error('웜모드 변경 실패:', error);
      if (error.message === '인증이 필요합니다.') {
        router.push('/login');
      }
    }
  };

  // 컴포넌트 마운트 시 설정
  const setupChat = () => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadMessages();
    messageCheckInterval = setInterval(loadMessages, 1000);
    useWarm().toggleWarmMode(false);

    // focus 이벤트 리스너
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastMessageCheckTime >= CHECK_INTERVAL) {
        loadMessages();
      }
    };
    window.addEventListener('focus', handleFocus);

    // cleanup 함수 반환
    return () => {
      if (messageCheckInterval) {
        clearInterval(messageCheckInterval);
      }
      window.removeEventListener('focus', handleFocus);
    };
  };

  return {
    messages,
    sortedMessages,
    options,
    state,
    warmState,
    showOptions,
    selectOption,
    updateWarmMode,
    setupChat
  };
}; 