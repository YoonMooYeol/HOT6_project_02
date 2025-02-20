<!-- src/components/navBar.vue -->
<template>
  <div class="nav-bar">
    <span @click="goBack">◀</span>
    <h1>🩵</h1>
    <span>☰</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useMessages } from "../store/message";

const { state } = useMessages();

const router = useRouter();

const goBack = () => {
  router.go(-1);  // 뒤로가기
};
</script>

<style scoped>
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #eee;
}

.nav-bar h1 {
  margin: 0;
  font-size: 1.5em;
}

.nav-bar span {
  cursor: pointer;
  padding: 5px 10px;
}
</style>