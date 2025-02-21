import { reactive } from 'vue';
import { apiRequest } from './apiClient';

// 웜모드 관련 API 엔드포인트
const WARM_MODE_URL = 'http://127.0.0.1:8000/api/v1/chat/set-warm-mode/';

// 웜모드 상태 관리 객체 (반응형)
const state = reactive({
  isWarmMode: false,
  isLoading: false,
});

// 웜모드 상태를 가져오는 함수
const getWarmMode = async () => {
  state.isLoading = true;
  try {
    const response = await apiRequest(WARM_MODE_URL, { method: 'GET' });
    if (!response.ok) {
      throw new Error('GET warm mode 실패');
    }
    const data = await response.json();
    console.log('Warm mode data:', data);
    state.isWarmMode = data.warm_mode;
    return state.isWarmMode;
  } catch (error) {
    console.error('GET warm mode 에러:', error);
    throw error;
  } finally {
    state.isLoading = false;
  }
};

// 웜모드를 토글하는 함수
const toggleWarmMode = async () => {
  state.isLoading = true;
  try {
    const targetState = !state.isWarmMode;
    const response = await apiRequest(WARM_MODE_URL, {
      method: 'POST',
      body: JSON.stringify({ warm_mode: targetState })
    });
    if (!response.ok) {
      throw new Error('toggle warm mode 실패');
    }
    const data = await response.json();
    state.isWarmMode = data.warm_mode;
    return state.isWarmMode;
  } catch (error) {
    console.error('toggle warm mode 에러:', error);
    throw error;
  } finally {
    state.isLoading = false;
  }
};

// 웜모드 폴링 함수
let warmModeTimer = null;

const startWarmModePolling = () => {
  if (warmModeTimer) clearTimeout(warmModeTimer);
  const poll = async () => {
    try {
      await getWarmMode();
    } catch (error) {
      console.error("Warm mode polling error:", error);
    } finally {
      warmModeTimer = setTimeout(poll, 3000);
    }
  };
  poll();
};

const stopWarmModePolling = () => {
  if (warmModeTimer) {
    clearTimeout(warmModeTimer);
    warmModeTimer = null;
  }
};

export { state, getWarmMode, toggleWarmMode, startWarmModePolling, stopWarmModePolling }; 