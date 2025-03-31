import Boom from "boom";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import ActivityModel from "../models/activity-model";
import CaseDocumentModel from "../models/case-documents-model";
import CaseModel from "../models/case-model";
import ClientModel from "../models/client-model";
import HearingModel from "../models/hearing-model";
import NotesModel from "../models/notes-model";
import ToDoModel from "../models/to-do-model";
import UserModel from "../models/user-model";
import { responseHandler } from "../utils";

export default {
  getDashboard: async (req: any, res: any): Promise<any> => {
    try {
      const currentDate = new Date().toISOString();
      const userId = req.user._id;
      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });
      const isSuperAdmin = user.role === "super-admin";
      const organizationId = user.organizationId;

      const organizationFilterId = !isSuperAdmin ? { organizationId } : {};

      const organizationFilter = !isSuperAdmin
        ? { organization: organizationId }
        : {};

      const parsedDate = new Date(currentDate); // Convert string to Date object

      const currentMonth = parsedDate.getMonth();
      const currentYear = parsedDate.getFullYear();

      const startDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);

      const endDate = new Date(currentYear, currentMonth + 2, 1, 0, 0, 0);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const notesQuery: any = {
        isDeleted: false,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };

      const hearingQuery: any = {
        isDeleted: false,
        hearingDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };
      const todosQuery: any = {
        isDeleted: false,
        endDateTime: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      };

      const caseQuery: any = {
        isDeleted: false,
        dueDate: {
          $gte: startDate,
          $lt: endDate,
        },
        ...organizationFilter,
      };

      if (!isSuperAdmin) {
        notesQuery["caseId"] = { $exists: true };
        hearingQuery["caseId"] = { $exists: true };
        todosQuery["organization"] = user.organizationId;
      }

      const getAllActivities = await ActivityModel.find({
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate([
          {
            path: "caseId",
            match: { isDeleted: false, ...organizationFilter }, // Apply organization filter for non-super admins
          },
          {
            path: "addedBy", // Populate addedBy field
          },
        ])
        .then((activities) =>
          activities.filter((activity) => activity.caseId !== null)
        );

      const allNotes = await NotesModel.find(notesQuery).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allCaseDocuments = await CaseDocumentModel.find(
        notesQuery
      ).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allHearings = await HearingModel.find(hearingQuery).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allTodos = await ToDoModel.find(todosQuery);

      const allCases = await CaseModel.find(caseQuery);

      const totalClients = await ClientModel.countDocuments({
        isDeleted: false,
        ...organizationFilterId,
      });
      const totalUsers = await UserModel.countDocuments({
        isDeleted: false,
        role: { $ne: "super-admin" },
        ...organizationFilterId,
      });

      // Count case document uploads

      const caseDocuments = await CaseDocumentModel.find({
        isDeleted: false,
      }).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const totalCaseDocumentsUpload = caseDocuments.filter(
        (doc: any) => doc.caseId !== null
      ).length;

      // const totalCaseDocumentsUpload = await CaseDocumentModel.countDocuments({
      //   isDeleted: false,
      //   ...organizationFilter,
      // });
      const totalCases = await CaseModel.countDocuments({
        isDeleted: false,
        status: { $ne: "close" },
        ...organizationFilter,
      });

      const nearestHearing = await HearingModel.find({
        hearingDate: { $gte: currentDate },
        isDeleted: false,
        ...organizationFilter,
      })
        .populate({
          path: "caseId",
          match: { isDeleted: false, ...organizationFilter },
        })
        .sort({ hearingDate: 1 })
        .limit(3);

      const latestCase = await CaseModel.find({
        isDeleted: false,
        ...organizationFilter,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      const openCases = await CaseModel.countDocuments({
        isDeleted: false,
        status: "open",
        ...organizationFilter,
      });
      const closedCases = await CaseModel.countDocuments({
        isDeleted: false,
        status: "close",
        ...organizationFilter,
      });
      const archivedCases = await CaseModel.countDocuments({
        isDeleted: false,
        status: "archive",
        ...organizationFilter,
      });
      const dueCases = await CaseModel.countDocuments({
        isDeleted: false,
        status: "open",
        dueDate: { $lte: currentDate },
        ...organizationFilter,
      });

      const pendingTodos = await ToDoModel.countDocuments({
        isDeleted: false,
        status: "open",
        startDateTime: { $lte: currentDate },
        ...organizationFilter,
      });
      const upcomingTodos = await ToDoModel.countDocuments({
        isDeleted: false,
        status: "open",
        startDateTime: { $gt: currentDate },
        ...organizationFilter,
      });
      const completedTodos = await ToDoModel.countDocuments({
        isDeleted: false,
        status: "completed",
        ...organizationFilter,
      });

      const upcomingTodoList = await ToDoModel.find({
        isDeleted: false,
        startDateTime: { $gt: currentDate },
        ...organizationFilter,
      })
        .sort({ startDateTime: 1 })
        .limit(3);

      const allCasesList = await CaseModel.find({
        isDeleted: false,
        ...organizationFilter,
        status: { $nin: ["archive", "close"] },
      }).exec();

      const normalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "normal";
      });

      const criticalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "critical";
      });

      const supercriticalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "superCritical";
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          latestCase,
          totalClients,
          totalUsers,
          case: {
            totalCases,
            status: {
              open: openCases,
              closed: closedCases,
              dueDate: dueCases,
              archived: archivedCases,
            },
            normalCases,
            criticalCases,
            supercriticalCases,
          },
          totalCaseDocumentsUpload,
          nearestHearing,
          todosCounts: {
            pending: pendingTodos,
            upcoming: upcomingTodos,
            completed: completedTodos,
          },
          upcomingTodos: upcomingTodoList,
          calenderData: {
            notes: allNotes,
            caseDocuments: allCaseDocuments,
            hearings: allHearings,
            todos: allTodos,
            case: allCases,
          },
          activities: getAllActivities,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getUserDashboard: async (req: any, res: any): Promise<any> => {
    try {
      const currentDate = new Date().toISOString();

      const userId = req.user._id;

      const loggedInUser: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!loggedInUser) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const userRole = loggedInUser.role;

      const organizationId = loggedInUser.organizationId;

      const openCases = await CaseModel.countDocuments({
        yourTeam: { $in: [userId] },
        isDeleted: false,
        status: "open",
      });

      const closedCases = await CaseModel.countDocuments({
        yourTeam: { $in: [userId] },
        isDeleted: false,
        status: "close",
      });

      const dueCases = await CaseModel.countDocuments({
        yourTeam: { $in: [userId] },
        isDeleted: false,
        status: "open",
        dueDate: { $lte: currentDate },
      });

      const allCasesList = await CaseModel.find({
        isDeleted: false,
        yourTeam: { $in: [userId] },
        status: { $nin: ["archive", "close"] },
      }).exec();

      const normalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "normal";
      });

      const criticalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "critical";
      });

      const supercriticalCases = allCasesList.filter((caseRecord) => {
        const progressStatus = caseRecord.calculateProgressStatus();
        return progressStatus === "superCritical";
      });

      let archiveCases = 0;
      if (
        userRole === "admin" ||
        userRole === "accountant" ||
        (userRole === "team-member" && organizationId)
      ) {
        archiveCases = await CaseModel.countDocuments({
          organization: organizationId,
          isDeleted: false,
          status: "archive",
        });
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          openCases,
          closedCases,
          dueCases,
          normalCases,
          criticalCases,
          supercriticalCases,
          archiveCases,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getLatestHearing: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      const isSuperAdmin = user.role === "super-admin";
      const organizationId = user.organizationId;

      const nearestHearingQuery: any = {
        isDeleted: false,
        hearingDate: { $gte: new Date().toISOString() },
      };

      // Find the latest 3 upcoming hearings
      const nearestHearing = await HearingModel.find(nearestHearingQuery)
        .sort({ hearingDate: 1 })
        .limit(3)
        .populate({
          path: "caseId",
          match: {
            isDeleted: false,
            ...(isSuperAdmin ? {} : { organization: organizationId }),
          },
          populate: {
            path: "yourClientId", // Populate the organization field from caseId
            match: { isDeleted: false }, // Optional filter for organization
          },
        });

      const validHearings = nearestHearing.filter((hearing) => hearing.caseId);

      if (validHearings.length === 0) {
        return responseHandler.handleSuccess(res, {
          statuscode: 200,
          message: "No upcoming hearings found",
          data: null,
        });
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          hearingData: validHearings,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getCalenderData: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;
      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      const isSuperAdmin = user.role === "super-admin";

      const { date, caseId } = req.query;
      const inputDate = date ? new Date(date) : new Date();

      const currentMonth = inputDate.getMonth();
      const currentYear = inputDate.getFullYear();

      const startDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
      const endDate = new Date(currentYear, currentMonth + 2, 1, 0, 0, 0);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);

      const organizationFilter = isSuperAdmin
        ? {}
        : { organization: user.organizationId };

      const notesQuery: any = {
        isDeleted: false,
        ...(caseId ? { caseId } : {}),
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      };

      const hearingQuery: any = {
        isDeleted: false,
        caseId: { $ne: null },
        ...(caseId ? { caseId } : {}),
        hearingDate: {
          $gte: startDate,
          $lt: endDate,
        },
      };

      const todosQuery: any = {
        isDeleted: false,
        ...(caseId
          ? { relatedToCaseId: { $in: [caseId] } }
          : organizationFilter),
        endDateTime: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
        status: {
          $in: ["open", "completed"],
        },
      };

      const caseQuery: any = {
        isDeleted: false,
        dueDate: {
          $gte: startDate,
          $lt: endDate,
        },
        ...(caseId ? { _id: caseId } : organizationFilter),
      };

      if (caseId) {
        const validCase = await CaseModel.findOne({
          _id: caseId,
          isDeleted: false,
          ...organizationFilter,
        });

        if (!validCase) {
          throw Boom.forbidden("You are not authorized to access this case.");
        }
      }

      const allNotes = await NotesModel.find(notesQuery).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allCaseDocuments = await CaseDocumentModel.find(
        notesQuery
      ).populate({
        path: "caseId",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allHearings = (
        await HearingModel.find(hearingQuery)
          .populate({
            path: "caseId",
            match: { isDeleted: false, ...organizationFilter },
          })
          .populate({
            path: "addedBy",
          })
      ).filter((hearing: any) => hearing.caseId !== null);

      const allTodos = await ToDoModel.find(todosQuery).populate({
        path: "addedBy",
        match: { isDeleted: false, ...organizationFilter },
      });

      const allCases = await CaseModel.find(caseQuery)
        .populate({
          path: "addedBy",
        })
        .exec();

      const allCasesWithProgressStatus = allCases.map((item: any) => ({
        ...item._doc,
        progressStatus: item.calculateProgressStatus(),
      }));

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          notes: allNotes,
          caseDocuments: allCaseDocuments,
          hearings: allHearings,
          todos: allTodos,
          case: allCasesWithProgressStatus,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getCaseOverview: async (req: any, res: any): Promise<any> => {
    try {
      const { year } = req.query;
      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw new Error("User not found");
      }

      let matchQuery: any = { isDeleted: false };

      if (user.role !== "super-admin") {
        matchQuery.organization = user.organizationId;
      }

      if (year) {
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
        matchQuery.createdAt = { $gte: startOfYear, $lte: endOfYear };
      }

      const caseData = await CaseModel.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Month names mapping
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        count: 0,
      }));

      caseData.forEach((data) => {
        monthlyData[data._id - 1].count = data.count;
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: "Monthly Case Overview",
        data: monthlyData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
