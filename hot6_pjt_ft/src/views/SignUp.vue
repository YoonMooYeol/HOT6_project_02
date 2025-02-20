<template>
  <div class="signup-container">
    <div class="signup-form">
      <h2>회원가입</h2>
      
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
          placeholder="비밀번호를 입력하세요(8-20자)"
        >
      </div>

      <div class="form-group">
        <label for="password2">비밀번호 확인</label>
        <input 
          type="password" 
          id="password2" 
          v-model="formData.password2"
          placeholder="비밀번호를 다시 입력하세요"
        >
      </div>

      <div class="form-group">
        <label for="name">이름</label>
        <input 
          type="text" 
          id="name" 
          v-model="formData.name"
          placeholder="이름을 입력하세요"
        >
      </div>

      <div class="form-group">
        <label>성별</label>
        <div class="gender-buttons">
          <button 
            :class="['gender-button', formData.gender === 'M' ? 'active' : '']"
            @click="selectGender('M')"
          >
            남성
          </button>
          <button 
            :class="['gender-button', formData.gender === 'F' ? 'active' : '']"
            @click="selectGender('F')"
          >
            여성
          </button>
        </div>
      </div>

      <button class="signup-button" @click="handleSignup">회원가입</button>
      
      <p class="login-link">
        이미 계정이 있으신가요? 
        <router-link to="/login">로그인하기</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const router = useRouter();
const { register } = useAuth();

const formData = ref({
  username: '',
  password: '',
  password2: '',
  name: '',
  gender: ''
});

const selectGender = (gender) => {
  formData.value.gender = gender;
};

const handleSignup = async () => {
  try {
    // 입력값 검증
    if (!formData.value.username || !formData.value.password || 
        !formData.value.password2 || !formData.value.name || !formData.value.gender) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.value.password !== formData.value.password2) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 회원가입 요청
    await register(formData.value);

    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
    router.push('/login');
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    alert(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #FFE0E0;
}

.signup-form {
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

.gender-buttons {
  display: flex;
  gap: 1rem;
}

.gender-button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gender-button.active {
  background: #BE7272;
  color: white;
  border-color: #BE7272;
}

.signup-button {
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

.signup-button:hover {
  background: #a64a4a;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #666;
}

.login-link a {
  color: #BE7272;
  text-decoration: none;
  font-weight: 700;
}

.login-link a:hover {
  text-decoration: underline;
  
}
</style>
