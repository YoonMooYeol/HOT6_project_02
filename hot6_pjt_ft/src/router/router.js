import { createRouter, createWebHistory } from 'vue-router'
import footBar from '@/components/footBar.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/footbar',
            component: footBar
        },

    ]
})

export default router