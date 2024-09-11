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

  const stackedBarplotImg = ref();
  const generateStackedBarplot = async () => {
    loading.value = true;
    try {
      stackedBarplotImg.value = await requester.generateStackedBarplot();
      await getEnrichedGraphImg();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };

  const enrichedGraphImg = ref();
  const getEnrichedGraphImg = async () => {
    loading.value = true;
    const enrichedGraphResult: string | null = (await requester.getImgPath(
      variablesNames.ENRICHEDGRAPH_IMG,
    )) as string;
    loading.value = false;
    enrichedGraphImg.value = cleanRString(enrichedGraphResult);
  };

  onBeforeMount(async () => {
    // Setup listeners
    socket.on(socketEvents.STACKED_BARPLOT_OK, (obj: IncomingEventObject) => {
      if (obj.identifier !== userDataStore.identifier) {
        return;
      }
      loading.value = false;
      stackedBarplotImg.value = cleanRString(obj.msg);
    });
    socket.on(socketEvents.THRESHOLD_PLOT_ERROR, (obj: IncomingEventObject) => {
      if (obj.identifier !== userDataStore.identifier) {
        return;
      }
      loading.value = false;
      emitter.emit(ToastTypes.ERROR, 'Error generating plot');
    });

    // Setup page
    if (userDataStore.statusObj?.networkModules.barplotGenerated) {
      loading.value = true;
      const imgsStrs: string[] = await Promise.all([
        requester.getImgPath(variablesNames.STACKEDBARPLOT_IMG),
        requester.getImgPath(variablesNames.ENRICHEDGRAPH_IMG),
      ]);
      loading.value = false;
      stackedBarplotImg.value = cleanRString(imgsStrs[0]);
      enrichedGraphImg.value = cleanRString(imgsStrs[1]);
    }
  });
</script>

<template>
  <h1>Network modules</h1>
  <v-row dense>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Stacked bar plot"
        :imgUrl="getImgUrl(stackedBarplotImg)"
      >
        <template #bottom>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              @click="generateStackedBarplot"
              :loading="loading"
              color="success"
              icon="mdi-chart-bar"
              text="Generate Bar Plot"
            />
          </div>
        </template>
      </ImageCard>
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Network modules"
        :imgUrl="getImgUrl(enrichedGraphImg)"
      />
    </v-col>
  </v-row>
</template>
