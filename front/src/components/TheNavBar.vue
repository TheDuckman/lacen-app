<script setup lang="ts">
  import { useAppStateStore } from '@/stores/appState';

  const appStateStore = useAppStateStore();
</script>

<template>
  <v-app-bar
    color="indigo-darken-4"
    density="compact"
    flat
  >
    <v-app-bar-title>
      <v-icon
        icon="mdi-graph-outline"
        class="mr-5"
      />
      <b>LACEN</b> - <b>L</b>ong non-coding <b>A</b>nnotation by
      <b>C</b>o-<b>E</b>xpression <b>N</b>etworks
    </v-app-bar-title>
    <v-spacer />
    <div>
      <v-btn
        class="mr-5"
        icon
      >
        <v-icon
          color="orange"
          icon="mdi-cogs"
        />
      </v-btn>
      <v-icon
        v-if="appStateStore.socketConnected"
        class="mr-6"
        color="success"
        icon="mdi-lan-connect"
      />
      <v-icon
        v-else
        class="mr-6"
        color="error"
        icon="mdi-lan-disconnect"
      />
    </div>
  </v-app-bar>
</template>
