import { ref } from 'vue';

export default function useConfirmDialog() {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const dialogText = ref([]);

  const toggleDialog = () => {
    dialogVisible.value = !dialogVisible.value;
  };

  return {
    dialogVisible,
    dialogTitle,
    dialogText,
    toggleDialog,
  };
}
