<script setup lang="ts">
  defineProps({
    isVisible: {
      type: Boolean,
      default: false,
    },
    text: {
      type: Array,
      default: () => [],
    },
    title: {
      type: String,
      default: '',
    },
    cancelHandler: {
      default: () => () => {},
    },
    confirmHandler: {
      default: () => () => {},
    },
  });
</script>

<template>
  <v-dialog
    persistent
    :model-value="isVisible"
    max-width="700"
  >
    <v-card>
      <v-card-title
        style="word-break: normal"
        class=""
      >
        <div>
          <span>{{ title }}</span>
        </div>
      </v-card-title>
      <v-card-text>
        <p
          v-for="(line, index) in text"
          :key="index"
        >
          {{ line }}
        </p>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="error"
          prepend-icon="mdi-close"
          @click="cancelHandler"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          color="success"
          prepend-icon="mdi-check"
          @click="confirmHandler"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
