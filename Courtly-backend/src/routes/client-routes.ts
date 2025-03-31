import express from "express";
import clientController from "../controllers/client-controller";

const router = express.Router();

router.post("/add-client", clientController.addClient);

router.get("/get-all-clients", clientController.getAllClients);

router.delete("/delete-client/:clientId", clientController.deleteClient);

router.get("/get-client", clientController.getClient);

router.post("/update-client", clientController.updateClient);

export default router;
