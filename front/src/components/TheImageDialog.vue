<script setup lang="ts">
  defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
  });

  defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="92vw"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pr-2">
        <span>{{ title }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          density="comfortable"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-img
          :src="url"
          contain
          style="max-height: 80vh; width: 100%"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
