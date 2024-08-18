<script setup lang="ts">
  import TheNavBar from '@/components/TheNavBar.vue';
  import TheDrawer from '@/components/TheDrawer.vue';
  import TheSnackbar from '@/components/TheSnackbar.vue';
  import NetworkAnimation from '@/components/layout/NetworkAnimation.vue';
  import { onBeforeMount } from 'vue';
  import { useRoute } from 'vue-router';
  import { useAppStateStore } from '@/stores/appState';
  import { useUserDataStore } from '@/stores/userData';
  import { socketEvents } from '@/constants/constants';
  import socket from '@/api/socket';

  const route = useRoute();
  const appStateStore = useAppStateStore();
  const userDataStore = useUserDataStore();

  onBeforeMount(() => {
    socket.on(socketEvents.CONNECT, () => {
      appStateStore.updateSocketStatus(socket.connected);
    });
    socket.on(socketEvents.DISCONNECT, () => {
      appStateStore.updateSocketStatus(socket.connected);
    });
    socket.on(socketEvents.CONNECT_ERROR, (error: any) => {
      console.log('[SOCKET] Connection error', { error });
    });
    // Listen to event from backend to update user data
    socket.on(socketEvents.UPDATE_STATUS_OBJ, (newStatusObjStr: string) => {
      userDataStore.updateStatusObj(newStatusObjStr);
      console.log('[STATUS] Updated', newStatusObjStr);
    });
  });
</script>

<template>
  <v-responsive class="border rounded">
    <v-app>
      <NetworkAnimation :showAnimation="route.name === 'MainPage'">
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
