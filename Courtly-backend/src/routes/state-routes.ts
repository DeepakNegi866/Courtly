import express from "express";
import stateController from "../controllers/state-controller";

const router = express.Router();

router.post("/add-state", stateController.addState);

router.get("/get-all-states", stateController.getAllStates);

router.delete("/delete-state/:stateId", stateController.deleteState);

router.post("/update-state", stateController.updateState);

export default router;
