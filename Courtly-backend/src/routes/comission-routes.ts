import express from "express";
import comissionController from "../controllers/comission-controller";

const router = express.Router();

// comissions routes

router.post("/add-comission", comissionController.addComission);

router.post("/update-comission", comissionController.updateComission);

router.get("/get-all-comissions", comissionController.getAllComissions);

router.get("/get-comission", comissionController.getComission);

router.delete(
  "/delete-comission/:comissionId",
  comissionController.deleteComission
);

// state comission routes

router.post("/add-state", comissionController.addStateComission);

router.post("/update-state", comissionController.updateStateComission);

router.get("/get-all-states", comissionController.getAllStateComissions);

router.get("/get-state", comissionController.getStateComission);

router.delete(
  "/delete-state/:stateComissionId",
  comissionController.deleteStateComission
);

// district comission routes

router.post("/add-district", comissionController.addDistrictComission);

router.post("/update-district", comissionController.updateDistrictComission);

router.get("/get-all-districts", comissionController.getAllDistrictComissions);

router.get("/get-district", comissionController.getDistrictComission);

router.delete(
  "/delete-district/:districtComissionId",
  comissionController.deleteDistrictComission
);

// benches comission routes

router.post("/add-benches", comissionController.addBenchesComission);

router.post("/update-benches", comissionController.updateBenchesComission);

router.get("/get-all-benches", comissionController.getAllBenchesComissions);

router.get("/get-benches", comissionController.getBenchesComission);

router.delete(
  "/delete-benches/:benchesComissionId",
  comissionController.deleteBenchesComission
);

// comissionrate authority routes

router.post(
  "/add-comission_rate_authority",
  comissionController.addComissionRateAuthority
);

router.post(
  "/update-comission_rate_authority",
  comissionController.updateComissionRateAuthority
);

router.get(
  "/get-all-comission_rate_authority",
  comissionController.getAllComissionRateAuthority
);

router.delete(
  "/delete-comission_rate_authority/:comissionRateAuthorityId",
  comissionController.deleteComissionRateAuthority
);

// lok adalat routes

router.post("/add-lok_adalat", comissionController.addLokAdalat);

router.post("/update-lok_adalat", comissionController.updateLokAdalat);

router.get("/get-all-lok_adalat", comissionController.getAllLokAdalat);

router.delete(
  "/delete-lok_adalat/:lokAdalatId",
  comissionController.deleteLokAdalat
);

// revenue courts routes

router.post("/add-revenue_court", comissionController.addRevenueCourt);

router.post("/update-revenue_court", comissionController.updateRevenueCourt);

router.get("/get-all-revenue_court", comissionController.getAllRevenueCourt);

router.delete(
  "/delete-revenue_court/:revenueCourtId",
  comissionController.deleteRevenueCourt
);

// tribunal authorities routes

router.post(
  "/add-tribunal_authority",
  comissionController.addTribunalAuthority
);

router.post(
  "/update-tribunal_authority",
  comissionController.updateTribunalAuthority
);

router.get(
  "/get-all-tribunal_authority",
  comissionController.getAllTribunalAuthority
);

router.delete(
  "/delete-tribunal_authority/:tribunalAuthorityId",
  comissionController.deleteTribunalAuthority
);

// departments routes

router.post("/add-department", comissionController.addDepartment);

router.post("/update-department", comissionController.updateDepartment);

router.get("/get-all-departments", comissionController.getAllDepartments);

router.delete(
  "/delete-department/:departmentId",
  comissionController.deleteDepartment
);

// department authorities routes

router.post(
  "/add-department_authority",
  comissionController.addDepartmentAuthority
);

router.post(
  "/update-department_authority",
  comissionController.updateDepartmentAuthority
);

router.get(
  "/get-all-department_authority",
  comissionController.getAllDepartmentAuthority
);

router.delete(
  "/delete-department_authority/:departmentAuthorityId",
  comissionController.deleteDepartmentAuthority
);
export default router;
