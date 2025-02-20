import { reactive } from 'vue'

const WARM_MODE_URL = 'http://127.0.0.1:8000/api/v1/chat/set-warm-mode/'

const warmState = reactive({
  isWarmMode: false,
  isLoading: false
});

export const useWarm = () => {
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
        throw new Error('웜모드 상태 조회 실패');
      }
      
      const data = await response.json();
      warmState.isWarmMode = data.warm_mode;
      return data.warm_mode;
    } catch (error) {
      console.error('Error getting warm mode:', error);
      throw error;
    }
  };

  // 웜모드 토글
  const toggleWarmMode = async () => {
    try {
      // 토큰 가져오기
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (!token) {
        throw new Error('인증이 필요합니다.');
      }

      warmState.isLoading = true;
      const response = await fetch(WARM_MODE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          warm_mode: !warmState.isWarmMode
        })
      });
      
      if (!response.ok) {
        throw new Error('웜모드 상태 변경 실패');
      }
      
      const data = await response.json();
      warmState.isWarmMode = data.warm_mode;
      warmState.isLoading = false;
      return warmState.isWarmMode;
    } catch (error) {
      console.error('Error toggling warm mode:', error);
      warmState.isLoading = false;
      throw error;
    }
  };

  // 웜모드 서버에 false로 저장하는 메소드
  const toggleWarmModeFalse = async () => {
    warmState.isWarmMode = false;
  };

  return {
    warmState,
    toggleWarmMode,
    toggleWarmModeFalse,
    getWarmMode
  }
} 