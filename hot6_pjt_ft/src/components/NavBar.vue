<!-- src/components/navBar.vue -->
<template>
    <div class="nav-bar">
      <span @click="goBack">◀</span>
      <h1>🩵</h1>
      <span>☰</span>
    </div>
  </template>
  
  <script setup>
  const goBack = () => {
    alert("뒤로 가기");
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
  }
  </style>