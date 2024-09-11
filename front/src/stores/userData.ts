/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserStatusObj } from '@/interface/userStatus.interface';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useAppStateStore } from './appState';

export const useUserDataStore = defineStore('userData', () => {
  // Identifier
  const identifier = ref<string>('');
  const setIdentifier = (newVal: string) => {
    identifier.value = newVal;
  };

  // Status
  const statusObj = ref<UserStatusObj>();
  const clearStatusObj = () => {
    statusObj.value = undefined;
  };
  const updateStatusObj = (
    newStatusObjStr: string | UserStatusObj,
    isJson = false,
  ) => {
    if (isJson) {
      statusObj.value = newStatusObjStr as UserStatusObj;
    } else {
      statusObj.value = JSON.parse(newStatusObjStr as string);
    }
  };

  // Steps
  // # data input
  const isDataInputDone = computed(() => {
    if (!statusObj.value) return false;
    return Object.values(statusObj.value.dataInput).every((val) => val);
  });
  watch(isDataInputDone, () => {
    useAppStateStore().stepStatus.dataInput.done = isDataInputDone.value;
  });
  // # removing outliers
  const currentHeight = computed(() => {
    if (!statusObj.value) return false;
    return statusObj.value.removingOutliers.height;
  });
  const isFilterAndTransformDone = computed(() => {
    if (!statusObj.value) return false;
    return statusObj.value.removingOutliers.filterTransform;
  });
  const isRemovingOutliersDone = computed(() => {
    if (!statusObj.value) return false;
    return (
      statusObj.value.removingOutliers.filterTransform &&
      statusObj.value.removingOutliers.valueAccepted
    );
  });
  watch(isRemovingOutliersDone, () => {
    useAppStateStore().stepStatus.removingOutliers.done =
      isRemovingOutliersDone.value;
  });
  // picking threshold
  const isPickingThresholdDone = computed(() => {
    if (!statusObj.value) return false;
    return (
      statusObj.value.pickingThreshold.plotGenerated &&
      !!statusObj.value.pickingThreshold.indice
    );
  });
  watch(isPickingThresholdDone, () => {
    useAppStateStore().stepStatus.pickingThreshold.done =
      isPickingThresholdDone.value;
  });
  // bootstraping
  const bootstrapingSkipped = computed(() => {
    return !!statusObj.value && statusObj.value.bootstraping.skipped;
  });
  const bootstrapingDone = computed(() => {
    return !!statusObj.value && statusObj.value.bootstraping.done;
  });
  watch(bootstrapingSkipped, () => {
    useAppStateStore().stepStatus.bootstraping.done = false;
    useAppStateStore().stepStatus.bootstraping.skipped =
      bootstrapingSkipped.value;
  });
  watch(bootstrapingDone, () => {
    useAppStateStore().stepStatus.bootstraping.skipped = false;
    useAppStateStore().stepStatus.bootstraping.done = bootstrapingDone.value;
  });
  // creating network
  const createNetworkDone = computed(() => {
    return !!statusObj.value && statusObj.value.creatingNetwork.done;
  });
  watch(createNetworkDone, () => {
    useAppStateStore().stepStatus.creatingNetwork.done = true;
  });
  // network modules
  const networkModulesDone = computed(() => {
    return !!statusObj.value && statusObj.value.networkModules.barplotGenerated;
  });
  watch(networkModulesDone, () => {
    useAppStateStore().stepStatus.networkModules.done = true;
  });

  // R backend variables
  const variables = ref<any>([]);
  const updateVars = (vars: any[]) => {
    variables.value = vars;
  };
  const clearVars = () => {
    variables.value = [];
  };

  return {
    // Identifier
    identifier,
    setIdentifier,
    // Status
    statusObj,
    clearStatusObj,
    updateStatusObj,
    // Steps
    isDataInputDone,
    currentHeight,
    isFilterAndTransformDone,
    isRemovingOutliersDone,
    isPickingThresholdDone,
    bootstrapingDone,
    bootstrapingSkipped,
    createNetworkDone,
    networkModulesDone,
    // R backend variables
    variables,
    updateVars,
    clearVars,
  };
});
