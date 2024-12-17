<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import { socketEvents, variablesNames } from '@/constants/constants';
  import { ToastTypes } from '@/constants/ui.constants';
  import { computed, onBeforeMount, ref } from 'vue';
  import socket from '@/api/socket';
  import { useUserDataStore } from '@/stores/userData';
  import { cleanRString, getImgUrl } from '@/utils/functions.utils';

  const userDataStore = useUserDataStore();

  // Loading
  const loading = ref(false);

  // Emitter
  const emitter = useEmitter();

  // Images
  const modgroupsImg = ref();
  const stabilityImg = ref();

  // Cut value
  const cutBootstrap = ref(
    userDataStore.statusObj?.bootstraping.cutValue === -1
      ? undefined
      : userDataStore.statusObj?.bootstraping.cutValue,
  );
  const submitCutVal = async () => {
    if (!cutBootstrap.value || cutBootstrap.value < 0) {
      emitter.emit(ToastTypes.WARNING, 'Select a positive integer');
    } else {
      loading.value = true;
      try {
        await requester.cutBootstrap(cutBootstrap.value);
        emitter.emit(ToastTypes.SUCCESS, 'Value set');
      } catch (error) {
        emitter.emit(ToastTypes.ERROR, 'Ops...');
      }
      loading.value = false;
    }
  };

  // Is done or skipped
  const isDone = computed(() => userDataStore.statusObj?.bootstraping.done);
  const isSkipped = computed(
    () => userDataStore.statusObj?.bootstraping.skipped,
  );
  const isDoneOrSkipped = computed(() => isDone.value || isSkipped.value);

  // Functions
  const runBootstrap = async () => {
    try {
      await requester.runBootstrap();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };
  const skipStep = async () => {
    loading.value = true;
    try {
      await requester.skipBootstrap();
      emitter.emit(ToastTypes.WARNING, 'Bootstrap skipped');
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };
  const getImages = async () => {
    loading.value = true;
    const imgsStrs: string[] = await Promise.all([
      requester.getImgPath(variablesNames.BOOTSTRAP_MODGROUPS),
      requester.getImgPath(variablesNames.BOOTSTRAP_STABILITY),
    ]);
    loading.value = false;
    modgroupsImg.value = cleanRString(imgsStrs[0]);
    stabilityImg.value = cleanRString(imgsStrs[1]);
  };
  const downloadFile = async () => {
    try {
      const resp = (await requester.downloadBootstrapCsv()) as any;
      const blob = new Blob([resp], {
        type: 'csv',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'bootstrap.csv';
      link.click();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };

  // Hook
  onBeforeMount(async () => {
    socket.on(socketEvents.BOOTSTRAP_STARTED, () => {
      loading.value = true;
      emitter.emit(ToastTypes.WARNING, 'Bootstraping started');
    });
    socket.on(socketEvents.BOOTSTRAP_OK, () => {
      loading.value = false;
      emitter.emit(ToastTypes.SUCCESS, 'Bootstraping done');
      getImages();
    });
    socket.on(socketEvents.BOOTSTRAP_ERROR, () => {
      loading.value = false;
      emitter.emit(ToastTypes.ERROR, 'Bootstraping error!');
    });

    // Setup page
    if (userDataStore.statusObj?.bootstraping.done) {
      // Fetch images
      await getImages();
    } else if (userDataStore.statusObj?.bootstraping.started) {
      // enables loading state to wait for bootstrap result
      loading.value = true;
      emitter.emit(ToastTypes.WARNING, 'Bootstraping in progress...');
    }
  });
</script>

<template>
  <h1>Bootstraping</h1>
  <v-row dense>
    <v-col cols="12">
      <!-- BOOTSTRAPING -->
      <LacenCard
        title="Bootstraping"
        :iconNumber="1"
        style="height: 90%"
      >
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="d-flex flex-column align-center my-5 ml-5">
                <LacenBtn
                  @click="runBootstrap"
                  :loading="loading"
                  :disabled="isDoneOrSkipped"
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
                  :disabled="isDoneOrSkipped"
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
      <!-- CUT BOOTSTRAP -->
      <LacenCard
        v-if="isDone"
        title="Cut Bootstrap"
        style="height: 90%"
        :iconNumber="2"
      >
        <v-card-text>
          <div class="d-flex flex-row justify-center">
            <div>
              <v-text-field
                v-model="cutBootstrap"
                type="number"
                label="Cut bootstrap"
                variant="outlined"
                density="comfortable"
                persistent-hint
                hint="Select a positive integer"
                class="mr-3"
              />
            </div>
            <LacenBtn
              @click="submitCutVal"
              :loading="loading"
              :disabled="!cutBootstrap"
              size="large"
              color="success"
              icon="mdi-check"
              class="mt-1 ml-3"
              text=""
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="6">
      <LacenCard
        v-if="isDone"
        title="Download CSV"
        style="height: 90%"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              @click="downloadFile"
              :loading="loading"
              size="large"
              color="info"
              icon="mdi-download"
              text="Click to download"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Modgroups"
        :imgUrl="getImgUrl(modgroupsImg)"
      />
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Stability"
        :imgUrl="getImgUrl(stabilityImg)"
      />
    </v-col>
  </v-row>
</template>
