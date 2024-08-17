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
          <RouterView />
        </v-container>
      </v-main>
    </v-app>
  </v-responsive>
</template>
