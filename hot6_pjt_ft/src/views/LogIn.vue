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
    // 1. 로그인 요청
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
    console.log('토큰 응답:', data);

    // 2. 토큰 저장
    const token = data.access;
    if (keepLoggedIn.value) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', data.refresh);
    } else {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('refresh_token', data.refresh);
    }

    // 3. 사용자 정보 가져오기 - 엔드포인트 수정
    const userResponse = await fetch('http://127.0.0.1:8000/api/auth/user/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error('사용자 정보 가져오기 실패');
    }

    const userData = await userResponse.json();
    console.log('사용자 정보:', userData);

    // 4. 사용자 정보 저장
    localStorage.setItem('user_id', userData.id.toString());
    localStorage.setItem('user_gender', userData.gender);

    // 5. 성별에 따라 채팅방으로 이동
    if (userData.gender === 'F') {
      router.push('/female-chat');
    } else {
      router.push('/male-chat');
    }

  } catch (error) {
    console.error('로그인 오류:', error);
    alert('로그인에 실패했습니다. 다시 시도해주세요.');
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
