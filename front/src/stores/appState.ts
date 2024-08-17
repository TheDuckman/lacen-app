/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStateStore = defineStore('appStateStore', () => {
  const stepStatus = ref({
    dataInput: {
      current: false,
      done: false,
    },
    removingOutliers: {
      current: false,
      done: false,
    },
    pickingThreshold: {
      current: false,
      done: false,
    },
    bootstraping: {
      current: false,
      done: false,
      skipped: false,
    },
    creatingNetworks: {
      current: false,
      done: false,
    },
    networkModules: {
      current: false,
      done: false,
    },
    enrichedModules: {
      current: false,
      done: false,
    },
    heatmap: {
      current: false,
      done: false,
    },
  });

  return {
    stepStatus,
  };
});
