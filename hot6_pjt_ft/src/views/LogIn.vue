<template>
  <div class="login-container">
    <div class="login-form">
      <h2>로그인</h2>
      
      <div class="form-group">
        <label for="username">아이디</label>
        <input 
          type="text" 
          id="username" 
          v-model="formData.username"
          placeholder="아이디를 입력하세요"
        >
      </div>

      <div class="form-group">
        <label for="password">비밀번호</label>
        <input 
          type="password" 
          id="password" 
          v-model="formData.password"
          placeholder="비밀번호를 입력하세요"
        >
      </div>

      <div class="form-check">
        <input 
          type="checkbox" 
          id="keepLoggedIn" 
          v-model="keepLoggedIn"
        >
        <label for="keepLoggedIn">로그인 유지</label>
      </div>

      <button class="login-button" @click="handleLogin">로그인</button>
      
      <p class="signup-link">
        계정이 없으신가요? 
        <router-link to="/signup">회원가입하기</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const keepLoggedIn = ref(false);

const formData = ref({
  username: '',
  password: ''
});

const handleLogin = async () => {
  try {
    // 로그인 API 엔드포인트 수정
    const response = await fetch('http://127.0.0.1:8000/api/auth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.value.username,
        password: formData.value.password,
      }),
    });

    if (!response.ok) {
      throw new Error('로그인 실패');
    }

    const data = await response.json();
    console.log('로그인 응답:', data);

    // 토큰 저장
    if (keepLoggedIn.value) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    } else {
      sessionStorage.setItem('access_token', data.access);
      sessionStorage.setItem('refresh_token', data.refresh);
    }

    // user_id 저장
    const userResponse = await fetch('http://127.0.0.1:8000/api/v1/accounts/user/', {
      headers: {
        'Authorization': `Bearer ${data.access}`
      }
    });
    
    if (userResponse.ok) {
      const userData = await userResponse.json();
      localStorage.setItem('user_id', userData.id.toString());
    }

    // 로그인 성공 시 채팅방으로 이동
    router.push('/female-chat');  // 또는 '/male-chat'
  } catch (error) {
    console.error('로그인 오류:', error);
    alert('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-check {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-check input[type="checkbox"] {
  width: auto;
}

.form-check label {
  margin-bottom: 0;
  cursor: pointer;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #ff69b4;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: #ff1493;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.signup-link a {
  color: #ff69b4;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
