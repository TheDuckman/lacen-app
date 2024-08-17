<script setup lang="ts"></script>

<template>
  <h1>Data input</h1>
  <LacenCard
    title="Select data files"
    :iconNumber="1"
  >
    <v-card-text>
      <v-file-input
        label="Count data file"
        prepend-icon="mdi-numeric"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
      <v-file-input
        label="Expression data file"
        prepend-icon="mdi-dna"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
      <v-file-input
        label="Label data file"
        prepend-icon="mdi-tag"
        chips
        density="comfortable"
        variant="outlined"
      ></v-file-input>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <LacenBtn
        color="success"
        icon="mdi-upload"
        text="Submit files"
      />
    </v-card-actions>
  </LacenCard>
  <LacenCard
    title="Load annotation data"
    :iconNumber="2"
  >
    <v-card-text>
      <div class="d-flex align-baseline">
        <v-file-input
          label="Gene annotation file"
          prepend-icon="mdi-upload"
          chips
          density="comfortable"
          variant="outlined"
        />
        <LacenBtn
          color="success"
          icon="mdi-upload"
          class="ml-4"
        />
      </div>
      <div class="d-flex align-baseline">
        <v-file-input
          label="Non-coding gene annotation file"
          prepend-icon="mdi-upload"
          chips
          density="comfortable"
          variant="outlined"
        />
        <LacenBtn
          color="success"
          icon="mdi-upload"
          class="ml-4"
        />
      </div>
    </v-card-text>
  </LacenCard>
</template>
