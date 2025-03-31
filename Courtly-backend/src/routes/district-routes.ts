import express from "express";
import districtController from "../controllers/district-controller";

const router = express.Router();

router.post("/add-district", districtController.addDistrict);

router.get("/get-all-districts", districtController.getAllDistricts);

router.delete(
  "/delete-district/:districtId",
  districtController.deleteDistrict
);

router.post("/update-district", districtController.updateDistrict);

export default router;
