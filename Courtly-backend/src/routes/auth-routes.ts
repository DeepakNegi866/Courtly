import express from "express";
import AuthController from "../controllers/auth-controller";

const router = express.Router();

// *********************************** AUTH ROUTES *************************************

router.post("/login", AuthController.login);

export default router;
