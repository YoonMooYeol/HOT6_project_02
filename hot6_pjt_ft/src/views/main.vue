<template>
    <div class="home">
      <h1>Welcome to Chat App</h1>
      <h2>화내지마 자기야 ♥︎</h2>
      <h3>연인을 위한 따뜻한 메신저</h3>
      <div class="button-container">
        <router-link to="/female-chat" class="chat-button female">
          여성 채팅
        </router-link>
        <router-link to="/male-chat" class="chat-button male">
          남성 채팅
        </router-link>
        <!-- 추후 다른 채팅방 추가 가능 -->
      </div>
    </div>
  </template>
  
  <script setup>
  // Home view logic here
  </script>
  
  <style scoped>
  .home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #ffefef;
  }
  
  h1 {
    color: #ffffff;
    margin-bottom: 2rem;
    -webkit-text-stroke: 2px #BE7272;
  }

  h2 {
    color: #BE7272;
    margin-bottom: 1rem;
  }

  h3 {
    color: #BE7272;
    margin-bottom: 2rem;
  }
  .button-container {
    display: flex;
    gap: 1rem;
  }
  
  .chat-button {
    padding: 1rem 2rem;
    border-radius: 20px;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.2s;
  }
  
  .chat-button:hover {
    transform: scale(1.05);
  }
  
  .female {
    background-color: #ffd3de;
    color: #5d5d5d;
  }
  
  .female:hover {
    background-color: #BE7272;
    color: white;
  }

  .male {
    background-color: #CCE6FF;
    color: #5d5d5d;
  }
  
  .male:hover {
    background-color: #88a9e7;
    color: white;
  }
  </style> 