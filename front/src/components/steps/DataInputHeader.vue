<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps({
    stepNumber: {
      type: Number,
      default: 0,
    },
    currentStep: {
      type: Number,
      default: 0,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    filesOk: {
      type: Boolean,
      default: false,
    },
    annotationOk: {
      type: Boolean,
      default: false,
    },
  });

  const stepColor = computed(() => {
    if (props.isComplete && props.currentStep === props.stepNumber)
      return 'success';
    if (props.isComplete) return 'success';
    return 'primary';
  });
</script>

<template>
  <v-stepper-item
    :value="stepNumber"
    :complete="isComplete"
    :color="stepColor"
    editable
    :edit-icon="isComplete ? 'mdi-check' : 'mdi-pencil'"
    class="px-2"
  >
    <small class="text-body-1 font-weight-bold">Data input</small>
    <div>
      <div :class="`font-weight-medium ${filesOk ? 'text-success' : ''}`">
        <v-icon
          v-if="filesOk"
          color="success"
          class="pb-1"
          size="x-small"
          icon="mdi-check-circle-outline"
        />
        <v-icon
          v-else
          color="secondary"
          class="pb-1"
          size="x-small"
          icon="mdi-circle-outline"
        />
        <span
          :class="
            filesOk
              ? 'text-success text-caption'
              : 'text-secondary text-caption'
          "
        >
          User data files
        </span>
      </div>
      <div :class="`font-weight-medium ${annotationOk ? 'text-success' : ''}`">
        <v-icon
          v-if="annotationOk"
          color="success"
          class="pb-1"
          size="x-small"
          icon="mdi-check-circle-outline"
        />
        <v-icon
          v-else
          color="secondary"
          class="pb-1"
          size="x-small"
          icon="mdi-circle-outline"
        />
        <span
          :class="
            annotationOk
              ? 'text-success text-caption'
              : 'text-secondary text-caption'
          "
        >
          Annotation files
        </span>
      </div>
    </div>
  </v-stepper-item>
</template>

<style scoped></style>
