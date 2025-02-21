import { ref, reactive } from 'vue'
import { apiRequest } from './apiClient';

// 메시지 목록을 갱신하는 주기를 밀리초 단위로 설정
// 500ms = 0.5초마다 메시지 목록을 새로고침
const POLLING_INTERVAL = 500

// API 엔드포인트 상수 정의
const API_URL = 'http://127.0.0.1:8000/api/v1/chat/json-drf'  // POST 요청용 엔드포인트
const MESSAGES_URL = 'http://127.0.0.1:8000/api/v1/chat/messages'  // GET 요청용 엔드포인트

// 웜모드 상태를 가져오는 API 엔드포인트
const WARM_MODE_URL = 'http://127.0.0.1:8000/api/v1/chat/set-warm-mode/'

// 메시지 저장소
const messages = ref([]);

const state = reactive({
  isPopupVisible: false,
  isWarmMode: false,
  isLoading: false,
  isSending: false,
  currentUserId: parseInt(localStorage.getItem('user_id')),
  userGender: localStorage.getItem('user_gender') // 성별 정보 추가
});

// useMessages: 메시지 관리를 위한 커스텀 훅(hook) 함수
// sender: 메시지 발신자 구분을 위한 매개변수 ('male' 또는 'female')
export const useMessages = () => {
  
    // // getMessages: localStorage에서 메시지 목록을 가져오는 함수
    // const getMessages = () => {
    //   // localStorage에서 'chat-messages' 키로 저장된 데이터를 가져옴
    //   const stored = localStorage.getItem('chat-messages')
    //   // 저장된 데이터가 있으면 JSON 파싱하여 반환, 없으면 빈 배열 반환
    //   return stored ? JSON.parse(stored) : []
    // }
  
    // saveMessage: 새 메시지를 저장하는 함수
    // text: 저장할 메시지 내용ㄴ
    const saveMessage = async (text) => {
      const response = await apiRequest(API_URL + '/', {
        method: 'POST',
        body: JSON.stringify({ input_content: text })
      });
      if (!response.ok) {
        throw new Error('메시지 저장 실패');
      }
      const data = await response.json();
      return data;
    }
  
    const clearMessages = () => {
      messages.value = []
    }
  
    // getAllMessages: 모든 메시지를 가져오는 함수 추가
    const getAllMessages = async () => {
      const response2 = await apiRequest(`${MESSAGES_URL}/2/`, { method: 'GET' });
      const response3 = await apiRequest(`${MESSAGES_URL}/3/`, { method: 'GET' });

      if (!response2.ok || !response3.ok) {
        throw new Error('메시지 조회 실패');
      }

      const data2 = await response2.json();
      const data3 = await response3.json();
      
      // 두 사용자의 메시지를 합치기
      const allMessages = [...data2, ...data3];
      const userGender = state.userGender;
      console.log(userGender);

      // 메시지 매핑 - 현재 사용자의 성별에 따라 isMine 설정
      messages.value = allMessages.map(msg => {
        const createdAt = new Date(msg.created_at);
        const isMine = userGender === 'F'
          ? parseInt(msg.user) === 2 // 여성 채팅방: user_id가 2면 내 메시지
          : parseInt(msg.user) === 3; // 남성 채팅방: user_id가 3이면 내 메시지
        return {
          text: msg.output_content || msg.input_content,
          input_content: msg.input_content,
          isMine,
          isOriginal: !msg.output_content,
          createdAt,
          id: msg.id,
          user: msg.user
        };
      });
      
      // 시간순으로 정렬
      messages.value.sort((a, b) => a.createdAt - b.createdAt);
      
      return allMessages;
    };
  
    // 웜모드 상태 가져오기
    const getWarmMode = async () => {
      const response = await apiRequest(WARM_MODE_URL, { method: 'GET' });
      if (!response.ok) {
        throw new Error('웜모드 상태 조회 실패');
      }
      const data = await response.json();
      state.isWarmMode = data.warm_mode;
      return state.isWarmMode;
    };
  
    // 웜모드 토글
    const toggleWarmMode = async () => {
      state.isLoading = true;
      try {
        const response = await apiRequest(WARM_MODE_URL, {
          method: 'POST',
          body: JSON.stringify({ warm_mode: !state.isWarmMode })
        });
        if (!response.ok) {
          throw new Error('웜모드 토글 실패');
        }
        const data = await response.json();
        state.isWarmMode = data.warm_mode;
        return state.isWarmMode;
      } catch (error) {
        console.error('웜모드 토글 에러:', error);
        throw error;
      } finally {
        state.isLoading = false;
      }
    };
  
    // 사용할 함수들을 객체로 반환
    return {
    //   getMessages,  // 메시지 목록 조회 함수
      messages,  // ref로 생성된 반응형 메시지 배열
      saveMessage,  // 새 메시지 저장 함수
      clearMessages,  // 메시지 삭제 함수
      getAllMessages,  // 새로운 함수 추가
      getWarmMode,    // 웜모드 상태 가져오기 함수 추가
      toggleWarmMode,  // 웜모드 토글 함수 추가
      state  // 상태 객체 추가
    }
  }
  
  