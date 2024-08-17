import multer from "multer";
import { Router } from "express";
import { Controller } from "../controllers/main.controller";

const router = Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, process.env.SAVED_FILES_PATH);
  },
});
const upload = multer({ storage });

const fields = [
  { name: "count", maxCount: 1 },
  { name: "expression", maxCount: 1 },
  { name: "label", maxCount: 1 },
];

router.get("/checkIdentifier", Controller.checkIdentifier);
router.put("/archiveRdata", Controller.archiveRdata);
// router.get('/test', Controller.test);
router.get("/getVariables", Controller.getVariables);
// router.get('/loadFile', Controller.loadFile);
// router.post('/saveFile', Controller.saveFile);
router.post("/runCommand", Controller.runCommand);
router.post("/getImgPath", Controller.getImgPath);
router.post("/setParameters", Controller.setParameters);
router.post(
  "/uploadDataFiles",
  upload.fields(fields),
  Controller.uploadDataFiles,
);
router.post(
  "/uploadAnnotationFile",
  upload.single("file"),
  Controller.uploadAnnotationFile,
);
router.post("/loadAnnotation", Controller.loadAnnotation);
router.get("/instantiateLacenAndCheck", Controller.instantiateLacenAndCheck);
router.get("/filterTransform", Controller.filterTransform);
router.post("/selectOutlierSample", Controller.selectOutlierSample);
router.post("/acceptHeight", Controller.acceptHeight);
router.get("/generateThresholdPlot", Controller.generateThresholdPlot);
router.post("/setIndicePower", Controller.setIndicePower);
router.get("/runBootstrap", Controller.runBootstrap);
router.get("/skipBootstrap", Controller.skipBootstrap);
router.get("/generateNetwork", Controller.generateNetwork);
router.get("/generateStackedBarplot", Controller.generateStackedBarplot);
router.post("/generateHeatmap", Controller.generateHeatmap);
router.get("/getHeatmapImgs", Controller.getHeatmapImgs);

export default router;
