<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { useUserDataStore } from '@/stores/userData';
  import { computed, onBeforeMount, ref } from 'vue';

  const userDataStore = useUserDataStore();

  // Emitter
  const emitter = useEmitter();

  // Loading
  const loading = ref(false);

  // Filter and transform
  const filterTransform = async () => {
    loading.value = true;
    try {
      await requester.filterTransform();
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };

  // Cut outlier
  const height = ref(0);
  const selectOutlierSample = async () => {
    // if (!this.heightForm.validate()) {
    //   return;
    // }
    loading.value = true;
    try {
      dendrogramImg.value = null;
      dendrogramImg.value = await requester.selectOutlierSample(
        `${height.value}`,
      );
      // this.$emit('height-updated', Number(this.height));
      // this.lastSelectedHeight = this.height;
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };
  const acceptHeightValue = async () => {
    loading.value = true;
    try {
      await requester.acceptHeight(`${userDataStore.currentHeight}`);
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };

  // Dendrogram
  const dendrogramImg = ref();
  const imgUrl = computed(() => {
    if (!dendrogramImg.value) {
      return null;
    }
    return `${import.meta.env.VITE_STATIC_URL}${dendrogramImg.value}`;
  });

  onBeforeMount(async () => {
    loading.value = true;
    // get previous value from store
    height.value = userDataStore.currentHeight || 0;
    // run instantiation if it's the user's first time here
    if (
      userDataStore.isDataInputDone &&
      !userDataStore.statusObj?.instantiateAndCheck
    ) {
      try {
        await requester.instantiateLacenAndCheck();
      } catch (error) {
        useEmitter().emit(ToastTypes.ERROR, 'Oops...');
      }
    }
    loading.value = false;
  });
</script>

<template>
  <h1>Removing outliers</h1>
  <v-row>
    <v-col cols="4">
      <!-- FILTER TRANSFORM -->
      <LacenCard
        title="Filter and transform data"
        :iconNumber="1"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              @click="filterTransform"
              :loading="loading"
              block
              color="info"
              icon="mdi-filter"
              text="Filter and transform"
              class="mb-4"
            />
            <LacenBtn
              @click="selectOutlierSample"
              :disabled="!userDataStore.isFilterAndTransformDone"
              :loading="loading"
              block
              color="info"
              icon="mdi-family-tree"
              text="Generate dendrogram"
            />
          </div>
        </v-card-text>
      </LacenCard>
      <!-- REMOVE OUTLIERS -->
      <LacenCard
        title="Remove sample outliers"
        :iconNumber="2"
      >
        <v-card-text>
          <div class="d-flex flex-column my-5 ml-5">
            <v-number-input
              v-model="height"
              :min="0"
              hide-details
              label="Height"
              variant="outlined"
              type="number"
              width="100%"
              density="comfortable"
            />
            <p class="mb-6">
              <span class="font-weight-bold text-primary">
                Current value:
              </span>
              {{ userDataStore.currentHeight }}
            </p>

            <LacenBtn
              @click="selectOutlierSample"
              :loading="loading"
              :disabled="!imgUrl"
              block
              color="info"
              icon="mdi-family-tree"
              text="Re-generate dendrogram"
              class="mb-4"
            />
            <LacenBtn
              @click="acceptHeightValue"
              :loading="loading"
              :disabled="userDataStore.currentHeight !== height"
              block
              color="success"
              icon="mdi-check"
              text="Accept value"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="8">
      <!-- IMAGE -->
      <ImageCard
        title="Dendrogram"
        :imgUrl="imgUrl"
      />
    </v-col>
  </v-row>
</template>
