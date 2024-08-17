/* eslint-disable no-console */
import fs from "fs";
import { spawn } from "child_process";
import io from "../server";
import { LacenEventsEnum, defaultFolders, userFilename } from "./constants";
import { EventMessageObject, PathsFilesCommandsDto, StatusObj } from "./types";

const { SAVED_FILES_PATH } = process.env;
const RED = "\x1b[0;31m";
const BLUE = "\x1b[0;34m";
const ORANGE = "\x1b[0;33m";
const NC = "\x1b[0m";

export function emitEvent(eventOjb: EventMessageObject): void {
  // Type { identifier: string, msg: any } expected
  io.emit(eventOjb.event, {
    identifier: eventOjb.identifier,
    msg: eventOjb.msg,
  });
}

export function getNowStr(): string {
  const yourDate = new Date();
  return `[${yourDate.toISOString()}] `;
}

export function cleanRString(rString: string): string {
  return rString
    .replaceAll(/\[\d+\]/g, "")
    .replaceAll('"', "")
    .trim();
}

export function pathsFilesCommands(identifier: string): PathsFilesCommandsDto {
  const identifierFolder = `${SAVED_FILES_PATH}/${identifier}`;
  const rdataFilepath = `${identifierFolder}/${defaultFolders.RDATA_FOLDER}/${userFilename.RDATA}`;

  const stringsObj: PathsFilesCommandsDto = {
    cmd: {
      lacen: "suppressPackageStartupMessages(library('lacen'));",
      save: `\\nsave.image('${rdataFilepath}');`,
      load: `if (file.exists('${rdataFilepath}')) {\\nload('${rdataFilepath}');\\n}\\n`,
    },
    path: {
      frontendImg: `${identifier}/${defaultFolders.IMGS_FOLDER}`,
      frontendHeatmaps: `${identifier}/${defaultFolders.IMGS_FOLDER}/${defaultFolders.HEATMAP_IMG_FOLDER}`,
      main: identifierFolder,
      data: `${identifierFolder}/${defaultFolders.RDATA_FOLDER}`,
      imgs: `${identifierFolder}/${defaultFolders.IMGS_FOLDER}`,
      heatmapImgs: `${identifierFolder}/${defaultFolders.IMGS_FOLDER}/${defaultFolders.HEATMAP_IMG_FOLDER}`,
      logs: `${identifierFolder}/${defaultFolders.LOGS_FOLDER}`,
      uploads: `${identifierFolder}/${defaultFolders.UPLOADS_FOLDER}`,
    },
    filename: {
      log: userFilename.LOG,
      rdata: userFilename.RDATA,
      status: userFilename.STATUS,
      dendrogramSuffix: userFilename.DENDROGRAM_FILENAME_SUFFIX,
      thresholdImg: userFilename.THRESHOLD_FILENAME,
      modGroupImg: userFilename.BOOTSTRAP_MODGROUPS_FILENAME,
      stabilityRatioImg: userFilename.BOOTSTRAP_STABILITYRATIO_FILENAME,
      enrichedGraphImg: userFilename.ENRICHED_GRAPH,
      stackedBarPlotImg: userFilename.STACKEDBARPLOT,
      bootstrapCsv: userFilename.BOOTSTRAP_CSV,
    },
  };

  return stringsObj;
}

export function createUserFolders(identifier: string): void {
  const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

  // Main folder
  if (!fs.existsSync(strObj.path.main)) {
    fs.mkdirSync(strObj.path.main, { mode: "777" });
    // Create status object file
    fs.writeFileSync(`${strObj.path.main}/${strObj.filename.status}`, "");
    // Write first status obj to file
    const baseStatusObj: StatusObj = getBaseStatusObj();
    saveStatusObj(identifier, baseStatusObj);
  }

  // Imgs
  if (!fs.existsSync(strObj.path.imgs)) {
    fs.mkdirSync(strObj.path.imgs);
    fs.mkdirSync(strObj.path.heatmapImgs);
  }
  // Logs
  if (!fs.existsSync(strObj.path.logs)) {
    fs.mkdirSync(strObj.path.logs);
    fs.writeFileSync(`${strObj.path.logs}/${strObj.filename.log}`, "");
  }
  // RData
  if (!fs.existsSync(strObj.path.data)) {
    fs.mkdirSync(strObj.path.data);
  }
  // Uploads
  if (!fs.existsSync(strObj.path.uploads)) {
    fs.mkdirSync(strObj.path.uploads);
  }
}

export function appendToLog(identifier: string, txt: string): void {
  const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
  const logfilePath = `${strObj.path.logs}/${strObj.filename.log}`;
  const nowStr = getNowStr();

  if (!fs.existsSync(logfilePath)) {
    fs.writeFileSync(logfilePath, "");
  }
  fs.appendFileSync(
    logfilePath,
    `${nowStr} ${txt}${txt.length === 0 ? "\n" : ""}`,
  );
}

async function runSpawn(
  identifier: string,
  command: string,
  args: string[] = [],
) {
  const process = spawn(command, args);
  let firstStdOut = true;
  let firstStdErr = true;

  // read stdout
  const stdoutArray = [];
  process.stdout.on("data", (data) => {
    stdoutArray.push(data);
    if (firstStdOut) {
      console.log(
        `${BLUE}[EXEC_OUT]${NC}: ${stdoutArray.join("")}${BLUE}[.]${NC}`,
      );
      firstStdOut = false;
    } else {
      console.log(stdoutArray.join(""));
    }
    appendToLog(identifier, stdoutArray.join(""));
    // send output to frontend
    emitEvent({
      event: LacenEventsEnum.TERMINAL_STDOUT,
      identifier,
      msg: stdoutArray.join(""),
    });
  });
  // read stderr
  const stderrArray = [];
  process.stderr.on("data", (data) => {
    stderrArray.push(data);
    const len = stderrArray.length;
    const firstErrLen = stderrArray[0].length;
    if (len > 0 && firstErrLen === 1) {
      return;
    }
    if (firstStdErr) {
      console.log(
        `${RED}[EXEC_ERR]${NC}: ${stderrArray.join("")}${RED}[.]${NC}`,
      );
      firstStdErr = false;
    } else {
      console.log(`${RED}[...]${NC} ${stderrArray.join("")}${RED}[.]${NC}`);
    }
    appendToLog(identifier, stderrArray.join(""));
    // send output to frontend
    emitEvent({
      event: LacenEventsEnum.TERMINAL_STDERR,
      identifier,
      msg: stderrArray.join(""),
    });
  });
  return new Promise((resolve, reject) => {
    process.addListener("error", reject);
    process.addListener("close", (code) => {
      if (code === 0) {
        const str = stdoutArray.join("");
        if (str.length > 0) {
          console.log(`${ORANGE}[EXIT]${NC}: ${str}${ORANGE}[.]${NC}`);
        }
        return resolve(stdoutArray.join(""));
      }
      appendToLog(identifier, `[EXEC_REJECT] ${stderrArray.join("")}`);
      return reject(
        new Error(`Error code: ${code}\nMsg: ${stderrArray.join("")}`),
      );
    });
  });
}

export async function runProcessSpawn(
  identifier: string,
  command: string,
  args: string[] = [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return runSpawn(identifier, command, args);
}

export function getBaseStatusObj(): StatusObj {
  return {
    settings: {
      maxBlockSize: Number(process.env.INIT_MAXBLOCKSIZE),
      numCores: Number(process.env.INIT_NUM_CORES),
    },
    dataInput: {
      countFile: false,
      expressionFile: false,
      labelFile: false,
      geneFile: false,
      lncrnaFile: false,
    },
    instantiateAndCheck: false,
    removingOutliers: {
      filterTransform: false,
      firstDendrogram: false,
      height: null,
      valueAccepted: false,
    },
    pickingThreshold: {
      plotGenerated: false,
      indice: null,
    },
    bootstraping: {
      skipped: false,
      done: false,
    },
    creatingNetwork: {
      done: false,
    },
    networkModules: {
      barplotGenerated: false,
    },
    enrichedModules: {
      done: false,
    },
    heatmap: {
      done: false,
    },
  };
}

export function getStatusObj(identifier: string) {
  const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
  const fileContent = fs.readFileSync(
    `${strObj.path.main}/${strObj.filename.status}`,
  );
  const statusObj: StatusObj = JSON.parse(fileContent.toString());
  return statusObj;
}

export function saveStatusObj(identifier: string, statusObj: StatusObj) {
  const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
  const jsonContent = JSON.stringify(statusObj);
  fs.writeFileSync(
    `${strObj.path.main}/${strObj.filename.status}`,
    jsonContent,
  );
  io.emit(LacenEventsEnum.UPDATE_STATUS_OBJ, jsonContent);
}

export function getHeatmapImgName(moduleNum: number, submoduleNum: number) {
  return `heatmap_${moduleNum}_${submoduleNum}.png`;
}
