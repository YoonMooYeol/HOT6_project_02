const routes = [
  {
    path: '/',
    name: 'main',
    component: main
  },
  {
    path: '/user-detail',
    name: 'UserDetail',
    component: () => import('../views/DetailUser.vue')
  },
  {
    path: '/female-chat',
    name: 'FemaleChat',
    component: FemaleChat
  },
] 