<template>
  <div class="view-container">
    <h1>내 정보</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>
    <div v-else-if="user">
      <p><strong>ID:</strong> {{ user.id }}</p>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Gender:</strong> {{ user.gender }}</p>
    </div>
    <div v-else>
      <p>No user data available.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiRequest } from '../store/apiClient';

const user = ref(null);
const loading = ref(false);
const error = ref(null);

const fetchUser = async () => {
  loading.value = true;
  try {
    const response = await apiRequest('http://127.0.0.1:8000/api/auth/user-detail', { method: 'GET' });
    if (!response.ok) {
      throw new Error('사용자 정보를 가져오지 못했습니다.');
    }
    const data = await response.json();
    user.value = data;
  } catch (err) {
    console.error("Error fetching user:", err);
    error.value = err;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<style scoped>
.view-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.loading,
.error {
  text-align: center;
  margin: 20px 0;
  font-size: 16px;
}
</style>
