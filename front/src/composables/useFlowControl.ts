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
  };

  return {
    nextStep,
  };
}
