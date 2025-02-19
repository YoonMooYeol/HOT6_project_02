<template>
    <div class="foot-bar">
      <button class="heart-button" @click="toggleLike">
        {{ isLiked ? "♥︎" : "♡" }}
      </button>
      <input 
      v-model="newMessage" 
      :disabled="!selectedMessage" 
      placeholder="메시지 입력" 
      />
      <button class="send-button" @click="handleSend" :disabled="!selectedMessage || !newMessage.trim()">
      ➢
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref, defineProps, defineEmits } from "vue";
  
  const emit = defineEmits(["sendMessage", "toggleLike"]);
  
  const props = defineProps({ isLiked: Boolean, selectedMessage: String,
  });

  const newMessage = ref("");
  
  const handleSend = () => {
    if (!newMessage.value.trim()) return; 
    emit("sendMessage", newMessage.value); 
    newMessage.value = ""; 
  };

  const toggleLike = () => {
    emit("toggleLike");
  };
  </script>
  
  <style scoped>
  .foot-bar {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #FFFFFF;
    width: 100%;
    max-width: 370px;
    border-radius: 0px;
  }
  
  .heart-button {
    margin-left: 8px;
    padding: 7px 12px;
    border-radius: 30px;
    border: none;
    background: #EAEAEA;
    font-size: 18px;
    cursor: pointer;
    margin-right: 8px;
  }
  
  
  input {
    flex-grow: 1;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid #ccc;
    outline: none;
    font-size: 16px;
  }
  
  .send-button {
    margin-left: 8px;
    padding: 7px 9px;
    border-radius: 30px;
    border: none;
    background-color: #EAEAEA;
    color: rgb(0, 0, 0);
    cursor: pointer;
    font-size: 18px;
    transition: background-color 0.3s ease;
  }
  
  .send-button:hover {
    background-color: #979595;
    cursor: not-allowed;
  }
  </style>
  