<script setup lang="ts"></script>

<template>
  <h1>Creating networks</h1>
  <v-row dense>
    <v-col cols="12">
      <!-- BOOTSTRAPING -->
      <LacenCard
        title="Generate network"
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
