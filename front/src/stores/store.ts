/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserStatusObj } from '@/interface/userStatus.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStore = defineStore('store', () => {
  // Identifier
  const identifier = ref<string>('');
  const setIdentifier = (newVal: string) => {
    identifier.value = newVal;
  };

  // Status
  const statusObj = ref<UserStatusObj>();
  const clearStatusObj = () => {
    statusObj.value = undefined;
  };
  const updateStatusObj = (
    newStatusObjStr: string | UserStatusObj,
    isJson = false,
  ) => {
    if (isJson) {
      statusObj.value = newStatusObjStr as UserStatusObj;
    } else {
      statusObj.value = JSON.parse(newStatusObjStr as string);
    }
  };

  // Variables
  const variables = ref<any>([]);
  const updateVars = (vars: any[]) => {
    variables.value = vars;
  };
  const clearVars = () => {
    variables.value = [];
  };

  return {
    identifier,
    statusObj,
    variables,
    updateVars,
    clearVars,
    setIdentifier,
    clearStatusObj,
    updateStatusObj,
  };
});
