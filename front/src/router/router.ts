import { createMemoryHistory, createRouter } from 'vue-router';
import MainPage from '@/pages/MainPage.vue';
import DataInput from '@/pages/DataInput.vue';
import RemovingOutliers from '@/pages/RemovingOutliers.vue';
import PickingThreshold from '@/pages/PickingThreshold.vue';
import BootStraping from '@/pages/BootStraping.vue';
import CreatingNetwork from '@/pages/CreatingNetwork.vue';
import NetworkModules from '@/pages/NetworkModules.vue';
import EnrichedModules from '@/pages/EnrichedModules.vue';
import RnaNetworkAnalysis from '@/pages/RnaNetworkAnalysis.vue';

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
    name: 'CreatingNetwork',
    component: CreatingNetwork,
  },
  {
    path: '/creating-network',
    name: 'NetworkModules',
    component: NetworkModules,
  },
  {
    path: '/enriched-modules',
    name: 'EnrichedModules',
    component: EnrichedModules,
  },
  {
    path: '/rna-network-analysis',
    name: 'RnaNetworkAnalysis',
    component: RnaNetworkAnalysis,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
