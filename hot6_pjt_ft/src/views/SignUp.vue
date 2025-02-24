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
          placeholder="비밀번호(문자, 숫자, 특수문자 포함 8-20자)"
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

const router = useRouter();

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
    // 필수 필드 체크
    if (!formData.value.username || !formData.value.password || !formData.value.gender || !formData.value.name) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    //아이디가 숫자로만 이루어졌을 경우
    if (/^\d+$/.test(formData.value.username)) {
      alert('아이디는 숫자로만 이루어질 수 없습니다.');
      return;
    }
    //아이디가 특수문자가 포함되어 있을 경우
    if (/[!@#$%^&*]/.test(formData.value.username)) {
      alert('아이디에 특수문자가 포함될 수 없습니다.');
      return;
    }
    //아이디가 띄어쓰기가 포함되어 있을 경우
    if (/\s/.test(formData.value.username)) {
      alert('아이디에 띄어쓰기가 포함될 수 없습니다.');
      return;
    }
    //아이디가 최소 4자 이상이 아닐 경우
    if (formData.value.username.length < 4) {
      alert('아이디는 최소 4자 이상이어야 합니다.');
      return;
    }
    //아이디가 최대 16자 이상일 경우
    if (formData.value.username.length > 16) {
      alert('아이디는 최대 16자 이하여야 합니다.');
      return;
    }
    //비밀번호가 숫자로만 이루어졌을 경우
    if (/^\d+$/.test(formData.value.password)) {
      alert('비밀번호는 숫자로만 이루어질 수 없습니다.');
      return;
    }
    //비밀번호에 숫자가 없을 경우
    if (!/\d/.test(formData.value.password)) {
      alert('비밀번호에 숫자가 없습니다.');
      return;
    }
    //비밀번호에 특수문자가 없을 경우
    if (!/[!@#$%^&*]/.test(formData.value.password)) {
      alert('비밀번호에 특수문자가 없습니다.');
      return;
    }
    // 비밀번호 유효성 검사 추가
    if (formData.value.password.length < 8) {
      alert('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (formData.value.password.length > 20) {
      alert('비밀번호는 20자 이하여야 합니다.');
      return;
    }
    // 비밀번호 확인 체크
    if (formData.value.password !== formData.value.password2) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    //이름에 숫자가 포함되어 있는지 체크
    if (/\d/.test(formData.value.name)) {
      alert('이름에 숫자가 포함되어 있습니다.');
      return;
    }
    // API 요청 데이터 준비
    const requestData = {
      username: formData.value.username.trim(),  // 공백 제거
      password: formData.value.password,
      password2: formData.value.password2,
      name: formData.value.name.trim(),  // 공백 제거
      gender: formData.value.gender
    };

    console.log('회원가입 요청 데이터:', requestData);

    const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    const responseData = await response.json();  // 항상 응답 데이터를 먼저 파싱
    console.log('서버 응답:', responseData);  // 전체 응답 확인

    if (!response.ok) {
      // 서버에서 오는 구체적인 에러 메시지 처리
      if (responseData.username) {
        throw new Error(responseData.username[0]);
      } else if (responseData.password) {
        throw new Error(responseData.password[0]);
      } else if (responseData.gender) {
        throw new Error(responseData.gender[0]);
      } else if (responseData.name) {
        throw new Error(responseData.name[0]);
      } else {
        throw new Error('회원가입에 실패했습니다.');
      }
    }

    console.log('회원가입 성공:', responseData);
    alert('회원가입이 완료되었습니다.');
    router.push('/login');
  } catch (error) {
    console.error('회원가입 중 오류 발생:', error);
    alert(error.message || '회원가입에 실패했습니다.');
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
