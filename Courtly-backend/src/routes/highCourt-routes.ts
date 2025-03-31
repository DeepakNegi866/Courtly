import express from "express";
import highCourtController from "../controllers/highCourt-controller";

const router = express.Router();

router.post("/add-high_court", highCourtController.addhighcourt);

router.get("/get-all-high_courts", highCourtController.getAllHighCourts);

router.delete(
  "/delete-high_court/:highCourtId",
  highCourtController.deleteHighCourt
);

router.post("/update-high_court", highCourtController.updateHighCourt);

// high court Benches Routes

router.post("/add", highCourtController.addHighCourtBenches);

router.get("/get-all", highCourtController.getAllHighCourtBenches);

router.post("/update", highCourtController.updateHighCourtBenches);

router.delete(
  "/delete/:highCourtBencheId",
  highCourtController.deleteHighCourtBenches
);

export default router;
