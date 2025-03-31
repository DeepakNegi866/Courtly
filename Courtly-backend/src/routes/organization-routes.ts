import express from "express";
import organizationController from "../controllers/organization-controller";
import { upload } from "../middlewares/upload-file";

const router = express.Router();

router.post(
  "/add-organization",
  upload.any(),
  organizationController.addOrganization
);

router.get(
  "/get-all-organizations",
  organizationController.getAllOrganizations
);

router.get("/get-organization", organizationController.getOrganization);

router.delete(
  "/delete-organization/:organizationId",
  organizationController.deleteOrganization
);

router.post(
  "/update-organization",
  upload.any(),
  organizationController.updateOrganization
);

export default router;
