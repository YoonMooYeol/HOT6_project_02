import { createRouter, createWebHistory } from 'vue-router'
import main from '../views/main.vue'
import FemaleChat from '../views/femaleChat.vue'
import MaleChat from '../views/maleChat.vue'
import LogIn from '../views/LogIn.vue'
import SignUp from '../views/SignUp.vue'

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
  },
  {
    path: '/male-chat',
    name: 'maleChat',
    component: MaleChat
  },
  {
    path: '/login',
    name: 'login',
    component: LogIn
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 