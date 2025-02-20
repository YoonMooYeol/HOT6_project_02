import { createRouter, createWebHistory } from 'vue-router'
import main from '../views/main.vue'
import FemaleChat from '../views/femaleChat.vue'
import LogIn from '../views/LogIn.vue'
import SignUp from '../views/SignUp.vue'
import maleChat from '../views/maleChat.vue'
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
    path: '/login',
    name: 'login',
    component: LogIn
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignUp
  },
  {
    path: '/male-chat',
    name: 'maleChat',
    component: maleChat
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 