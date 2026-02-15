<script setup lang="ts">
  import requester from '@/api/requester';
  import { onBeforeMount, ref } from 'vue';
  import socket from '@/api/socket';
  import { socketEvents, variablesNames } from '@/constants/constants';
  import { IncomingEventObject } from '@/interface/api.interface';
  import { useUserDataStore } from '@/stores/userData';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { cleanRString, getImgUrl } from '@/utils/functions.utils';

  const userDataStore = useUserDataStore();

  // Loading
  const loading = ref(false);

  // Emitter
  const emitter = useEmitter();

  // Images
  const images = ref<string[]>([]);
  const currentImage = ref(0);

  // Form
  const moduleNumber = ref();
  const submoduleNumber = ref();

  const generateHeatmap = async () => {
    loading.value = true;
    try {
      await requester.generateHeatmap(
        moduleNumber.value,
        submoduleNumber.value,
      );
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };
  const getHeatmapImg = async () => {
    loading.value = true;
    const heatmapResult: string | null = (await requester.getHeatmapImgPath(
      variablesNames.HEATMAP_IMG.replace(
        '[moduleNum]',
        moduleNumber.value,
      ).replace('[submoduleNum]', submoduleNumber.value),
    )) as string;
    loading.value = false;

    images.value.push(cleanRString(heatmapResult));
    emitter.emit(ToastTypes.SUCCESS, 'Heatmap generated successfully');
  };

  onBeforeMount(() => {
    socket.on(
      socketEvents.HEATMAP_GENERATED,
      async (obj: IncomingEventObject) => {
        if (obj.identifier !== userDataStore.identifier) {
          return;
        }
        await getHeatmapImg();
        loading.value = false;
      },
    );
  });
</script>

<template>
  <h1>Enriched modules</h1>
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
  <v-window
    v-model="currentImage"
    show-arrows
  >
    <v-window-item
      v-for="(imgPath, index) in images"
      :value="index"
      :key="imgPath"
    >
      <ImageCard
        title="Image"
        :imgUrl="getImgUrl(imgPath)"
      />
    </v-window-item>
  </v-window>
</template>
