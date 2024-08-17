<script setup lang="ts">
  import { ref } from 'vue';

  const currentImage = ref();
  const length = ref(5);
</script>

<template>
  <h1>Enriched modules</h1>
  <v-window
    v-model="currentImage"
    show-arrows
  >
    <v-window-item
      v-for="n in length"
      :key="n"
    >
      <ImageCard
        title="Image"
        :imgUrl="undefined"
      />
    </v-window-item>
  </v-window>
</template>
