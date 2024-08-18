<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import { annotationTypes, ToastTypes } from '@/constants/ui.constants';
  import { computed, ref } from 'vue';

  // Emitter
  const emitter = useEmitter();

  // Loading
  const loading = ref(false);

  // Data files
  const countData = ref();
  const expressionData = ref();
  const labelData = ref();
  const dataFilesSelected = computed(() => {
    return countData.value && expressionData.value && labelData.value;
  });
  const submitDataFiles = async () => {
    loading.value = true;
    const formData = new FormData();
    formData.append('count', countData.value);
    formData.append('expression', expressionData.value);
    formData.append('label', labelData.value);
    try {
      await requester.uploadDataFiles(formData);
      // this.$root.$emit('new-gui-output', res);
      emitter.emit(ToastTypes.SUCCESS, 'Upload successful');
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };

  // Annotation files
  const codingAnnotation = ref();
  const noncodingAnnotation = ref();
  const submitAnnotation = async (type: string) => {
    const formData = new FormData();
    if (type === annotationTypes.CODING) {
      formData.append('file', codingAnnotation.value);
    } else {
      formData.append('file', noncodingAnnotation.value);
    }
    formData.append('type', type);
    loading.value = true;
    try {
      await requester.uploadAnnotationFile(formData);
      emitter.emit(ToastTypes.SUCCESS, 'Upload successful');
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      emitter.emit('loading-off');
      loading.value = false;
    }
  };
</script>

<template>
  <h1>Data input</h1>
  <LacenCard
    title="Select data files"
    :iconNumber="1"
  >
    <v-card-text>
      <v-file-input
        v-model="countData"
        accept=".csv"
        label="Count data file"
        prepend-icon="mdi-numeric"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
      <v-file-input
        v-model="expressionData"
        accept=".csv"
        label="Expression data file"
        prepend-icon="mdi-dna"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
      <v-file-input
        v-model="labelData"
        accept=".csv"
        label="Label data file"
        prepend-icon="mdi-tag"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <LacenBtn
        :disabled="!dataFilesSelected"
        :loading="loading"
        @click="submitDataFiles"
        color="success"
        icon="mdi-upload"
        text="Submit files"
      />
    </v-card-actions>
  </LacenCard>
  <LacenCard
    title="Load annotation data"
    :iconNumber="2"
  >
    <v-card-text>
      <div class="d-flex align-baseline">
        <v-file-input
          v-model="codingAnnotation"
          label="Gene annotation file"
          prepend-icon="mdi-upload"
          chips
          density="comfortable"
          variant="outlined"
        />
        <LacenBtn
          :disabled="!codingAnnotation"
          :loading="loading"
          @click="submitAnnotation(annotationTypes.CODING)"
          color="success"
          icon="mdi-upload"
          class="ml-4"
        />
      </div>
      <div class="d-flex align-baseline">
        <v-file-input
          v-model="noncodingAnnotation"
          label="Non-coding gene annotation file"
          prepend-icon="mdi-upload"
          chips
          density="comfortable"
          variant="outlined"
        />
        <LacenBtn
          :disabled="!noncodingAnnotation"
          :loading="loading"
          @click="submitAnnotation(annotationTypes.NONCODING)"
          color="success"
          icon="mdi-upload"
          class="ml-4"
        />
      </div>
    </v-card-text>
  </LacenCard>
</template>
