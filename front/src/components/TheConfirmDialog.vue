<script setup lang="ts">
  import useEmitter from '@/composables/useEmitter';
  import { onMounted, ref } from 'vue';

  // Emitter
  const emitter = useEmitter();

  // State
  const isVisible = ref(false);

  // Content
  const title = ref('');
  const text = ref<string[]>([]);

  /**
   * TODO: Resolve this
   */
  // Hanlders
  const resolveFn = ref<any>();
  const rejectFn = ref<any>();
  const confirm = () => {
    resolveFn.value(true);
    isVisible.value = false;
  };
  const cancel = () => {
    resolveFn.value(false);
    isVisible.value = false;
  };

  onMounted(() => {
    emitter.on('confirm', async (eventData: any) => {
      title.value = eventData.title;
      text.value = eventData.text;
      isVisible.value = true;
      return new Promise((resolve, reject) => {
        resolveFn.value = resolve;
        rejectFn.value = reject;
      });
    });
  });
</script>

<template>
  <v-dialog
    v-model="isVisible"
    max-width="500"
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
          @click="cancel"
        >
          Close
        </v-btn>
        <v-spacer />
        <v-btn
          color="success"
          prepend-icon="mdi-check"
          @click="confirm"
        >
          Okay
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
