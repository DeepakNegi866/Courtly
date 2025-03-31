import express from "express";
import notificationController from "../controllers/notification-controller";

const router = express.Router();
router.post("/mark-read", notificationController.markNotificationAsRead);
router.get("/all", notificationController.getAllNotifications);

export default router;
