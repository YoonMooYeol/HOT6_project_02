import { reactive } from 'vue'

const AUTH_URL = 'http://127.0.0.1:8000/api/auth'

const authState = reactive({
  isAuthenticated: false,
  user: null
});

export const useAuth = () => {
  // 회원가입 함수
  const register = async (userData) => {
    const response = await fetch('http://127.0.0.1:8000/api/v1/accounts/signup/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }

    return await response.json();
  };

  return {
    register,
    authState
  }
} 