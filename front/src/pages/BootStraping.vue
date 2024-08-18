<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { ref } from 'vue';

  // Loading
  const loading = ref(false);

  // Emitter
  const emitter = useEmitter();

  const runBootstrap = async () => {
    /**
     * TODO: handle long request
     */
    loading.value = true;
    // this.$root.$emit('loading-on', true);
    try {
      await requester.runBootstrap();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };
  const skipStep = async () => {
    loading.value = true;
    try {
      // this.$root.$emit('loading-on');
      await requester.skipBootstrap();
      emitter.emit(ToastTypes.WARNING, 'Bootstrap skipped');
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
      // this.$root.$emit('loading-off');
    }
  };
</script>

<template>
  <h1>Bootstraping</h1>
  <v-row dense>
    <v-col cols="12">
      <!-- BOOTSTRAPING -->
      <LacenCard
        title="Bootstraping"
        :iconNumber="1"
      >
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="d-flex flex-column align-center my-5 ml-5">
                <LacenBtn
                  @click="runBootstrap"
                  :loading="loading"
                  size="x-large"
                  color="info"
                  icon="mdi-shoe-print"
                  text="Run bootstrap"
                />
              </div>
            </v-col>
            <v-col cols="6">
              <div class="d-flex flex-column align-center my-5 ml-5">
                <LacenBtn
                  @click="skipStep"
                  :loading="loading"
                  size="x-large"
                  color="warning"
                  icon="mdi-debug-step-over"
                  text="Skip bootstraping"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Modgroups"
        :imgUrl="undefined"
      />
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Stability"
        :imgUrl="undefined"
      />
    </v-col>
  </v-row>
</template>
