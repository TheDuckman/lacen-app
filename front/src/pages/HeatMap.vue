<script setup lang="ts"></script>

<template>
  <h1>Heatmap</h1>
  <v-row dense>
    <v-col cols="12">
      <LacenCard
        title="Heatmap"
        :iconNumber="1"
      >
        <v-card-text>
          <div class="d-flex flex-column align-center my-5 ml-5">
            <LacenBtn
              size="x-large"
              color="primary"
              icon="mdi-graph-outline"
              text="Generate network"
            />
          </div>
        </v-card-text>
      </LacenCard>
    </v-col>
  </v-row>
</template>
