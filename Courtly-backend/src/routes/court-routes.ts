import express from "express";
import courtController from "../controllers/court-controller";

const router = express.Router();

router.post("/add-court", courtController.addCourt);

router.delete("/delete-court/:courtId", courtController.deleteCourt);

router.post("/update-court", courtController.updateCourt);

router.get("/get-all-courts", courtController.getAllCourts);

export default router;
