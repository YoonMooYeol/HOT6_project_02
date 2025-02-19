import { createRouter, createWebHistory } from 'vue-router'
import main from '../views/main.vue'
import FemaleChat from '../views/femaleChat.vue'

const routes = [
  {
    path: '/',
    name: 'main',
    component: main
  },
  {
    path: '/female-chat',
    name: 'femaleChat',
    component: FemaleChat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 