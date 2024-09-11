import router from '@/router/router';
import { useUserDataStore } from '@/stores/userData';
import { useAppStateStore } from '@/stores/appState';

export default function useFlowControl() {
  const userDataStore = useUserDataStore();
  const appStateStore = useAppStateStore();

  const nextStep = () => {
    if (!userDataStore.isDataInputDone) {
      return router.push({
        name: appStateStore.stepStatus.dataInput.pageName,
      });
    }
    if (!userDataStore.isRemovingOutliersDone) {
      return router.push({
        name: appStateStore.stepStatus.removingOutliers.pageName,
      });
    }
    if (!userDataStore.isPickingThresholdDone) {
      return router.push({
        name: appStateStore.stepStatus.pickingThreshold.pageName,
      });
    }
    if (!userDataStore.bootstrapingDone && !userDataStore.bootstrapingSkipped) {
      return router.push({
        name: appStateStore.stepStatus.bootstraping.pageName,
      });
    }
    if (!userDataStore.createNetworkDone) {
      return router.push({
        name: appStateStore.stepStatus.creatingNetwork.pageName,
      });
    }
    if (!userDataStore.networkModulesDone) {
      return router.push({
        name: appStateStore.stepStatus.networkModules.pageName,
      });
    }
    return router.push({
      name: appStateStore.stepStatus.enrichedModules.pageName,
    });
  };

  return {
    nextStep,
  };
}
