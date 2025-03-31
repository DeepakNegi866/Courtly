import express from "express";
import caseTypeController from "../controllers/case-type-controller";

const router = express.Router();

router.post("/add-case-type", caseTypeController.addCaseType);

router.get("/get-all-case-types", caseTypeController.getAllCaseTypes);

router.delete(
  "/delete-case-type/:caseTypeId",
  caseTypeController.deleteCaseType
);

router.post("/update-case-type", caseTypeController.updateCaseType);

router.get("/get", caseTypeController.getCaseType);
export default router;
