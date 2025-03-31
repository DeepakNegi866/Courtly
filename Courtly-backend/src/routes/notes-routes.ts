import express from "express";
import notesController from "../controllers/notes-controller";

const router = express.Router();

router.post("/add", notesController.addNotes);

router.delete("/delete/:noteId", notesController.deleteNotes);

router.get("/get-all", notesController.getAllNotes);

router.post("/update", notesController.updateNotes);

export default router;
