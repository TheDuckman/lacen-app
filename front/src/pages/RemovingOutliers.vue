<script setup lang="ts">
  import ImageCard from '@/components/ImageCard.vue';
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
              block
              color="info"
              icon="mdi-filter"
              text="Filter and transform"
              class="mb-4"
            />
            <LacenBtn
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
          <div class="d-flex flex-column align-center my-5 ml-5">
            <v-text-field
              label="Height"
              variant="outlined"
              density="comfortable"
              width="100%"
            />
            <LacenBtn
              block
              color="info"
              icon="mdi-family-tree"
              text="Re-generate dendrogram"
              class="mb-4"
            />
            <LacenBtn
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
        :imgUrl="undefined"
      />
    </v-col>
  </v-row>
</template>
