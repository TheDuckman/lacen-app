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
    if (step.done) {
      return 'success';
    }
    if (currentRoute.value === step.pageName) {
      return 'info';
    }
    return 'secondary';
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
    <v-list lines="two">
      <v-list-item
        v-for="(step, index) in steps"
        :key="index"
        :active="currentRoute === step.pageName"
        @click="goToRoute(step.pageName)"
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
              :icon="step.done ? 'mdi-check' : 'mdi-progress-helper'"
              color="white"
            ></v-icon>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
