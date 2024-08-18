<script setup lang="ts">
  import useEmitter from '@/composables/useEmitter';
  import { onBeforeMount, ref } from 'vue';

  const emitter = useEmitter();

  const snackbar = ref(false);
  const color = ref();
  const text = ref();
  const timeout = ref();

  const showToast = (options) => {
    text.value = Array.isArray(options.text) ? options.text : [options.text];
    timeout.value = options.timeout ?? 3000;
    color.value = options.color ?? 'info';
    snackbar.value = true;
  };

  onBeforeMount(() => {
    emitter.on('toastSuccess', (text: string, timeout = 3000) => {
      showToast({
        text,
        color: 'success',
        timeout,
      });
    });
    emitter.on('toastWarning', (text: string, timeout = 4000) => {
      showToast({
        text,
        color: 'warning',
        timeout,
      });
    });
    emitter.on('toastError', (text: string, timeout = 5000) => {
      showToast({
        text,
        color: 'error',
        timeout,
      });
    });
  });
</script>

<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
    :color="color"
    location="top"
    elevation="24"
  >
    <div
      v-for="(line, index) in text"
      :key="index"
    >
      {{ line }}
    </div>
    <!-- <template v-slot:action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        @click="show = false"
        >OK</v-btn
      >
    </template> -->
  </v-snackbar>
</template>
