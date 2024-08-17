<script setup lang="ts">
  defineProps({
    block: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
  });
</script>

<template>
  <v-btn
    :color="color"
    :block="block"
    variant="flat"
  >
    <v-icon
      v-if="icon.length > 0"
      :icon="icon"
      :class="text.length > 0 ? 'mr-2' : ''"
    />
    <span v-if="text.length > 0">
      {{ text }}
    </span>
  </v-btn>
</template>
