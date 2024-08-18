import axios from 'axios';
import qs from 'querystring';
import { useUserDataStore } from '@/stores/userData';
import { HeatmapImgObj } from '@/interface/api.interface';

// backend base URL
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

// Injects identifier into every request
axios.defaults.params = {};
axios.interceptors.request.use((config) => {
  const userDataStore = useUserDataStore();
  config.params['identifier'] = userDataStore.identifier;
  return config;
});

// query string serializer
axios.defaults.paramsSerializer = (params) => qs.stringify(params);

const checkIdentifier = async (): Promise<any> => {
  const res = await axios.get<string>('checkIdentifier');
  return {
    status: res.status,
    data: res.data,
  };
};

const archiveRdata = async (identifier: string): Promise<any> => {
  const res = await axios.put<string>('archiveRdata', {
    identifier,
  });
  return res.data;
};

const sendCommand = async (command: string): Promise<unknown> => {
  const res = await axios.post('runCommand', { command });
  return res.data;
};

const getVariables = async (): Promise<string> => {
  const res = await axios.get<string>('getVariables');
  return res.data;
};

const getImgPath = async (imgName: string): Promise<unknown> => {
  const res = await axios.post('getImgPath', { imgName });
  return res.data;
};

const setParameters = async (
  maxBlockSize: number,
  numCores: number,
): Promise<unknown> => {
  const res = await axios.post('setParameters', { maxBlockSize, numCores });
  return res.data;
};

// const test = async (): Promise<string> => {
//   const res = await axios.get<string>('test');
//   return res.data;
// };

// const loadFile = async (): Promise<string> => {
//   const res = await axios.get<string>('loadFile');
//   return res.data;
// };

const uploadDataFiles = async (formData: FormData): Promise<string> => {
  const res = await axios.post<string>('uploadDataFiles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

const uploadAnnotationFile = async (formData: FormData): Promise<string> => {
  const res = await axios.post<string>('uploadAnnotationFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

const loadAnnotation = async (annotationType: string): Promise<void> => {
  const res = await axios.post('loadAnnotation', { annotationType });
  return res.data;
};

const instantiateLacenAndCheck = async (): Promise<void> => {
  const res = await axios.get('instantiateLacenAndCheck');
  return res.data;
};

// const saveFile = async (): Promise<void> => {
//   const res = await axios.post('saveFile', {});
//   return res.data;
// };

const filterTransform = async (): Promise<void> => {
  const res = await axios.get('filterTransform');
  return res.data;
};

const selectOutlierSample = async (height: string | null): Promise<void> => {
  const res = await axios.post('selectOutlierSample', { height });
  return res.data;
};

const acceptHeight = async (height: string | null): Promise<void> => {
  const res = await axios.post('acceptHeight', { height });
  return res.data;
};

const generateThresholdPlot = async (): Promise<string> => {
  const res = await axios.get('generateThresholdPlot');
  return res.data;
};

const setIndicePower = async (power: number): Promise<unknown> => {
  const res = await axios.post('setIndicePower', { power });
  return res.data;
};

const runBootstrap = async (): Promise<unknown> => {
  const res = await axios.get('runBootstrap');
  return res.data;
};

const skipBootstrap = async (): Promise<unknown> => {
  const res = await axios.get('skipBootstrap');
  return res.data;
};

const generateNetwork = async (): Promise<unknown> => {
  const res = await axios.get('generateNetwork');
  return res.data;
};

const generateStackedBarplot = async (): Promise<unknown> => {
  const res = await axios.get('generateStackedBarplot');
  return res.data;
};

const generateHeatmap = async (
  moduleNum: number,
  submoduleNum: number,
): Promise<unknown> => {
  const res = await axios.post('generateHeatmap', { moduleNum, submoduleNum });
  return res.data;
};

const getHeatmapImgs = async (): Promise<HeatmapImgObj[]> => {
  const res = await axios.get('getHeatmapImgs');
  return res.data;
};

export default {
  checkIdentifier,
  archiveRdata,
  getImgPath,
  // test,
  // saveFile,
  // loadFile,
  getVariables,
  setParameters,
  uploadDataFiles,
  uploadAnnotationFile,
  sendCommand,
  loadAnnotation,
  instantiateLacenAndCheck,
  filterTransform,
  selectOutlierSample,
  acceptHeight,
  generateThresholdPlot,
  setIndicePower,
  runBootstrap,
  skipBootstrap,
  generateNetwork,
  generateStackedBarplot,
  generateHeatmap,
  getHeatmapImgs,
};
