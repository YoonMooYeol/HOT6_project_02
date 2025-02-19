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

      <div v-if="isPopupVisible" class="popup">
        <div class="popup-content">
          <button class="close-btn" @click="togglePopup">×</button>
          <button class="refresh-btn" @click="refreshOptions">↺</button>
          <div class="options">
            <button v-for="(option, index) in options" 
                    :key="index" class="option-btn"
                    @click="selectOption(option)">
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      
      </div>
      <footBar @sendMessage="handleSendMessage" 
               @toggleLike="toggleLike" 
               :isLiked="isLiked" 
               :selectedMessage="selectedMessage"
      />
    </div>
  </div>

</template>


<script setup>
import { ref } from "vue";
import navBar from "./components/navBar.vue";
import footBar from "./components/footBar.vue";

const messages = ref([]);
const isLiked = ref(false);
const isPopupVisible = ref(false);
const options = ref(["선택 1", "선택 2", "선택 3"]);
const pendingMessage = ref("");
const selectedMessage = ref("");

const handleSendMessage = (newMessage) => {
  if (!selectedMessage.value) return; 
  messages.value.push({ text: selectedMessage.value, isMine: true });
  selectedMessage.value = ""; 
  isPopupVisible.value = false;
};


const selectOption = (option) => {
  selectedMessage.value = option;
};


const toggleLike = () => {
  isLiked.value = !isLiked.value;
};


const togglePopup = () => {
  isPopupVisible.value = false;
};


const refreshOptions = () => {
  options.value = ["새 선택 1", "새 선택 2", "새 선택 3"];
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
  background-color: #ffebf0;
}

.other {
  align-self: flex-start;
  background-color: #fff;
}

.empty-message {
  text-align: center;
  color: #888;
  font-size: 14px;
}

.popup {
  position: absolute;
  bottom: 70px;
  left: 50%;
  transform: translateX(-50%);
  width: 380px;
  background: white;
  padding: 15px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.refresh-btn {
  position: absolute;
  top: 10px;
  left: 15px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

.options {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 90%;
}

.option-btn {
  padding: 10px;
  width: 80%;
  border: none;
  background: #ff69b4;
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
}

.option-btn:hover {
  background: #ff1493;
}
</style>

