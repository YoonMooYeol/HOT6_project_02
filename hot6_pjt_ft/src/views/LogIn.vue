<template>
  <div class="login-container">
    <div class="login-form">
      <h2>로그인</h2>
      
      <div class="form-group">
        <label for="username" required>아이디</label>
        <input 
          type="text" 
          id="username" 
          v-model="formData.username"
          placeholder="아이디를 입력하세요"
          @keyup.enter="handleLogin"
        >
      </div>

      <div class="form-group">
        <label for="password" required>비밀번호</label>
        <input 
          type="password" 
          id="password" 
          v-model="formData.password"
          placeholder="비밀번호를 입력하세요"
          @keyup.enter="handleLogin"
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

    // JWT 토큰 디코딩
    const token = data.access;
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    console.log('토큰 페이로드:', tokenPayload);

    // 토큰에서 user_id 추출
    const userId = tokenPayload.user_id;
    const userGender = tokenPayload.gender;
    console.log('사용자 ID:', userId);

    // 토큰과 사용자 정보 저장
    if (keepLoggedIn.value) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_id', userId.toString());
      localStorage.setItem('user_gender', userGender);
    } else {
      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('refresh_token', data.refresh);
      sessionStorage.setItem('user_id', userId.toString());
      sessionStorage.setItem('user_gender', userGender);
    }

    // 성별에 따라 채팅방으로 이동 (gender도 토큰에서 확인 가능)
    if (tokenPayload.gender === 'M') {
      router.push('/male-chat');
    } else {
      router.push('/female-chat');
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
  background: #FFE0E0 ;
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
  background: #BE7272;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: #a64a4a;
}

.signup-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.signup-link a {
  color: #BE7272;
  text-decoration: none;
  font-weight: 700;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
