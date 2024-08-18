<script setup lang="ts"></script>

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
        class="mr-2"
        color="error"
        icon="mdi-lan-disconnect"
      />
      <v-icon
        class="mr-2"
        color="success"
        icon="mdi-lan-connect"
      />
    </div>
  </v-app-bar>
</template>
