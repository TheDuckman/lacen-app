<script setup lang="ts">
  import requester from '@/api/requester';
  import socket from '@/api/socket';
  import useEmitter from '@/composables/useEmitter';
  import { socketEvents } from '@/constants/constants';
  import { ToastTypes } from '@/constants/ui.constants';
  import { useUserDataStore } from '@/stores/userData';
  import { onBeforeMount, ref } from 'vue';

  const userDataStore = useUserDataStore();

  // Loading
  const loading = ref(false);

  // Emitter
  const emitter = useEmitter();

  const generateNetwork = async (): Promise<void> => {
    try {
      await requester.generateNetwork();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    }
  };

  onBeforeMount(() => {
    socket.on(socketEvents.GENERATE_NETWORK_STARTED, () => {
      loading.value = true;
      emitter.emit(ToastTypes.WARNING, 'Network creation started...');
    });
    socket.on(socketEvents.GENERATE_NETWORK_OK, () => {
      loading.value = false;
      emitter.emit(ToastTypes.SUCCESS, 'Network created');
    });
    socket.on(socketEvents.GENERATE_NETWORK_ERROR, () => {
      loading.value = false;
      emitter.emit(ToastTypes.ERROR, 'Network creation failed');
    });

    // Setup page
    if (userDataStore.statusObj?.creatingNetwork.started) {
      // enables loading state to wait for bootstrap result
      loading.value = true;
      emitter.emit(ToastTypes.WARNING, 'Network creation in progress...');
    }
  });
</script>

<template>
  <h1>Creating networks</h1>
  <v-row dense>
    <v-col cols="12">
      <LacenCard
        title="Generate network"
        :iconNumber="1"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              @click="generateNetwork"
              :loading="loading"
              size="x-large"
              color="primary"
              icon="mdi-graph-outline"
              text="Generate network"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
  </v-row>
</template>
