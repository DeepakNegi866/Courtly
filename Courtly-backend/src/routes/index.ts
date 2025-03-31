import express, { NextFunction, Request, Response } from "express";
import AuthRoutes from "../routes/auth-routes";
import UserRoutes from "../routes/user-routes";
import ClientRoutes from "../routes/client-routes";
import OrganizationRoutes from "../routes/organization-routes";
import logger from "../utils/logger";
import HttpError from "../utils/httpErrors/httpError";
import Auth from "../middlewares/auth-middleware";
import HighCourt from "../routes/highCourt-routes";
import StateRoutes from "../routes/state-routes";
import DistrictRoutes from "../routes/district-routes";
import DistrictCourtRourts from "../routes/districtCourt-routes";
import ComissionRoutes from "../routes/comission-routes";
import CaseRoutes from "../routes/case-routes";
import ToDosRoutes from "../routes/to-dos-routes";
import DashboardRoutes from "../routes/dashboard-routes";
import CaseTypeRoutes from "../routes/case-type-routes";
import NotesRoutes from "../routes/notes-routes";
import ActivityRoutes from "../routes/activity-routes";
import TimesheetRoutes from "../routes/timesheet-routes";
import ExpensesRoutes from "../routes/expenses-routes";
import CourtRoutes from "../routes/court-routes";
import NotificationRoutes from "../routes/notification-routes";

const router = express.Router();

const ROLES: { [key: string]: any } = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  TEAM_MEMBER: "team-member",
  ACCOUNTANT: "accountant",
};

router.use("/auth", AuthRoutes);

router.use(
  "/organization",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  OrganizationRoutes
);

router.use(
  "/client",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  ClientRoutes
);

router.use(
  "/court",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  CourtRoutes
);

router.use(
  "/user",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  UserRoutes
);

router.use(
  "/high-court",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  HighCourt
);

router.use(
  "/high-court-benches",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  HighCourt
);

router.use(
  "/state",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  StateRoutes
);

router.use(
  "/district",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DistrictRoutes
);

router.use(
  "/district-court",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DistrictCourtRourts
);

router.use(
  "/comission",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  ComissionRoutes
);

router.use(
  "/case",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  CaseRoutes
);

router.use(
  "/admin",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DashboardRoutes
);

router.use(
  "/dashboard",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DashboardRoutes
);

router.use(
  "/case-documents",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  CaseRoutes
);

router.use(
  "/to-dos",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  ToDosRoutes
);

router.use(
  "/notes",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  NotesRoutes
);

router.use(
  "/activity",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  ActivityRoutes
);

router.use(
  "/case-type",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  CaseTypeRoutes
);

router.use(
  "/calender",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DashboardRoutes
);

router.use(
  "/hearing",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  DashboardRoutes
);

router.use(
  "/timesheet",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  TimesheetRoutes
);

router.use(
  "/expenses",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  ExpensesRoutes
);

router.use(
  "/notification",
  Auth([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.ACCOUNTANT]),
  NotificationRoutes
);

//404 handling route
router.use((req, res, next) => {
  const error = new HttpError("Not Found", 404);
  next(error);
});

//route error handlind
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message, { stack: error.stack });
  res.status(error.statusCode || 500);
  res.send({
    status: "error",
    message: error.message,
    data: {
      status: error.statusCode || 500,
    },
  });
});

export default router;
