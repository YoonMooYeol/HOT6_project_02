import { ref, reactive } from 'vue'

// 메시지 목록을 갱신하는 주기를 밀리초 단위로 설정
// 500ms = 0.5초마다 메시지 목록을 새로고침
const POLLING_INTERVAL = 500

// API 엔드포인트 상수 정의
const API_URL = 'http://127.0.0.1:8000/api/v1/chat/json-drf/'

// 웜모드 상태를 가져오는 API 엔드포인트
const WARM_MODE_URL = 'http://127.0.0.1:8000/api/v1/chat/toggle-warm-mode/'

// 메시지 저장소
const messages = ref([]);

const state = reactive({
  isPopupVisible: false,
  isWarmMode: false,
  isLoading: false,
  isSending: false
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
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input_content: text
          })
        });
  
        if (!response.ok) {
          throw new Error('API 요청 실패');
        }
  
        const data = await response.json();
        console.log(data);
        return data;  // 전체 응답 데이터를 그대로 반환
      } catch (error) {
        console.error('메시지 저장 중 오류 발생:', error);
        throw error;
      }
    }
  
    const clearMessages = () => {
      messages.value = []
    }
  
    // getAllMessages: 모든 메시지를 가져오는 함수 추가
    const getAllMessages = async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('API 요청 실패');
        }

        const data = await response.json();
        // id 포함하여 messages 업데이트
        messages.value = data.map(msg => ({
          text: msg.output_content || msg.input_content,  // output_content가 있으면 사용, 없으면 input_content 사용
          input_content: msg.input_content,  // 원본 메시지 저장
          isMine: true,
          isOriginal: !msg.output_content,  // output_content가 없으면 원본 메시지
          createdAt: new Date(msg.created_at),
          id: msg.id
        }));
        
        return data;
      } catch (error) {
        console.error('메시지 조회 중 오류 발생:', error);
        throw error;
      }
    };
  
    // 웜모드 상태 가져오기
    const getWarmMode = async () => {
      try {
        // 서버에서 웜모드 상태를 가져옴
        const response = await fetch(WARM_MODE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error('웜모드 상태 가져오기 실패');
        }
        
        const data = await response.json();
        state.isWarmMode = data.warm_mode;
        return state.isWarmMode;
      } catch (error) {
        console.error('Error getting warm mode:', error);
        return false;
      }
    };
  
    // 웜모드 토글
    const toggleWarmMode = async () => {
      try {
        state.isLoading = true;
        // 서버에 웜모드 상태 전송
        const response = await fetch(WARM_MODE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            warm_mode: !state.isWarmMode
          })
        });
        
        if (!response.ok) {
          throw new Error('웜모드 상태 변경 실패');
        }
        
        const data = await response.json();
        state.isWarmMode = data.warm_mode;
        state.isLoading = false;
        return state.isWarmMode;
      } catch (error) {
        console.error('Error toggling warm mode:', error);
        state.isLoading = false;
        throw error;
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
  
  