<template>
    <div class="home">
      <h1>Welcome to Chat App</h1>
      <div class="button-container">
        <router-link to="/female-chat" class="chat-button female">
          여성 채팅
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
    background-color: #d8faff;
  }
  
  h1 {
    color: #333;
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
    background-color: #ffebf0;
    color: #ff69b4;
  }
  
  .female:hover {
    background-color: #ff69b4;
    color: white;
  }
  </style> 