<script setup lang="ts">
  import { useUserDataStore } from '@/stores/userData';
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  const userDataStore = useUserDataStore();

  // Identifier
  const identifier = ref();

  const isDisabled = computed(() => {
    return !identifier.value || identifier.value.length < 3;
  });

  const beginLacen = async () => {
    if (!isDisabled.value) {
      userDataStore.setIdentifier(identifier.value);
      router.push({
        name: 'DataInput',
      });
      // TODO: handle duplicate identifier
    }
  };
</script>

<template>
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
