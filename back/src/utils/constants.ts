import { join } from "path";

const { SCRIPTS_PATH } = process.env;

export const defaultFilenamePrefixes = {
  COUNT: "CountData",
  EXPRESSION: "ExpressionData",
  LABEL: "LabelData",
  CODING: "CodingAnnotation",
  NONCODING: "NonCodingAnnotation",
};

export const variablesNames = {
  COUNT: "datCounts",
  RAW_EXPRESSION: "datExpression",
  LABEL: "datTraits",
  CODING: "annotationData",
  NONCODING: "ncAnnotation",
  LACEN_OBJ: "lacenObject",
  // probably change/move those
  FILTERED_EXPRESSION: "datExpr",
  DENDROGRAM_IMG: "dendrogramImg",
  HEIGHT: "height",
  KEEP_SAMPLES: "keepSamples",
  THRESHOLD_IMG: "thresholdPlotImg",
  INDICEPOWER: "indicePower",
  TRAITS: "traits",
  BOOTSTRAP_STABILITY: "bootstrapStability",
  BOOTSTRAP_ITERATIONS: "numberOfIterations",
  BOOTSTRAP_RESULT: "bootstrap",
  BOOTSTRAP_MODGROUPS: "modGroups",
  BOOTSTRAP_CUT: "cutBootstrap",
  SUMMARIZED_LIST: "summList",
  ENRICHEDGRAPH_IMG: "enrichedGraphImg",
  STACKEDBARPLOT_IMG: "stackedBarPlotImg",
};

export const userFilename = {
  LOG: "fullLog.log",
  RDATA: "workspaceImage.RData",
  STATUS: "statusObj.json",
  DENDROGRAM_FILENAME_SUFFIX: "clusterTree.png",
  THRESHOLD_FILENAME: "indicePower.png",
  BOOTSTRAP_MODGROUPS_FILENAME: "modgroups.png",
  BOOTSTRAP_STABILITYRATIO_FILENAME: "stabilityratio.png",
  ENRICHED_GRAPH: "enrichedgraph.png",
  STACKEDBARPLOT: "stackedBarPlot.png",
  BOOTSTRAP_CSV: "bootstrap.csv",
};

export const defaultFolders = {
  RDATA_FOLDER: "data",
  IMGS_FOLDER: "imgs",
  HEATMAP_IMG_FOLDER: "heatmaps",
  LOGS_FOLDER: "logs",
  UPLOADS_FOLDER: "uploads",
};

export const rScriptPaths = {
  GET_VARS: join(SCRIPTS_PATH, "00-getVariables.R"),
  FILE_UPLOAD: join(SCRIPTS_PATH, "01-uploadFiles.R"),
  FILE_COUNTS_UPLOAD: join(SCRIPTS_PATH, "01-uploadFiles-datCounts.R"),
};

export const HTTP_STATUS_FOLDER_FOUND = 227;

// eslint-disable-next-line no-shadow
export enum SuccessErrorEnum {
  SUCCESS = "success",
  ERROR = "error",
}

// eslint-disable-next-line no-shadow
export enum LacenEventsEnum {
  UPDATE_STATUS_OBJ = "update-status-obj",
  FILE_OK = "file-ok",
  ANNOTATION_OK = "annotation-ok",
  THRESHOLD_PLOT_OK = "threshold-plot-ok",
  THRESHOLD_PLOT_ERROR = "threshold-plot-error",
  BOOTSTRAP_OK = "bootstrap-ok",
  BOOTSTRAP_ERROR = "bootstrap-error",
  GENERATE_NETWORK_OK = "generate-network-ok",
  GENERATE_NETWORK_ERROR = "generate-network-error",
  TERMINAL_STDOUT = "terminal-stdout",
  TERMINAL_STDERR = "terminal-stderr",
  STACKED_BARPLOT_OK = "stacked-barplot-ok",
  STACKED_BARPLOT_ERROR = "stacked-barplot-error",
  HEATMAP_GENERATED = "heatmap-generated",
  HEATMAP_ERROR = "heatmap-error",
}
