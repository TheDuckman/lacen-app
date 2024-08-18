import fs from "fs";
import path from "path";
import HttpStatus from "http-status-codes";
import { Request, Response } from "express";
import { has } from "lodash";
import {
  defaultFilenamePrefixes,
  variablesNames,
  HTTP_STATUS_FOLDER_FOUND,
  rScriptPaths,
  LacenEventsEnum,
} from "../utils/constants";
import {
  cleanRString,
  createUserFolders,
  emitEvent,
  getHeatmapImgName,
  getNowStr,
  getStatusObj,
  pathsFilesCommands,
  runProcessSpawn,
  saveStatusObj,
} from "../utils/functions";
import { PathsFilesCommandsDto, StatusObj } from "../utils/types";

const { SAVED_FILES_PATH } = process.env;

export class Controller {
  /*
    [GET] /checkIdentifier
    Check user folder
  */
  public static async checkIdentifier(
    req: Request,
    res: Response,
  ): Promise<void> {
    // prevent status code 304
    req.headers["if-none-match"] = "no-match-for-this";
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    // Look for folder and subfolders
    try {
      if (fs.existsSync(strObj.path.main)) {
        console.log(`"${identifier}" folder already exists`);
        const statusObj: StatusObj = getStatusObj(identifier);
        const statusObjStr = JSON.stringify(statusObj);
        res.status(HTTP_STATUS_FOLDER_FOUND);
        res.send(statusObjStr);
      } else {
        res.status(HttpStatus.OK);
      }
      // checks for subfolders and create them if !exist
      createUserFolders(identifier);
      res.end();
    } catch (error) {
      console.log(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }

  /*
    [PUT] /archiveRdata
    Archive user folder
  */
  public static async archiveRdata(req: Request, res: Response): Promise<void> {
    const { identifier } = req.body;

    const nowStr = getNowStr();
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const identifierArchivedFolder = `${SAVED_FILES_PATH}/${nowStr}${identifier}`;

    try {
      // rename Rdata file
      if (fs.existsSync(strObj.path.main)) {
        fs.renameSync(strObj.path.main, identifierArchivedFolder);
        // creates new folder for user
        createUserFolders(identifier as string);
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
    res.end();
  }

  /*
    [POST] /runCommand
    Attempts to run a command sent by the user
  */
  public static async runCommand(req: Request, res: Response): Promise<void> {
    const identifier = req.query.identifier as string;
    const command = req.body.command as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      res.send(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }

  /*
    [POST] /getImgPath
    Get partial img path
  */
  public static async getImgPath(req: Request, res: Response): Promise<void> {
    const identifier = req.query.identifier as string;
    const imgName = req.body.imgName as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.load}${imgName}" | Rscript /dev/stdin`,
      ]);
      const partPath = cleanRString(result);
      const filename = partPath.split("/").pop();
      res.send(`${strObj.path.frontendImg}/${filename}`);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }

  /*
    [GET] /getVariables
    Lists the current variables inside the R environment
  */
  public static async getVariables(req: Request, res: Response): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    try {
      const result = await runProcessSpawn(identifier, "Rscript", [
        rScriptPaths.GET_VARS,
        `${strObj.path.data}/${strObj.filename.rdata}`,
      ]);

      res.send(result);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }

  /*
    [POST] /setParameters
    Sets the value of maxBlockSize and numCores parameters
  */
  public static async setParameters(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const maxBlockSize = req.body.maxBlockSize || 0;
    const numCores = req.body.numCores || 1;
    // const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const statusObj: StatusObj = getStatusObj(identifier);

    try {
      // const result = await runProcessSpawn(identifier, 'Rscript', [
      //   rScriptPaths.GET_VARS,
      //   `${strObj.path.data}/${strObj.filename.rdata}`,
      // ]);
      statusObj.settings.maxBlockSize = maxBlockSize;
      statusObj.settings.numCores = numCores;
      saveStatusObj(identifier, statusObj);

      res.end();
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }

  /*
    [POST] /uploadDataFiles
    Receives the base files for the analysis
  */
  public static async uploadDataFiles(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const result = [];
    try {
      // Check for the presence of all 3 files
      if (
        !has(req.files, "count") ||
        !has(req.files, "expression") ||
        !has(req.files, "label")
      ) {
        throw new Error();
      }
    } catch (error) {
      console.error(error, result);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
      return;
    }
    const files = [
      {
        file: (req as any).files.count[0],
        filename: `${defaultFilenamePrefixes.COUNT}${path.extname(
          (req as any).files.count[0].originalname,
        )}`,
        variableName: variablesNames.COUNT,
      },
      {
        file: (req as any).files.expression[0],
        filename: `${defaultFilenamePrefixes.EXPRESSION}${path.extname(
          (req as any).files.expression[0].originalname,
        )}`,
        variableName: variablesNames.RAW_EXPRESSION,
      },
      {
        file: (req as any).files.label[0],
        filename: `${defaultFilenamePrefixes.LABEL}${path.extname(
          (req as any).files.label[0].originalname,
        )}`,
        variableName: variablesNames.LABEL,
      },
    ];

    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    let output;
    for (let index = 0; index < files.length; index += 1) {
      const fileItem = files[index];
      const filePath = `${strObj.path.uploads}/${fileItem.filename}`;
      try {
        // Move the uploaded file to users dir
        fs.copyFileSync(fileItem.file.path, filePath);
        fs.unlinkSync(fileItem.file.path);
      } catch (error) {
        console.error(error);
        res.status(HttpStatus.EXPECTATION_FAILED);
        res.send(error);
      }

      try {
        // Importing
        // eslint-disable-next-line no-await-in-loop
        output = await runProcessSpawn(identifier, "Rscript", [
          index === 0
            ? rScriptPaths.FILE_COUNTS_UPLOAD
            : rScriptPaths.FILE_UPLOAD,
          `${strObj.path.data}/${strObj.filename.rdata}`,
          fileItem.variableName,
          filePath,
        ]);

        emitEvent({
          event: LacenEventsEnum.FILE_OK,
          identifier,
          msg: fileItem.variableName,
        });
      } catch (error) {
        console.error(error);
        res.status(HttpStatus.EXPECTATION_FAILED);
        res.send(error);
      }
    }
    const statusObj: StatusObj = getStatusObj(identifier);
    statusObj.dataInput.countFile = true;
    statusObj.dataInput.labelFile = true;
    statusObj.dataInput.expressionFile = true;
    saveStatusObj(identifier, statusObj);
    res.status(HttpStatus.OK);
    res.send(output);
  }

  /*
    [POST] /uploadAnnotationFile
    Receives annotation file
  */
  public static async uploadAnnotationFile(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { file } = req;
    const { type } = req.body;
    if (!file || !type) {
      res.status(HttpStatus.BAD_REQUEST);
      res.send("Error: missing data");
      return;
    }
    const identifier = req.query.identifier as string;
    const statusObj: StatusObj = getStatusObj(identifier);
    let filename: string;
    let variable: string;
    switch (type) {
      case "coding":
        filename = `${defaultFilenamePrefixes.CODING}${path.extname(
          file.originalname,
        )}`;
        variable = variablesNames.CODING;
        statusObj.dataInput.geneFile = true;
        break;
      case "noncoding":
        filename = `${defaultFilenamePrefixes.NONCODING}${path.extname(
          file.originalname,
        )}`;
        variable = variablesNames.NONCODING;
        statusObj.dataInput.lncrnaFile = true;
        break;
      default:
        filename = null;
        variable = null;
        break;
    }
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const filePath = `${strObj.path.uploads}/${filename}`;
    const command = `${variable} = loadGTF(file = '${filePath}');`;

    try {
      // Move the uploaded file to users dir
      fs.copyFileSync(file.path, filePath);
      fs.unlinkSync(file.path);

      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      saveStatusObj(identifier, statusObj);

      emitEvent({
        event: LacenEventsEnum.ANNOTATION_OK,
        identifier,
        msg: type,
      });
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [POST] /loadAnnotation
    Download annotation file
  */
  public static async loadAnnotation(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { annotationType } = req.body;
    const identifier = req.query.identifier as string;
    const statusObj: StatusObj = getStatusObj(identifier);
    let url: string;
    let variable: string;
    switch (annotationType) {
      case "coding":
        variable = variablesNames.CODING;
        statusObj.dataInput.geneFile = true;
        url =
          "http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_22/gencode.v22.annotation.gtf.gz";
        break;
      case "noncoding":
        variable = variablesNames.NONCODING;
        statusObj.dataInput.lncrnaFile = true;
        url =
          "http://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_22/gencode.v22.long_noncoding_RNAs.gtf.gz";
        break;
      default:
        url = null;
        variable = null;
        break;
    }
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const command = `${variable} = downloadGTF(link = '${url}');`;

    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      saveStatusObj(identifier, statusObj);

      emitEvent({
        event: LacenEventsEnum.ANNOTATION_OK,
        identifier,
        msg: annotationType,
      });
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [GET] /instantiateLacenAndCheck
    Create Lacen object and check values
  */
  public static async instantiateLacenAndCheck(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const command = `${variablesNames.LACEN_OBJ} <- initLacen(datCounts=${variablesNames.COUNT},datExpression=${variablesNames.RAW_EXPRESSION},datTraits=${variablesNames.LABEL},annotationData=${variablesNames.CODING},ncAnnotation=${variablesNames.NONCODING});`;
    const rmCommand = `rm(${variablesNames.COUNT},${variablesNames.RAW_EXPRESSION},${variablesNames.LABEL},${variablesNames.CODING},${variablesNames.NONCODING});`;
    const checkCommand = `checkData(${variablesNames.LACEN_OBJ});`;

    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${rmCommand}${checkCommand}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      const statusObj: StatusObj = getStatusObj(identifier);
      statusObj.instantiateAndCheck = true;
      saveStatusObj(identifier, statusObj);
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [GET] /filterTransform
    Filter and transform data
  */
  public static async filterTransform(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const command = `${variablesNames.LACEN_OBJ} <- filterTransform(lacenObject=${variablesNames.LACEN_OBJ},pThreshold=0.01,fcThreshold=1,topVarGenes=5000,filterMethod='DEG');`;
    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      const statusObj: StatusObj = getStatusObj(identifier);
      statusObj.removingOutliers.filterTransform = true;
      saveStatusObj(identifier, statusObj);
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [POST] /selectOutlierSample
    If no data is received, generate simple dendrogram. Generate dendrogram with height line
  */
  public static async selectOutlierSample(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const height = req.body.height || "FALSE";
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const filename =
      height === "FALSE"
        ? strObj.filename.dendrogramSuffix
        : `${height}${strObj.filename.dendrogramSuffix}`;
    const filepath = `${strObj.path.imgs}/${filename}`;

    const heightCmd = `${variablesNames.LACEN_OBJ}['height']=${height};`;
    const dendrogramImgPathCmd = `${variablesNames.DENDROGRAM_IMG} = '${filepath}';`;
    const keepSamplesCommand = `selectOutlierSample(${variablesNames.LACEN_OBJ},plot=TRUE,filename='${filepath}',height=${height});`;

    const command = `${heightCmd}${dendrogramImgPathCmd}${keepSamplesCommand}`;
    try {
      await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
      return;
    }

    const statusObj: StatusObj = getStatusObj(identifier);
    statusObj.removingOutliers.firstDendrogram = true;
    statusObj.removingOutliers.height = parseInt(req.body.height) || null;
    statusObj.removingOutliers.valueAccepted = false;
    saveStatusObj(identifier, statusObj);
    res.status(HttpStatus.OK);
    res.send(`${strObj.path.frontendImg}/${filename}`);
  }

  /*
    [POST] /acceptHeight
    Generate dendrogram with height line and alter status object 'removingOutliers.valueAccepted'
  */
  public static async acceptHeight(req: Request, res: Response): Promise<void> {
    const identifier = req.query.identifier as string;

    const statusObj: StatusObj = getStatusObj(identifier);
    statusObj.removingOutliers.valueAccepted = true;
    saveStatusObj(identifier, statusObj);
    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [GET] /generateThresholdPlot
  */
  public static async generateThresholdPlot(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    const filepath = `${strObj.path.imgs}/${strObj.filename.thresholdImg}`;
    const statusObj: StatusObj = getStatusObj(identifier);

    const pickThresholdCmd = `plotSoftThreshold(${variablesNames.LACEN_OBJ},filename='${filepath}',maxBlockSize=${statusObj.settings.maxBlockSize},plot = TRUE);`;
    const thresholdPlotImgCmd = `${variablesNames.THRESHOLD_IMG} = '${filepath}';`;
    const command = `${pickThresholdCmd}${thresholdPlotImgCmd}`;
    runProcessSpawn(identifier, "sh", [
      "-c",
      `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
    ])
      .then((resp) => {
        statusObj.pickingThreshold.plotGenerated = true;
        saveStatusObj(identifier, statusObj);
        emitEvent({
          event: LacenEventsEnum.THRESHOLD_PLOT_OK,
          identifier,
          msg: `${strObj.path.frontendImg}/${strObj.filename.thresholdImg}`,
        });
      })
      .catch((err) => {
        emitEvent({
          event: LacenEventsEnum.THRESHOLD_PLOT_ERROR,
          identifier,
          msg: null,
        });
        console.log("Err", err);
      });

    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [POST] /setIndicePower
  */
  public static async setIndicePower(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { power } = req.body;
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const command = `${variablesNames.LACEN_OBJ}['indicePower'] = ${power};`;
    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      const statusObj: StatusObj = getStatusObj(identifier);
      statusObj.pickingThreshold.indice = parseInt(power);
      saveStatusObj(identifier, statusObj);
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [GET] /runBootstrap
    Run bootstrap
  */
  public static async runBootstrap(req: Request, res: Response): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const statusObj: StatusObj = getStatusObj(identifier);

    const modGrpImgPath = `${strObj.path.imgs}/${strObj.filename.modGroupImg}`;
    const stabRtImgPath = `${strObj.path.imgs}/${strObj.filename.stabilityRatioImg}`;

    const modGroupsCmd = `${variablesNames.BOOTSTRAP_MODGROUPS} <- '${modGrpImgPath}';`;
    const bsStabilityCmd = `${variablesNames.BOOTSTRAP_STABILITY} <- '${stabRtImgPath}';`;
    let bootstrapCommand = `${variablesNames.LACEN_OBJ} <- lacenBootstrap(lacenObject=${variablesNames.LACEN_OBJ},`;
    bootstrapCommand = `${bootstrapCommand}numberOfIterations=2,`;
    bootstrapCommand = `${bootstrapCommand}maxBlockSize=${statusObj.settings.maxBlockSize},`;
    bootstrapCommand = `${bootstrapCommand}parallel=TRUE,`;
    bootstrapCommand = `${bootstrapCommand}nparallel=${statusObj.settings.numCores},`;
    bootstrapCommand = `${bootstrapCommand}WGCNAThreads=${statusObj.settings.numCores},`;
    bootstrapCommand = `${bootstrapCommand}cutBootstrap=FALSE,`;
    bootstrapCommand = `${bootstrapCommand}csvPath='${strObj.path.data}/${strObj.filename.bootstrapCsv}',`;
    bootstrapCommand = `${bootstrapCommand}pathModGroupsPlot='${modGrpImgPath}',`;
    bootstrapCommand = `${bootstrapCommand}pathStabilityPlot='${stabRtImgPath}');`;

    runProcessSpawn(identifier, "sh", [
      "-c",
      `printf "${strObj.cmd.lacen}${strObj.cmd.load}${bootstrapCommand}${modGroupsCmd}${bsStabilityCmd}${strObj.cmd.save}" | Rscript /dev/stdin`,
    ])
      .then((resp) => {
        statusObj.bootstraping.done = true;
        saveStatusObj(identifier, statusObj);
        emitEvent({
          event: LacenEventsEnum.BOOTSTRAP_OK,
          identifier,
          msg: null,
        });
        console.log({
          bootstrapResp: resp,
        });
      })
      .catch((err) => {
        emitEvent({
          event: LacenEventsEnum.BOOTSTRAP_ERROR,
          identifier,
          msg: null,
        });
        console.log("Err", { err });
      });
    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [GET] /skipBootstrap
    Skip the bootstrap setp and set default values for variables
  */
  public static async skipBootstrap(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const command = `${variablesNames.LACEN_OBJ}['cutBootstrap'] = FALSE;`;
    try {
      const result = await runProcessSpawn(identifier, "sh", [
        "-c",
        `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
      ]);
      const statusObj: StatusObj = getStatusObj(identifier);
      statusObj.bootstraping.skipped = true;
      saveStatusObj(identifier, statusObj);
      res.status(HttpStatus.OK);
      res.send(result);
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.EXPECTATION_FAILED);
      res.send(error);
    }
  }

  /*
    [GET] /generateNetwork
    Generate network and create variable with img path
  */
  public static async generateNetwork(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);
    const statusObj: StatusObj = getStatusObj(identifier);
    const enrGraphImgPath = `${strObj.path.imgs}/${strObj.filename.enrichedGraphImg}`;

    const enrGraphCmd = `${variablesNames.ENRICHEDGRAPH_IMG} <- '${enrGraphImgPath}';`;
    let command = `${variablesNames.LACEN_OBJ} <- summarizeAndEnrichModules(lacenObject=${variablesNames.LACEN_OBJ},`;
    command = `${command}numberOfIterations=2,`;
    // WGCNA parameters
    command = `${command}maxBlockSize=${statusObj.settings.maxBlockSize},`;
    command = `${command}TOMType='unsigned',`;
    command = `${command}minModuleSize=30,`;
    command = `${command}reassignThreshold=0,`;
    command = `${command}mergeCutHeight=0.3,`;
    command = `${command}pamRespectsDendro=FALSE,`;
    command = `${command}corType='bicor',`;
    // Enrichment analysis parameters
    command = `${command}userThreshold=0.05,`;
    command = `${command}ontology='BP',`;
    command = `${command}organism='hsapiens',`;
    command = `${command}orgdb='org.Hs.eg.db',`;
    command = `${command}reducedTermsThreshold=0.7,`;
    command = `${command}filename='${enrGraphImgPath}',`;
    // #Log parameters
    command = `${command}loh=FALSE);`;

    runProcessSpawn(identifier, "sh", [
      "-c",
      `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${enrGraphCmd}${strObj.cmd.save}" | Rscript /dev/stdin`,
    ])
      .then(async (resp) => {
        statusObj.creatingNetwork.done = true;
        saveStatusObj(identifier, statusObj);
        emitEvent({
          event: LacenEventsEnum.GENERATE_NETWORK_OK,
          identifier,
          msg: "Network generated",
        });
        console.log(resp);
      })
      .catch((err) => {
        emitEvent({
          event: LacenEventsEnum.GENERATE_NETWORK_ERROR,
          identifier,
          msg: null,
        });
        console.log("Err", err);
      });
    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [GET] /generateStackedBarplot
  */
  public static async generateStackedBarplot(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    const filepath = `${strObj.path.imgs}/${strObj.filename.stackedBarPlotImg}`;
    const stackedBarPlotImgCmd = `${variablesNames.STACKEDBARPLOT_IMG} = '${filepath}';`;
    const command = `stackedBarplot(lacenObject=${variablesNames.LACEN_OBJ},filename='${filepath}',plot=TRUE);`;

    runProcessSpawn(identifier, "sh", [
      "-c",
      `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${stackedBarPlotImgCmd}${strObj.cmd.save}" | Rscript /dev/stdin`,
    ])
      .then(async (resp) => {
        const statusObj: StatusObj = getStatusObj(identifier);
        statusObj.networkModules.barplotGenerated = true;
        saveStatusObj(identifier, statusObj);

        emitEvent({
          event: LacenEventsEnum.STACKED_BARPLOT_OK,
          identifier,
          msg: `${strObj.path.frontendImg}/${strObj.filename.stackedBarPlotImg}`,
        });
        console.log(resp);
      })
      .catch((err) => {
        emitEvent({
          event: LacenEventsEnum.STACKED_BARPLOT_ERROR,
          identifier,
          msg: null,
        });
        console.log("Err", err);
      });
    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [POST] /generateHeatmap
  */
  public static async generateHeatmap(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const moduleNum = req.body.moduleNum as number;
    const submoduleNum = req.body.submoduleNum as number;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    const heatmapImgName: string = getHeatmapImgName(moduleNum, submoduleNum);
    const filepath = `${strObj.path.heatmapImgs}/${heatmapImgName}`;
    const command = `heatmapTopConnectivity(lacenObject=${
      variablesNames.LACEN_OBJ
    },module=${moduleNum},submodule=${
      submoduleNum || "FALSE"
    },filename='${filepath}',hmDimensions=FALSE,removeNonDEG=FALSE,outTSV=FALSE,plothm=FALSE);`;

    runProcessSpawn(identifier, "sh", [
      "-c",
      `printf "${strObj.cmd.lacen}${strObj.cmd.load}${command}${strObj.cmd.save}" | Rscript /dev/stdin`,
    ])
      .then(async (resp) => {
        emitEvent({
          event: LacenEventsEnum.HEATMAP_GENERATED,
          identifier,
          msg: `${strObj.path.frontendHeatmaps}/${heatmapImgName}`,
        });
      })
      .catch((err) => {
        emitEvent({
          event: LacenEventsEnum.HEATMAP_ERROR,
          identifier,
          msg: null,
        });
        console.log("Err", err);
      });
    res.status(HttpStatus.OK);
    res.end();
  }

  /*
    [GET] /getHeatmapImgs
  */
  public static async getHeatmapImgs(
    req: Request,
    res: Response,
  ): Promise<void> {
    const identifier = req.query.identifier as string;
    const strObj: PathsFilesCommandsDto = pathsFilesCommands(identifier);

    try {
      const heatmapImgFiles = fs.readdirSync(strObj.path.heatmapImgs);
      if (heatmapImgFiles.length > 0) {
        const imgObj = [];
        heatmapImgFiles.forEach((filename) => {
          imgObj.push({
            name: filename,
            path: `${strObj.path.frontendHeatmaps}/${filename}`,
          });
        });
        res.send(imgObj);
      } else {
        res.end();
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR);
      res.send(error);
    }
  }
}
