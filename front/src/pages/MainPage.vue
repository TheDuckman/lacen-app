<script setup lang="ts">
  import requester from '@/api/requester';
  import useEmitter from '@/composables/useEmitter';
  import TheConfirmDialog from '@/components/TheConfirmDialog.vue';
  import { HTTP_STATUS_FOLDER_FOUND } from '@/constants/constants';
  import { useUserDataStore } from '@/stores/userData';
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useConfirmDialog from '@/composables/useConfirmDialog';

  const {
    cancelHandler,
    confirmHandler,
    dialogText,
    dialogTitle,
    dialogVisible,
    triggerDialog,
  } = useConfirmDialog();

  const userDataStore = useUserDataStore();
  const emitter = useEmitter();
  const router = useRouter();

  // Identifier
  const identifier = ref();

  // Submit btn
  const isDisabled = computed(() => {
    return !identifier.value || identifier.value.length < 3;
  });

  const beginLacen = async () => {
    let successMsg = 'New workspace created';
    if (!isDisabled.value) {
      userDataStore.setIdentifier(identifier.value);

      try {
        // Check if identifier already exists
        const res = await requester.checkIdentifier();

        // If it's NOT a new identifier
        if (res.status == HTTP_STATUS_FOLDER_FOUND) {
          const promptResponse = await triggerDialog({
            title: 'Identifier already in use!',
            text: [
              'The identifier you chose is already in use.',
              'If this is your identifier from a previous session you can resume your work.',
              'Do you wish to resume your previous work session?',
            ],
          });
          if (promptResponse) {
            successMsg = 'Previous work session restored';
          } else {
            emitter.emit(
              'toastWarning',
              'Select a different identifier to continue',
            );
            return;
          }
        }

        emitter.emit('toastSuccess', successMsg);
        router.push({
          name: 'DataInput',
        });
      } catch (error) {
        console.error(error);
        emitter.emit('toastError', 'Error trying to set identifier');
      }
    }
  };
</script>

<template>
  <TheConfirmDialog
    :isVisible="dialogVisible"
    :text="dialogText"
    :title="dialogTitle"
    :cancelHandler="cancelHandler"
    :confirmHandler="confirmHandler"
  />
  <v-row>
    <v-col
      cols="8"
      class="offset-2"
    >
      <v-card
        class="mt-8"
        variant="flat"
        style="opacity: 0.9; border: 1px gray solid"
      >
        <v-card-title class="text-center">
          <h1>Welcome to LACEN</h1>
          <h3>Long non-coding Annotation by Co-Expression Networks</h3>
        </v-card-title>
        <v-card-text class="text-body-1">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </v-card-text>
        <v-card-text>
          <p>
            Enter a string identifier. This will be used as the prefix for your
            files
          </p>
          <v-text-field
            v-model="identifier"
            @keydown.enter="beginLacen"
            variant="outlined"
            label="My identifier"
          />
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <LacenBtn
            :disabled="isDisabled"
            color="success"
            size="large"
            text="Let's begin!"
            @click="beginLacen"
          />
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
