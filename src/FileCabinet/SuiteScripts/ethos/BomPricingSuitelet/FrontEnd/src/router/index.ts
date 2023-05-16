import { createRouter, createWebHashHistory } from 'vue-router';

import BomPricingMainView from "@/views/BomPricingMainView.vue";
import TreeTableView      from "@/views/TreeTableView.vue";


const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Bom_main',
      component: BomPricingMainView,
    },

    {
      path: '/tree',
      name: 'tree_table',
      component: TreeTableView,
    },

  ]
})

export default router;
