<template>
    <div class="welcome">
      <div class="box">
        <h1 class="name">화내지마 자기야❤️</h1>
        <p>연인을 위한 따뜻한 메신저</p>
  
        <div class="button-container">
          <button class="login">로그인</button>
          <button class="sign-up">회원가입</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();


  </script>
  
  <style scoped>
  .welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh; /* 화면 전체 높이 */
    background-color: #f5f5f5; /* 배경색 */
  }
  
  .box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    border: 2px solid #BE7272; /* 테두리 색상 */
    border-radius: 10px; /* 모서리 둥글게 */
    background-color: #fff;
    width: 80%; /* 박스 너비 */
    max-width: 500px; /* 최대 너비 설정 */
    text-align: center;
  }
  
  .name {
    font-size: 36px;
    color: #BE7272;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 18px;
    color: #777;
    margin-bottom: 20px;
  }
  
  .button-container {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: none;
    background-color: #BE7272;
    color: white;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #a45c5c;
  }
  </style>
  