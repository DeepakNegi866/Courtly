import express from "express";
import activityController from "../controllers/activity-controller";

const router = express.Router();

router.post("/add", activityController.addActivity);

router.get("/get-all", activityController.getAllActivities);

export default router;
