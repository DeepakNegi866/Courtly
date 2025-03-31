import express from "express";
import dashboardController from "../controllers/dashboard-controller";

const router = express.Router();

router.get("/dashboard-data", dashboardController.getDashboard);

router.get("/user-dashboard", dashboardController.getUserDashboard);

router.get("/latest-hearing", dashboardController.getLatestHearing);

router.get("/get", dashboardController.getCalenderData);

router.get("/case-overview", dashboardController.getCaseOverview);

export default router;
