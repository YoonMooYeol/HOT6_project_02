<!-- src/components/navBar.vue -->
<template>
  <nav class="nav-bar">
    <div class="nav-top">
      <div class="logo">
        <router-link to="/">{{ isChatView ? chatIcon : 'MyApp' }}</router-link>
      </div>

      <button class="hamburger" @click="toggleMenu">
        ☰
      </button>
    </div>
    <div class="menu" v-if="menuVisible">
      <ul>
        <li><router-link to="/">메인</router-link></li>
        <li><router-link to="/all-user">모든 사용자</router-link></li>
        <li><router-link to="/detail-user">내 정보</router-link></li>
        <li><a href="#" @click.prevent="logout">로그아웃</a></li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const menuVisible = ref(false);
const router = useRouter();
const route = useRoute();

const isChatView = computed(() => {
  return ['/male-chat', '/female-chat'].includes(route.path);
});

const chatIcon = computed(() => {
  if (route.path === '/male-chat') {
    return '여보🩷';
  } else if (route.path === '/female-chat') {
    return '오빠🩵';
  } else {
    return 'MyApp';
  }
});

const toggleMenu = () => {
  menuVisible.value = !menuVisible.value;
};

const logout = () => {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
  // 필요한 경우 다른 사용자 정보도 삭제
  router.push('/login');
};
</script>

<style scoped>
.nav-bar {
  background-color: #ffffff;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 20px;
  font-weight: bold;
  text-decoration: none;
  color: #333;
}

.hamburger {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.menu {
  margin-top: 10px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  padding: 8px 0;
}

.menu li a {
  text-decoration: none;
  color: #333;
}
</style>