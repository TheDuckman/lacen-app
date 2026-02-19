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
  const emitter = useEmitter();

  // Loading state for triggering a new analysis
  const loading = ref(false);

  // Per-lncRNA download loading states
  const downloadingEnr = ref<Record<string, boolean>>({});
  const downloadingConn = ref<Record<string, boolean>>({});

  // Per-panel current image slide index
  const currentImage = ref<Record<string, number>>({});

  // List of previously analyzed lncRNAs (folder names)
  const lncRnaList = ref<string[]>([]);

  // Form input
  const lncRna = ref<string>();

  // Build static image paths from the lncRNA name
  const getLncRnaImgPaths = (name: string) => {
    const id = userDataStore.identifier;
    return {
      network: `${id}/lncrna/${name}/${name}_net.png`,
      enrichment: `${id}/lncrna/${name}/${name}_enr.png`,
    };
  };

  const fetchFolders = async () => {
    const folders = await requester.getLncRnaFolders();
    lncRnaList.value = folders;
    folders.forEach((name) => {
      if (currentImage.value[name] === undefined) {
        currentImage.value[name] = 0;
      }
    });
  };

  const generateLncRnaFiles = async () => {
    loading.value = true;
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

  const downloadEnrichmentCsv = async (name: string) => {
    downloadingEnr.value[name] = true;
    try {
      const blob = await requester.downloadLncRnaFile(name, 'enr');
      triggerDownload(blob, `${name}_enrichment.csv`);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Failed to download enrichment CSV');
    } finally {
      downloadingEnr.value[name] = false;
    }
  };

  const downloadConnectivityCsv = async (name: string) => {
    downloadingConn.value[name] = true;
    try {
      const blob = await requester.downloadLncRnaFile(name, 'connectivity');
      triggerDownload(blob, `${name}_connectivity.csv`);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Failed to download connectivity CSV');
    } finally {
      downloadingConn.value[name] = false;
    }
  };

  onBeforeMount(async () => {
    // Fetch existing lncRNA folders on page load
    try {
      await fetchFolders();
    } catch {
      // lncrna directory may not exist yet — ignore
    }

    socket.on(
      socketEvents.LNCRNA_NETWORK_ANALYSIS_GENERATED,
      async (obj: IncomingEventObject) => {
        if (obj.identifier !== userDataStore.identifier) {
          return;
        }
        try {
          await fetchFolders();
        } catch {
          // ignore
        }
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

  <!-- Input card -->
  <LacenCard
    title="Run Analysis"
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

  <!-- One expansion panel per analyzed lncRNA -->
  <v-expansion-panels
    v-if="lncRnaList.length"
    class="mt-4"
    multiple
    variant="accordion"
  >
    <v-expansion-panel
      v-for="name in lncRnaList"
      :key="name"
      elevation="0"
      style="border: 1px solid #ccc; margin-bottom: 4px"
    >
      <v-expansion-panel-title>
        {{ name }}
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <!-- Image carousel -->
        <v-window
          v-model="currentImage[name]"
          show-arrows
        >
          <v-window-item :value="0">
            <ImageCard
              title="Network Graph"
              :imgUrl="getImgUrl(getLncRnaImgPaths(name).network)"
            />
          </v-window-item>
          <v-window-item :value="1">
            <ImageCard
              title="Enrichment Graph"
              :imgUrl="getImgUrl(getLncRnaImgPaths(name).enrichment)"
            />
          </v-window-item>
        </v-window>

        <!-- Download buttons -->
        <div class="d-flex flex-row ga-3 mt-3">
          <v-btn
            color="primary"
            flat
            prepend-icon="mdi-download"
            :loading="downloadingEnr[name]"
            @click="downloadEnrichmentCsv(name)"
          >
            Enrichment CSV
          </v-btn>
          <v-btn
            color="primary"
            flat
            prepend-icon="mdi-download"
            :loading="downloadingConn[name]"
            @click="downloadConnectivityCsv(name)"
          >
            Connectivity CSV
          </v-btn>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
