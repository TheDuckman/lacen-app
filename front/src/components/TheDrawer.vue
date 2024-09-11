<script setup lang="ts">
  import { StepData } from '@/interface/appState.interface';
  import { useAppStateStore } from '@/stores/appState';
  import { computed, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const router = useRouter();
  const route = useRoute();
  const appStateStore = useAppStateStore();

  // Steps
  const steps = computed(() => appStateStore.stepStatus);
  const lockSteps = ref(true);
  const doneOrNext = (step: StepData) => {
    switch (step.pageName) {
      case 'DataInput':
        return true;
      case 'RemovingOutliers':
        return steps.value.dataInput.done;
      case 'PickingThreshold':
        return steps.value.removingOutliers.done;
      case 'BootStraping':
        return steps.value.pickingThreshold.done;
      case 'CreatingNetwork':
        return (
          steps.value.bootstraping.done || steps.value.bootstraping.skipped
        );
      case 'NetworkModules':
        return steps.value.creatingNetwork.done;
      case 'EnrichedModules':
        return steps.value.networkModules.done;
      case 'Heatmap':
        return steps.value.enrichedModules.done;
      default:
        return false;
    }
  };
  const stepSubtitle = (step: StepData) => {
    if (step.skipped) {
      return 'Skipped';
    }
    if (step.done) {
      return 'Finished';
    }
    return 'Pending';
  };
  const stepColor = (step: StepData) => {
    if (step.skipped) {
      return 'warning';
    }
    if (step.done) {
      return 'success';
    }
    if (currentRoute.value === step.pageName) {
      return 'info';
    }
    return 'secondary';
  };
  const stepIcon = (step: StepData) => {
    if (step.skipped) {
      return 'mdi-debug-step-over';
    }
    if (step.done) {
      return 'mdi-check';
    }
    return 'mdi-progress-helper';
  };

  const goToRoute = (pageName: string) => {
    router.push({
      name: pageName,
    });
  };
  const currentRoute = computed(() => {
    return route.name;
  });

  const drawerVisible = ref(false);

  watch(currentRoute, () => {
    if (currentRoute.value === 'MainPage') {
      drawerVisible.value = false;
    } else {
      drawerVisible.value = true;
    }
  });
</script>

<template>
  <v-navigation-drawer v-model="drawerVisible">
    <div class="d-flex justify-center">
      <v-switch
        v-model="lockSteps"
        color="info"
        hide-details
      >
        <template #prepend>
          <v-icon
            :icon="
              lockSteps ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'
            "
          />
        </template>
        <template #label>
          {{ lockSteps ? 'Steps are locked' : 'Steps are unlocked' }}
        </template>
      </v-switch>
    </div>
    <v-divider></v-divider>
    <v-list lines="two">
      <v-list-item
        v-for="step in steps"
        :key="step.pageName"
        :active="currentRoute === step.pageName"
        @click="goToRoute(step.pageName)"
        :disabled="lockSteps && !doneOrNext(step)"
      >
        <v-list-item-title :class="`text-${stepColor(step)}`">
          {{ step.title }}
        </v-list-item-title>
        <v-list-item-subtitle> {{ stepSubtitle(step) }} </v-list-item-subtitle>
        <template v-slot:prepend>
          <v-avatar
            :color="stepColor(step)"
            size="30"
          >
            <v-icon
              :icon="stepIcon(step)"
              color="white"
            ></v-icon>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
