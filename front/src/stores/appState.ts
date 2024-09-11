import { StepsStatus } from '@/interface/appState.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStateStore = defineStore('appStateStore', () => {
  // Steps
  const stepStatus = ref<StepsStatus>({
    dataInput: {
      title: 'Data input',
      pageName: 'DataInput',
      current: false,
      done: false,
    },
    removingOutliers: {
      title: 'Removing outliers',
      pageName: 'RemovingOutliers',
      current: false,
      done: false,
    },
    pickingThreshold: {
      title: 'Picking threshold',
      pageName: 'PickingThreshold',
      current: false,
      done: false,
    },
    bootstraping: {
      title: 'Bootstraping',
      pageName: 'BootStraping',
      current: false,
      done: false,
      skipped: false,
    },
    creatingNetwork: {
      title: 'Creating network',
      pageName: 'CreatingNetwork',
      current: false,
      done: false,
    },
    networkModules: {
      title: 'Network modules',
      pageName: 'NetworkModules',
      current: false,
      done: false,
    },
    enrichedModules: {
      title: 'Enriched modules',
      pageName: 'EnrichedModules',
      current: false,
      done: false,
    },
    heatmap: {
      title: 'Heatmap',
      pageName: 'HeatMap',
      current: false,
      done: false,
    },
  });

  // Socket
  const socketConnected = ref(false);
  const updateSocketStatus = (newVal: boolean) => {
    socketConnected.value = newVal;
    console.log(`[SOCKET] connection: ${newVal}`);
  };

  return {
    stepStatus,
    socketConnected,
    updateSocketStatus,
  };
});
