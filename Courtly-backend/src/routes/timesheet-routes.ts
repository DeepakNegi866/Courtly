import express from "express";
import TimeSheetController from "../controllers/timesheet-controller";

const router = express.Router();

router.post("/add", TimeSheetController.addTimesheet);

router.get("/get-all", TimeSheetController.getAllTimesheets);

router.delete("/delete/:timesheetId", TimeSheetController.deleteTimesheet);

router.post("/update", TimeSheetController.updateTimesheet);

export default router;
