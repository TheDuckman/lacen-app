<script setup lang="ts"></script>

<template>
  <h1>Picking threshold</h1>
  <v-row>
    <v-col cols="4">
      <!-- FILTER TRANSFORM -->
      <LacenCard
        title="Threshold plot"
        :iconNumber="1"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              block
              color="info"
              icon="mdi-chart-bell-curve-cumulative"
              text="Generate threshold plot"
            />
          </div>
        </v-card-text>
      </LacenCard>
      <!-- REMOVE OUTLIERS -->
      <LacenCard
        title="Indice power"
        :iconNumber="2"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <v-text-field
              label="Indice power"
              variant="outlined"
              density="comfortable"
              width="100%"
            />
            <LacenBtn
              block
              color="success"
              icon="mdi-check"
              text="Set indice power"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
    <v-col cols="8">
      <!-- IMAGE -->
      <ImageCard
        title="???"
        :imgUrl="undefined"
      />
    </v-col>
  </v-row>
</template>
