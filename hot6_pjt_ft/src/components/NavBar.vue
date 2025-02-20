<!-- src/components/navBar.vue -->
<template>
  <div class="nav-bar" :class="{ warm: warmState.isWarmMode }">
    <span @click="goBack">◀</span>
    <h1>🩵</h1>
    <span>☰</span>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useWarm } from "../store/warm";

const router = useRouter();
const { warmState } = useWarm();

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
  font-weight: bold;
  transition: background-color 0.3s ease;  /* 전환 효과 추가 */
}

.nav-bar span {
  cursor: pointer;
  padding: 5px 10px;
}

.nav-bar.warm {
  background-color: #FFE0E0;  /* 웜모드일 때의 배경색 */
}
</style>