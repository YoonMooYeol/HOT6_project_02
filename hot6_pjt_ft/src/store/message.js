import { ref, reactive } from 'vue'

// 메시지 목록을 갱신하는 주기를 밀리초 단위로 설정
// 500ms = 0.5초마다 메시지 목록을 새로고침
const POLLING_INTERVAL = 500

// API 엔드포인트 상수 정의
const API_URL = 'http://127.0.0.1:8000/api/v1/chat/json-drf/'

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
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!token) {
          throw new Error('인증이 필요합니다.');
        }

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            input_content: text
          })
        });
  
        if (!response.ok) {
          throw new Error('API 요청 실패');
        }
  
        const data = await response.json();
        console.log('보낸 메시지 응답:', data);
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
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const currentUserId = parseInt(localStorage.getItem('user_id')); // 로그인 시 저장된 user_id 가져오기
        
        if (!token) {
          throw new Error('인증이 필요합니다.');
        }

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('API 요청 실패');
        }

        const data = await response.json();
        console.log('메시지 데이터:', data);

        // 메시지 매핑 - 현재 사용자의 메시지 여부로 isMine 설정
        messages.value = data.map(msg => ({
          text: msg.output_content || msg.input_content,
          input_content: msg.input_content,
          isMine: msg.user_gender === state.userGender,  // 같은 성별이면 오른쪽
          isOriginal: !msg.output_content,
          createdAt: new Date(msg.created_at),
          id: msg.id,
          user: msg.user,
          userGender: msg.user_gender
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
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!token) {
          throw new Error('인증이 필요합니다.');
        }

        const response = await fetch(WARM_MODE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        if (!token) {
          throw new Error('인증이 필요합니다.');
        }

        state.isLoading = true;
        const response = await fetch(WARM_MODE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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
  
  