<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useStore } from '@/stores/store';
  // import { HTTP_STATUS_FOLDER_FOUND } from '@/constants/constants';
  // import useEmitter from '@/composables/useEmitter';

  import TheNavBar from '@/components/TheNavBar.vue';
  import TheNetworkAnimation from '@/components/TheNetworkAnimation.vue';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
  import LacenStepper from '@/components/LacenStepper.vue';

  // Emitter
  // const emitter = useEmitter();

  // Identifier
  const identifier = ref();

  // Initial stuff
  const isBeginDisabled = computed(() => {
    return !identifier.value || identifier.value.length < 3;
  });
  const store = useStore();
  const begin = ref(false);
  const beginLacen = async () => {
    if (!isBeginDisabled.value) {
      store.setIdentifier(identifier.value);
      // TODO: handle duplicate identifier
      begin.value = true;
    }
  };
</script>

<template>
  <v-app>
    <TheConfirmDialog />
    <v-main :style="begin ? 'padding-bottom: 60px' : ''">
      <TheNavBar />
      <TheNetworkAnimation v-if="!begin">
        <template #default>
          <h5 class="text-h3">Welcome to LACEN</h5>
          <h3 class="grey--text text--darken-1">
            Long non-coding Annotation by Co-Expression Networks
          </h3>
          <v-card
            class="mt-5"
            outlined
            style="opacity: 0.9"
          >
            <v-card-text class="body-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
              <v-card-text>
                Enter a string identifier. This will be used as the prefix for
                your files
                <v-text-field
                  v-model="identifier"
                  @keydown.enter="beginLacen"
                  outlined
                  dense
                  label="My identifier"
                />
              </v-card-text>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn
                color="success"
                @click="beginLacen"
                :disabled="isBeginDisabled"
              >
                Let's begin!
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </TheNetworkAnimation>
      <LacenStepper v-else />
    </v-main>
  </v-app>
</template>
