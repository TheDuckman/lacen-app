<script lang="ts" setup>
  defineProps({
    imgUrl: {
      type: String,
      default: null,
    },
    noOutline: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  });
</script>

<template>
  <LacenCard :title="title">
    <v-card-text>
      <v-img
        :src="imgUrl"
        contain
      >
        <div v-if="!imgUrl">
          <div
            class="d-flex justify-center align-center"
            style="width: 100%; height: 50vh; border: 2pt dashed #ccc"
          >
            <v-icon
              size="40"
              color="grey"
              icon="mdi-image"
            />
          </div>
        </div>
      </v-img>
    </v-card-text>
  </LacenCard>
</template>
