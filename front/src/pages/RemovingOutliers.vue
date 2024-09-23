<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import { ToastTypes } from '@/constants/ui.constants';
  import { useUserDataStore } from '@/stores/userData';
  import { computed, onBeforeMount, ref } from 'vue';
  import { cleanRString, getImgUrl } from '@/utils/functions.utils';
  import { variablesNames } from '@/constants/constants';

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
  const disableFilterTransform = computed(
    () => userDataStore.isFilterAndTransformDone,
  );

  // Cut outlier
  const height = ref('');
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
      emitter.emit(ToastTypes.SUCCESS, 'Value accepted');
    } catch (error) {
      emitter.emit(ToastTypes.ERROR, 'Ops...');
    } finally {
      loading.value = false;
    }
  };
  const disableAcceptBtn = computed(
    () =>
      `${height.value}` !== `${userDataStore.currentHeight}` ||
      userDataStore.isRemovingOutliersDone,
  );

  // Dendrogram
  const dendrogramImg = ref<string | null>(null);
  const disableGenerateBtn = computed(
    () =>
      !userDataStore.isFilterAndTransformDone || getImgUrl(dendrogramImg.value),
  );
  const disableRegenerateBtn = computed(
    () => `${height.value}` === `${userDataStore.currentHeight}`,
  );

  onBeforeMount(async () => {
    loading.value = true;
    // get previous value from store
    height.value = `${userDataStore.currentHeight}` || '';
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
    // If img exists, get it
    if (userDataStore.statusObj?.removingOutliers.firstDendrogram) {
      loading.value = true;
      const imgStr = await requester.getImgPath(variablesNames.DENDROGRAM_IMG);
      loading.value = false;
      dendrogramImg.value = cleanRString(imgStr as string);
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
              :disabled="disableFilterTransform"
              block
              color="info"
              icon="mdi-filter"
              text="Filter and transform"
              class="mb-4"
            />
            <LacenBtn
              @click="selectOutlierSample"
              :disabled="disableGenerateBtn"
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
            <v-text-field
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
              :disabled="disableRegenerateBtn"
              block
              color="info"
              icon="mdi-family-tree"
              text="Re-generate dendrogram"
              class="mb-4"
            />
            <LacenBtn
              @click="acceptHeightValue"
              :loading="loading"
              :disabled="disableAcceptBtn"
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
        :imgUrl="getImgUrl(dendrogramImg)"
      />
    </v-col>
  </v-row>
</template>
