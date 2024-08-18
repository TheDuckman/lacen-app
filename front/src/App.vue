<script setup lang="ts">
  import TheNavBar from '@/components/TheNavBar.vue';
  import TheDrawer from '@/components/TheDrawer.vue';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
  import NetworkAnimation from '@/components/layout/NetworkAnimation.vue';
  import { useRoute } from 'vue-router';
  import { onBeforeMount } from 'vue';
  import { socketEvents } from '@/constants/constants';
  import socket from '@/api/socket';

  const route = useRoute();

  onBeforeMount(() => {
    socket.on(socketEvents.CONNECT, () => {
      console.log('[SOCKET] User connected');
    });
  });
</script>

<template>
  <v-responsive class="border rounded">
    <v-app>
      <NetworkAnimation :showAnimation="route.name === 'MainPage'">
        <TheConfirmDialog />
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
