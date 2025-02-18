<template>
  <div class="app">
    <div class="chat-container" :class="{ liked: isLiked }">
      <navBar />
      <div class="chat-content">
        <p v-if="messages.length === 0" class="empty-message"></p>
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['chat-bubble', message.isMine ? 'mine' : 'other']"
        >
          <span class="message-text">{{ message.text }}</span>
        </div>
      </div>
      <footBar @sendMessage="sendMessage" @toggleLike="toggleLike" :isLiked="isLiked" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import navBar from "./components/navBar.vue";
import footBar from "./components/footBar.vue";

const messages = ref([]);
const isLiked = ref(false);

const sendMessage = (newMessage) => {
  messages.value.push({ text: newMessage, isMine: true });
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
};
</script>

<style scoped>
.app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #d8faff;
}

.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 390px;
  height: 90vh;
  border-radius: 15px;
  margin-right: 30px;
  overflow: hidden;
  background-color: #EAEAEA;
  transition: background-color 0.3s ease;
}
.chat-container.liked {
  background-color:#FFE0E0 
}

.chat-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-bubble {
  max-width: 75%;
  padding: 10px;
  margin: 5px;
  border-radius: 15px;
  background-color: white;
}

.mine {
  align-self: flex-end;
}

.other {
  align-self: flex-start;
}

.empty-message {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
