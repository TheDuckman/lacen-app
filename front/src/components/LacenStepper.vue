<script setup lang="ts">
  import DataInputHeader from '@/components/steps/DataInputHeader.vue';
</script>

<template>
  <v-stepper
    alt-labels
    class="mx-2 my-2"
  >
    <v-stepper-header>
      <DataInputHeader
        :stepNumber="1"
        :currentStep="1"
        :isComplete="true"
        :filesOk="true"
        :annotationOk="true"
      />

      <v-divider></v-divider>

      <v-stepper-item
        title="Ad sizes"
        value="2"
      ></v-stepper-item>

      <v-divider></v-divider>

      <v-stepper-item
        title="Ad templates"
        value="3"
      ></v-stepper-item>
    </v-stepper-header>
  </v-stepper>
</template>

<style scoped></style>
