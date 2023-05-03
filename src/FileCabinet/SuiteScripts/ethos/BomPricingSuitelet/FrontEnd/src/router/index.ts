import { createRouter, createWebHashHistory } from 'vue-router';

import BomPricingMainView from "@/views/BomPricingMainView.vue";

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Bom_main',
      component: BomPricingMainView,
    },

  ]
})

export default router;
