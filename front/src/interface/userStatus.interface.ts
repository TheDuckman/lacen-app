export interface UserStatusObj {
  settings: {
    maxBlockSize: number;
    numCores: number;
  };
  dataInput: {
    countFile: boolean;
    expressionFile: boolean;
    labelFile: boolean;
    geneFile: boolean;
    lncrnaFile: boolean;
  };
  instantiateAndCheck: boolean;
  removingOutliers: {
    filterTransform: boolean;
    firstDendrogram: boolean;
    height: number;
    valueAccepted: boolean;
  };
  pickingThreshold: {
    plotGenerated: boolean;
    indice: number;
  };
  bootstraping: {
    started: boolean;
    skipped: boolean;
    done: boolean;
    cutValue: number;
  };
  creatingNetwork: {
    started: boolean;
    done: boolean;
  };
  networkModules: {
    barplotGenerated: boolean;
  };
  enrichedModules: {
    done: boolean;
  };
  lncrnaNetworkAnalysis: {
    done: boolean;
  };
}
