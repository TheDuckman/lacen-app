<script setup lang="ts">
  import ImageCard from '@/components/ImageCard.vue';
</script>

<template>
  <h1>Bootstraping</h1>
  <v-row dense>
    <v-col cols="12">
      <!-- BOOTSTRAPING -->
      <LacenCard
        title="Bootstraping"
        :iconNumber="1"
      >
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="d-flex flex-column align-center my-5 ml-5">
                <LacenBtn
                  block
                  color="info"
                  icon="mdi-shoe-print"
                  text="Run bootstrap"
                />
              </div>
            </v-col>
            <v-col cols="6">
              <div class="d-flex flex-column align-center my-5 ml-5">
                <LacenBtn
                  block
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
      <!-- IMAGE -->
      <ImageCard
        title="Modgroups"
        :imgUrl="undefined"
      />
    </v-col>
    <v-col cols="6">
      <!-- IMAGE -->
      <ImageCard
        title="Stability"
        :imgUrl="undefined"
      />
    </v-col>
  </v-row>
</template>
