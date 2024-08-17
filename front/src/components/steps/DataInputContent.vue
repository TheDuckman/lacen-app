<script setup lang="ts">
  import { stepNumbers } from '@/constants/constants';
</script>

<template>
  <v-stepper-window-item :value="stepNumbers.dataInput">
    <v-row>
      <v-col cols="6">
        <v-card variant="flat">
          <v-card-title> I) Select data files </v-card-title>
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
            <v-btn
              color="success"
              variant="elevated"
            >
              <v-icon
                icon="mdi-upload"
                class="mr-2"
              />
              Submit files
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card variant="flat">
          <v-card-title> II) Load annotation data </v-card-title>
          <v-card-text>
            <div class="d-flex align-baseline">
              <v-file-input
                label="Gene annotation file"
                prepend-icon="mdi-upload"
                chips
                density="comfortable"
                variant="outlined"
              />
              <v-btn
                color="success"
                class="ml-4"
              >
                <v-icon icon="mdi-upload" />
              </v-btn>
            </div>
            <div class="d-flex align-baseline">
              <v-file-input
                label="Non-coding gene annotation file"
                prepend-icon="mdi-upload"
                chips
                density="comfortable"
                variant="outlined"
              />
              <v-btn
                color="success"
                class="ml-4"
              >
                <v-icon icon="mdi-upload" />
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-stepper-window-item>
</template>

<style scoped></style>
