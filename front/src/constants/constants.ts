export const variablesNames = {
  COUNT: 'datCounts',
  RAW_EXPRESSION: 'datExpression',
  LABEL: 'datTraits',
  FILTERED_EXPRESSION: 'datExpr',
  DENDROGRAM_IMG: 'dendrogramImg',
  HEIGHT: 'height',
  KEEP_SAMPLES: 'keepSamples',
  THRESHOLD_IMG: 'thresholdPlotImg',
  BOOTSTRAP_MODGROUPS: 'modGroups',
  BOOTSTRAP_STABILITY: 'bootstrapStability',
  INDICEPOWER: 'indicePower',
  ENRICHEDGRAPH_IMG: 'enrichedGraphImg',
  STACKEDBARPLOT_IMG: 'stackedBarPlotImg',
};
export const stepNumbers = {
  dataInput: 1,
  removingOutliers: 2,
  pickingThreshold: 3,
  bootstraping: 4,
  creatingNetworks: 5,
  networkModules: 6,
  enrichedModules: 7,
  heatmap: 8,
};

export const formRules = {
  isNumber: [
    (v: string): boolean | string =>
      !v || !isNaN(Number(v)) || 'Please enter a valid number',
  ],
};

export const socketEvents = {
  CONNECT: 'connect',
};

export const HTTP_STATUS_FOLDER_FOUND = 227;
