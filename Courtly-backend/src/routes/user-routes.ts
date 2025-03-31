import express from "express";
import userController from "../controllers/user-controller";
import { upload } from "../middlewares/upload-file";

const router = express.Router();

router.post("/add-user", upload.any(), userController.adduser);

router.get("/get-all-users", userController.getAllUsers);

router.delete("/delete-user/:userId", userController.deleteUser);

router.get("/get-user", userController.getUser);

router.post("/update-user", upload.any(), userController.updateUser);

router.post("/update-profile", upload.any(), userController.updateProfile);

router.post("/change-password", userController.changePassword);

router.get("/get-all-team-members", userController.getAllTeamMembers);

router.get("/profile", userController.getProfile);

router.get("/organization-profile", userController.getOrganizationProfile);

router.post(
  "/update-organization-profile",
  upload.any(),
  userController.updateOrganizationProfile
);

router.post("/status", userController.addUserStatus);

export default router;
