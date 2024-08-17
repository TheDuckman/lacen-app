<script setup lang="ts">
  import TheNavBar from '@/components/TheNavBar.vue';
  import TheDrawer from '@/components/TheDrawer.vue';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
</script>

<template>
  <v-responsive class="border rounded">
    <v-app>
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
    </v-app>
  </v-responsive>
</template>
