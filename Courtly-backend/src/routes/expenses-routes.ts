import express from "express";
import ExpensesController from "../controllers/expenses-controller";
import { upload } from "../middlewares/upload-file";

const router = express.Router();

router.post("/add", upload.any(), ExpensesController.addExpenses);

router.get("/get-all", ExpensesController.getAllExpenses);

router.delete("/delete/:expenseId", ExpensesController.deleteExpenses);

router.post("/raise-reimbursement-request", ExpensesController.raise_reimbursement_request);

router.post("/verify-reimbursement-request", ExpensesController.verify_reimbursement_request);

export default router;
