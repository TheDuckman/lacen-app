import { createMemoryHistory, createRouter } from 'vue-router';
import MainPage from '@/pages/MainPage.vue';
import DataInput from '@/pages/DataInput.vue';
import RemovingOutliers from '@/pages/RemovingOutliers.vue';
import PickingThreshold from '@/pages/PickingThreshold.vue';
import BootStraping from '@/pages/BootStraping.vue';
import CreatingNetworks from '@/pages/CreatingNetworks.vue';
import NetworkModules from '@/pages/NetworkModules.vue';

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
  {
    path: '/picking-threshold',
    name: 'PickingThreshold',
    component: PickingThreshold,
  },
  {
    path: '/bootstraping',
    name: 'BootStraping',
    component: BootStraping,
  },
  {
    path: '/creating-network',
    name: 'CreatingNetworks',
    component: CreatingNetworks,
  },
  {
    path: '/creating-network',
    name: 'NetworkModules',
    component: NetworkModules,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
