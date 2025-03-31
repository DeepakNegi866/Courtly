import express from "express";
import caseController from "../controllers/case-controller";
import { upload } from "../middlewares/upload-file";

const router = express.Router();

// *********************************** CASE ROUTES *************************************

router.post("/add-case", caseController.addCase);

router.get("/get-all-cases", caseController.getAllCases);

router.get("/get-case/:caseId", caseController.getCaseById);

router.post("/update-case", caseController.updateCase);

router.post("/connect-case/:caseId", caseController.connectCase);

router.delete("/delete-case/:caseId", caseController.deleteCase);

router.post("/upload", upload.any(), caseController.uploadDocuments);

router.delete("/delete-document/:documentId", caseController.deleteDocument);

router.post("/update-documents", caseController.updateDocuments);

router.post("/add-hearing", caseController.addHearing);

router.get("/get-all-hearings", caseController.getAllHearings);

router.get("/get-all-case-douments", caseController.getAllCaseDocuments);

router.delete("/delete-document/:documentId", caseController.deleteDocument);

router.get("/download-excel", caseController.getAllCasesExcel);

export default router;
