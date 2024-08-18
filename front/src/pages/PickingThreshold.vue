<script setup lang="ts">
  import requester from '@/api/requester';
  import socket from '@/api/socket';
  import useEmitter from '@/composables/useEmitter';
  import { socketEvents, variablesNames } from '@/constants/constants';
  import { ToastTypes } from '@/constants/ui.constants';
  import { IncomingEventObject } from '@/interface/api.interface';
  import { useUserDataStore } from '@/stores/userData';
  import { cleanRString, getImgUrl } from '@/utils/functions.utils';
  import { onBeforeMount, ref } from 'vue';

  const userDataStore = useUserDataStore();

  // Loading
  const loading = ref(false);

  // Emitter
  const emitter = useEmitter();

  const thresholdPlotImg = ref();
  const indicePower = ref<number | null>(null);
  const generateThresholdPlot = async () => {
    /**
     * TODO: handle long request
     */
    // Loading is turned off inside the event listener
    loading.value = true;
    try {
      await requester.generateThresholdPlot();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };

  const setIndicePower = async () => {
    // this.$root.$emit('loading-on');
    loading.value = true;
    try {
      await requester.setIndicePower(indicePower.value || 0);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
      // this.$root.$emit('loading-off');
    }
  };

  onBeforeMount(async () => {
    // Setup listeners
    socket.on(socketEvents.THRESHOLD_PLOT_OK, (obj: IncomingEventObject) => {
      if (obj.identifier !== userDataStore.identifier) {
        return;
      }
      loading.value = false;
      // this.$root.$emit('loading-off');
      thresholdPlotImg.value = cleanRString(obj.msg);
    });
    socket.on(socketEvents.THRESHOLD_PLOT_ERROR, (obj: IncomingEventObject) => {
      if (obj.identifier !== userDataStore.identifier) {
        return;
      }
      loading.value = false;
      // this.$root.$emit('loading-off');
      emitter.emit(ToastTypes.ERROR, 'Error generating plot');
    });

    // Setup page
    if (userDataStore.statusObj?.pickingThreshold.plotGenerated) {
      loading.value = true;
      const imgStr: string = await requester.getImgPath(
        variablesNames.THRESHOLD_IMG,
      );
      loading.value = false;
      thresholdPlotImg.value = cleanRString(imgStr);
    }
    // set indice value
    indicePower.value =
      userDataStore.statusObj?.pickingThreshold.indice || null;
  });
</script>

<template>
  <h1>Picking threshold</h1>
  <v-row>
    <v-col cols="4">
      <!-- FILTER TRANSFORM -->
      <LacenCard
        title="Threshold plot"
        :iconNumber="1"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              @click="generateThresholdPlot"
              :loading="loading"
              block
              color="info"
              icon="mdi-chart-bell-curve-cumulative"
              text="Generate threshold plot"
            />
          </div>
        </v-card-text>
      </LacenCard>
      <!-- REMOVE OUTLIERS -->
      <LacenCard
        title="Indice power"
        :iconNumber="2"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <v-number-input
              v-model="indicePower"
              :min="0"
              label="Indice power"
              variant="outlined"
              density="comfortable"
              width="100%"
            />
            <LacenBtn
              @click="setIndicePower"
              :disabled="!indicePower"
              :loading="loading"
              block
              color="success"
              icon="mdi-check"
              text="Set indice power"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="8">
      <!-- IMAGE -->
      <ImageCard
        title="Threshold plot"
        :imgUrl="getImgUrl(thresholdPlotImg)"
      />
    </v-col>
  </v-row>
</template>
