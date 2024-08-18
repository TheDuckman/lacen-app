import { ConfirmDialogData } from '@/interface/ui.interface';
import { ref } from 'vue';

export default function useConfirmDialog() {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
  const dialogText = ref<string[]>([]);

  const resolveHandler = ref();
  const rejectHandler = ref();
  const triggerDialog = (dialogData: ConfirmDialogData) => {
    dialogText.value = dialogData.text;
    dialogTitle.value = dialogData.title;
    dialogVisible.value = true;

    return new Promise((resolve, reject) => {
      resolveHandler.value = resolve;
      rejectHandler.value = reject;
    });
  };
  const confirmHandler = () => {
    resolveHandler.value(true);
    dialogVisible.value = false;
  };
  const cancelHandler = () => {
    resolveHandler.value(false);
    dialogVisible.value = false;
  };

  return {
    dialogVisible,
    dialogTitle,
    dialogText,
    triggerDialog,
    // Handlers
    confirmHandler,
    cancelHandler,
  };
}
