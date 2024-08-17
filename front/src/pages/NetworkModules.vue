<script setup lang="ts">
  import ImageCard from '@/components/ImageCard.vue';
</script>

<template>
  <h1>Network modules</h1>
  <v-row dense>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Stacked bar plot"
        :imgUrl="undefined"
      >
        <template #bottom>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              color="success"
              icon="mdi-chart-bar"
              text="Generate Bar Plot"
            />
          </div>
        </template>
      </ImageCard>
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Network modules"
        :imgUrl="undefined"
      />
    </v-col>
  </v-row>
</template>
