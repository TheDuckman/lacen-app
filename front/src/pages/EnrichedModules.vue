<script setup lang="ts">
  import requester from '@/api/requester';
  import { onBeforeMount, ref } from 'vue';
  import socket from '@/api/socket';
  import { socketEvents } from '@/constants/constants';
  import {
    HeatmapImgObj,
    IncomingEventObject,
  } from '@/interface/api.interface';
  import { useUserDataStore } from '@/stores/userData';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { getImgUrl } from '@/utils/functions.utils';
  import TheImageDialog from '@/components/TheImageDialog.vue';

  const userDataStore = useUserDataStore();
  const emitter = useEmitter();

  // Loading state for triggering a new heatmap generation
  const loading = ref(false);

  // List of heatmap images fetched from server
  const heatmapList = ref<HeatmapImgObj[]>([]);

  // Dialog state
  const dialogVisible = ref(false);
  const dialogUrl = ref('');
  const dialogTitle = ref('');

  const openDialog = (img: HeatmapImgObj) => {
    dialogUrl.value = getImgUrl(img.path) ?? '';
    dialogTitle.value = parsePanelTitle(img.name);
    dialogVisible.value = true;
  };

  // Form
  const moduleNumber = ref();
  const submoduleNumber = ref();

  const parsePanelTitle = (filename: string): string => {
    const match = filename.match(/heatmap_(\d+)_(\d+)\.png/);
    if (match) {
      return `Module: ${match[1]} — Submodule: ${match[2]}`;
    }
    return filename;
  };

  const fetchHeatmaps = async () => {
    const imgs = await requester.getHeatmapImgs();
    heatmapList.value = imgs ?? [];
  };

  const generateHeatmap = async () => {
    loading.value = true;
    try {
      await requester.generateHeatmap(
        moduleNumber.value,
        submoduleNumber.value,
      );
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
      loading.value = false;
    }
  };

  onBeforeMount(async () => {
    // Fetch existing heatmaps on page load
    try {
      await fetchHeatmaps();
    } catch {
      // heatmaps directory may be empty — ignore
    }

    socket.on(
      socketEvents.HEATMAP_GENERATED,
      async (obj: IncomingEventObject) => {
        if (obj.identifier !== userDataStore.identifier) {
          return;
        }
        try {
          await fetchHeatmaps();
        } catch {
          // ignore
        }
        loading.value = false;
        emitter.emit(ToastTypes.SUCCESS, 'Heatmap generated successfully');
      },
    );
  });
</script>

<template>
  <h1>Enriched modules</h1>

  <!-- Input card -->
  <LacenCard
    title="Module selection"
    :iconNumber="1"
    style="height: 90%"
  >
    <v-card-text>
      <div class="d-flex flex-row justify-center">
        <v-text-field
          v-model="moduleNumber"
          type="number"
          label="Module #"
          variant="outlined"
          density="comfortable"
          persistent-hint
          hint="Select a module number"
          class="mr-3"
        />
        <v-text-field
          v-model="submoduleNumber"
          type="number"
          label="Submodule #"
          variant="outlined"
          density="comfortable"
          persistent-hint
          hint="Select a submodule number"
          class="mr-3"
        />
        <LacenBtn
          @click="generateHeatmap"
          :loading="loading"
          :disabled="!moduleNumber || !submoduleNumber"
          size="large"
          color="success"
          icon="mdi-check"
          class="mt-1 ml-3"
          text=""
        />
      </div>
    </v-card-text>
  </LacenCard>

  <!-- Heatmap cards grid -->
  <v-row
    v-if="heatmapList.length"
    class="mt-4"
  >
    <v-col
      v-for="img in heatmapList"
      :key="img.name"
      cols="12"
      sm="6"
      lg="4"
    >
      <ImageCard
        :title="parsePanelTitle(img.name)"
        :img-url="getImgUrl(img.path) ?? undefined"
        max-height="220"
        style="cursor: pointer"
        @click="openDialog(img)"
      />
    </v-col>
  </v-row>

  <TheImageDialog
    v-model="dialogVisible"
    :url="dialogUrl"
    :title="dialogTitle"
  />
</template>
