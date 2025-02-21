<template>
  <div class="view-container">
    <h1>모든 사용자 목록</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error.message }}</div>
    <ul v-else>
      <li v-for="user in users" :key="user.id">
        {{ user.id }} : {{ user.username }} 
        <span v-if="user.name && user.name.trim() !== ''"> - {{ user.name }}</span>
        <span v-if="user.gender && user.gender.trim() !== ''"> ({{ user.gender }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../store/apiClient';

const users = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchUsers = async () => {
  loading.value = true;
  try {
    // API 호출 : 모든 사용자 목록 가져오기
    const response = await apiRequest('http://127.0.0.1:8000/api/auth/users-list/', { method: 'GET' });
    if (!response.ok) {
      throw new Error('사용자 목록을 가져오는 데 실패했습니다.');
    }
    // API가 배열 형태의 데이터를 반환한다고 가정합니다.
    const data = await response.json();
    users.value = data;
  } catch (err) {
    console.error("Error fetching users:", err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.view-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.all-users h1 {
  text-align: center;
  margin-bottom: 20px;
}

.loading,
.error {
  text-align: center;
  margin: 20px 0;
  font-size: 16px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  margin: 4px 0;
  border-bottom: 1px solid #ddd;
}
</style>
