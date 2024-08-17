<script setup lang="ts">
  defineProps({
    title: {
      type: String,
      default: '',
    },
    iconNumber: {
      type: Number,
      default: 0,
    },
  });
</script>

<template>
  <v-card
    class="my-2"
    variant="outlined"
    style="border: 1px solid #ccc"
  >
    <v-card-title
      v-if="title.length > 0"
      class="d-flex"
    >
      <v-icon
        v-if="iconNumber > 0"
        :icon="`mdi-numeric-${iconNumber}-circle-outline`"
        color="info mr-2"
      />
      {{ title }}
    </v-card-title>
    <slot></slot>
  </v-card>
</template>
