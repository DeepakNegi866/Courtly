import express from "express";
import districtCourtController from "../controllers/districtCourt-controller";

const router = express.Router();

router.post("/add-district_court", districtCourtController.addDistrictCourt);

router.get(
  "/get-all-district_courts",
  districtCourtController.getAllDistrictCourts
);

router.delete(
  "/delete-district_court/:districtCourtId",
  districtCourtController.deleteDistrictCourt
);

router.post(
  "/update-district_court",
  districtCourtController.updateDistrictCourt
);

export default router;
