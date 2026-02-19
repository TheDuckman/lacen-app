<script setup lang="ts">
  import requester from '@/api/requester';
  import { onBeforeMount, ref } from 'vue';
  import socket from '@/api/socket';
  import { socketEvents } from '@/constants/constants';
  import { IncomingEventObject } from '@/interface/api.interface';
  import { useUserDataStore } from '@/stores/userData';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { getImgUrl } from '@/utils/functions.utils';

  const userDataStore = useUserDataStore();

  // Loading
  const loading = ref(false);
  const downloadingEnr = ref(false);
  const downloadingConn = ref(false);

  // Emitter
  const emitter = useEmitter();

  // Images
  const imgNetworkPath = ref<string | null>(null);
  const imgEnrichmentPath = ref<string | null>(null);

  // CSV paths (relative, used as keys for download requests)
  const currentImage = ref(0);

  // Form
  const lncRna = ref<string>();

  const generateLncRnaFiles = async () => {
    loading.value = true;
    imgNetworkPath.value = null;
    imgEnrichmentPath.value = null;
    if (!lncRna.value) {
      emitter.emit(ToastTypes.ERROR, 'RNA required');
      loading.value = false;
      return;
    }
    try {
      await requester.generateRnaNetworkAnalysisFiles(lncRna.value);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
      loading.value = false;
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadEnrichmentCsv = async () => {
    if (!lncRna.value) {
      return;
    }
    downloadingEnr.value = true;
    try {
      const blob = await requester.downloadLncRnaFile(lncRna.value, 'enr');
      triggerDownload(blob, `${lncRna.value.toUpperCase()}_enrichment.csv`);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Failed to download enrichment CSV');
    } finally {
      downloadingEnr.value = false;
    }
  };

  const downloadConnectivityCsv = async () => {
    if (!lncRna.value) return;
    downloadingConn.value = true;
    try {
      const blob = await requester.downloadLncRnaFile(
        lncRna.value,
        'connectivity',
      );
      triggerDownload(blob, `${lncRna.value.toUpperCase()}_connectivity.csv`);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Failed to download connectivity CSV');
    } finally {
      downloadingConn.value = false;
    }
  };

  onBeforeMount(() => {
    socket.on(
      socketEvents.LNCRNA_NETWORK_ANALYSIS_GENERATED,
      async (obj: IncomingEventObject) => {
        if (obj.identifier !== userDataStore.identifier) {
          return;
        }
        // obj.msg is [imgNetworkPath, imgEnrichmentPath, csvEnrPath, csvConnPath]
        const [netImg, enrImg] = obj.msg as string[];
        imgNetworkPath.value = netImg;
        imgEnrichmentPath.value = enrImg;
        currentImage.value = 0;
        loading.value = false;
        emitter.emit(ToastTypes.SUCCESS, 'lncRNA analysis files generated');
      },
    );
    socket.on(socketEvents.LNCRNA_NETWORK_ANALYSIS_ERROR, () => {
      loading.value = false;
      emitter.emit(ToastTypes.ERROR, 'lncRNA analysis failed');
    });
  });
</script>

<template>
  <h1>lncRNA-Centric Network Analysis</h1>
  <LacenCard
    title="Module selection"
    :iconNumber="1"
    style="height: 90%"
  >
    <v-card-text>
      <div class="d-flex flex-row justify-center align-center">
        <v-text-field
          v-model="lncRna"
          type="text"
          label="lncRNA"
          variant="outlined"
          density="comfortable"
          persistent-hint
          hint="Enter lncRNA"
          class="mr-3"
        />
        <LacenBtn
          @click="generateLncRnaFiles"
          :loading="loading"
          :disabled="!lncRna"
          size="large"
          color="success"
          icon="mdi-check"
          class="mt-1 ml-3"
          text=""
        />
      </div>
    </v-card-text>
  </LacenCard>

  <template v-if="imgNetworkPath || imgEnrichmentPath">
    <v-window
      v-model="currentImage"
      show-arrows
      class="mt-4"
    >
      <v-window-item
        v-if="imgNetworkPath"
        :value="0"
      >
        <ImageCard
          title="Network Graph"
          :imgUrl="getImgUrl(imgNetworkPath)"
        />
      </v-window-item>
      <v-window-item
        v-if="imgEnrichmentPath"
        :value="1"
      >
        <ImageCard
          title="Enrichment Graph"
          :imgUrl="getImgUrl(imgEnrichmentPath)"
        />
      </v-window-item>
    </v-window>

    <v-card class="mt-4">
      <v-card-title>Download Data Files</v-card-title>
      <v-card-text>
        <div class="d-flex flex-row ga-3">
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            :loading="downloadingEnr"
            :disabled="!lncRna"
            @click="downloadEnrichmentCsv"
          >
            Enrichment CSV
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            :loading="downloadingConn"
            :disabled="!lncRna"
            @click="downloadConnectivityCsv"
          >
            Connectivity CSV
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </template>
</template>
