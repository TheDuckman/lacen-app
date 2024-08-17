export interface StepData {
  title: string;
  pageName: string;
  current: boolean;
  done: boolean;
  skipped?: boolean;
}

export interface StepsStatus {
  dataInput: StepData;
  removingOutliers: StepData;
  pickingThreshold: StepData;
  bootstraping: StepData;
  creatingNetworks: StepData;
  networkModules: StepData;
  enrichedModules: StepData;
  heatmap: StepData;
}
