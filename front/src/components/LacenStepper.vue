<script setup lang="ts">
  import { ref } from 'vue';
  import DataInputHeader from '@/components/steps/DataInputHeader.vue';
  import DataInputContent from '@/components/steps/DataInputContent.vue';
  import { stepNumbers } from '@/constants/constants';

  const stepper = ref(1);
</script>

<template>
  <v-stepper
    alt-labels
    non-linear
    class="mx-2 my-2"
    v-model="stepper"
  >
    <v-stepper-header>
      <DataInputHeader
        :stepNumber="stepNumbers.dataInput"
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
    <v-stepper-window>
      <DataInputContent :stepNumber="stepNumbers.dataInput" />
    </v-stepper-window>
  </v-stepper>
</template>
