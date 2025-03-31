import express from "express";
import toDosController from "../controllers/to-dos-controller";

const router = express.Router();

// *********************************** TO-DOS ROUTES *************************************

router.post("/add-to-dos", toDosController.addToDos);

// router.get("/get-all-to-dos", toDosController.getAllToDos);

router.get("/get-all-todos", toDosController.getAllToDos);

router.post("/update-to-dos", toDosController.updateToDos);

export default router;
