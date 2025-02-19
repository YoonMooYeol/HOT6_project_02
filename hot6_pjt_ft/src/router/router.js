import { createRouter, createWebHistory } from 'vue-router'
import FootBar from '@/components/FootBar.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/footbar',
            component: FootBar
        },

    ]
})

export default router