<script setup lang="ts">
  import TheNavBar from '@/components/TheNavBar.vue';
  import TheDrawer from '@/components/TheDrawer.vue';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
  import TheSnackbar from '@/components/TheSnackbar.vue';
  import NetworkAnimation from '@/components/layout/NetworkAnimation.vue';
  import { onBeforeMount } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAppStateStore } from './stores/appState';
  import { socketEvents } from '@/constants/constants';
  import socket from '@/api/socket';

  const route = useRoute();
  const appStateStore = useAppStateStore();

  onBeforeMount(() => {
    socket.on(socketEvents.CONNECT, () => {
      appStateStore.updateSocketStatus(true);
    });
    socket.on('connect', () => {
      appStateStore.updateSocketStatus(socket.connected);
    });
    socket.on('disconnect', () => {
      appStateStore.updateSocketStatus(socket.connected);
    });
    socket.on('connect_error', (error: any) => {
      console.log('[SOCKET] Connection error', { error });
    });
    socket.on('update-status-obj', (newStatusObjStr: string) => {
      console.log('[STATUS] Updated', newStatusObjStr);
    });
  });
</script>

<template>
  <v-responsive class="border rounded">
    <v-app>
      <NetworkAnimation :showAnimation="route.name === 'MainPage'">
        <TheConfirmDialog />
        <TheSnackbar />
        <v-main>
          <TheNavBar />
          <TheDrawer />
          <v-container>
            <router-view v-slot="{ Component, route }">
              <v-fade-transition hide-on-leave>
                <div :key="route.name">
                  <component :is="Component"></component>
                </div>
              </v-fade-transition>
            </router-view>
          </v-container>
        </v-main>
      </NetworkAnimation>
    </v-app>
  </v-responsive>
</template>
