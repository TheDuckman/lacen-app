<script setup lang="ts">
  import TheNavBar from '@/components/TheNavBar.vue';
  import TheDrawer from '@/components/TheDrawer.vue';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
  import NetworkAnimation from '@/components/layout/NetworkAnimation.vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
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
