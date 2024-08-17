import { createMemoryHistory, createRouter } from 'vue-router';
import MainPage from '@/pages/MainPage.vue';
import DataInput from '@/pages/DataInput.vue';
import RemovingOutliers from '@/pages/RemovingOutliers.vue';

const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage,
  },
  {
    path: '/data-input',
    name: 'DataInput',
    component: DataInput,
  },
  {
    path: '/removing-outliers',
    name: 'RemovingOutliers',
    component: RemovingOutliers,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
