import { SuccessErrorEnum } from "./constants";

export interface SaveLoadCmdDto {
  lacen: string;
  save: string;
  load: string;
}

export interface PathsDto {
  frontendImg: string;
  frontendHeatmaps: string;
  main: string;
  data: string;
  imgs: string;
  heatmapImgs: string;
  logs: string;
  uploads: string;
}

export interface FilesDto {
  log: string;
  rdata: string;
  status: string;
  dendrogramSuffix: string;
  thresholdImg: string;
  modGroupImg: string;
  stabilityRatioImg: string;
  enrichedGraphImg: string;
  stackedBarPlotImg: string;
  bootstrapCsv: string;
}

export interface PathsFilesCommandsDto {
  path: PathsDto;
  cmd: SaveLoadCmdDto;
  filename: FilesDto;
}

export interface RunProcessResultDto {
  status: SuccessErrorEnum;
  msg: string;
}

export interface EventMessageObject {
  event: string;
  identifier: string;
  msg: unknown;
}

export interface StatusObj {
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
    skipped: boolean;
    done: boolean;
  };
  creatingNetwork: {
    done: boolean;
  };
  networkModules: {
    barplotGenerated: boolean;
  };
  enrichedModules: {
    done: boolean;
  };
  heatmap: {
    done: boolean;
  };
}
