import Boom from "boom";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import CaseModel from "../models/case-model";
import TimeSheetModel from "../models/timesheet-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import NotificationModel from "../models/notification-model";
import OrganizationModel from "../models/organization-model";
import { formatDate, formatTime } from "../middlewares/format-time";

export default {
  addTimesheet: async (req: any, res: any): Promise<any> => {
    try {
      const { caseId, date, startTime, endTime, description } = req.body;

      const isCaseExist = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const timesheet = new TimeSheetModel({
        caseId,
        date,
        startTime,
        endTime,
        description,
        addedBy: req.user._id,
      });

      await timesheet.save();

      const timesheetResponse = await TimeSheetModel.findById(
        timesheet._id
      ).populate({
        path: "caseId",
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: timesheetResponse,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllTimesheets: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        caseId = null,
        status = null,
        organization = null,
      } = req.query;

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      let filter: any = { isDeleted: false };

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role === "accountant"
      ) {
        const cases = await CaseModel.find({
          organization: user.organizationId,
          isDeleted: false,
        }).select("_id");

        const caseIds = cases.map((caseData) => caseData._id);

        filter.caseId = { $in: caseIds };

        if (user.role === "team-member" || user.role === "accountant") {
          filter.addedBy = userId;
        }
      }

      if (user.role === "super-admin" && organization) {
        const cases = await CaseModel.find({
          organization: organization,
          isDeleted: false,
        }).select("_id");
        const caseIds = cases.map((caseData) => caseData._id);
        filter.caseId = { $in: caseIds };
      }

      if (caseId) {
        filter.caseId = caseId;
      }

      if (status && status !== "all") {
        filter.status = status;
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
          {
            path: "addedBy",
          },
          {
            path: "caseId",
          },
        ],
      };

      const getAllTimesheets = await TimeSheetModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllTimesheets,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteTimesheet: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        timesheetId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { timesheetId } = req.params;

      const timeSheetData = await TimeSheetModel.findOne({
        _id: timesheetId,
        isDeleted: false,
      });

      if (!timeSheetData) {
        throw Boom.notFound(RESPONSE_MESSAGE.TIMESHEET_NOT_FOUND);
      }

      timeSheetData.isDeleted = true;

      await timeSheetData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: timeSheetData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateTimesheet: async (req: any, res: any): Promise<any> => {
    try {
      const { timesheetId, status } = req.body;

      const timeSheetData = await TimeSheetModel.findOne({
        _id: timesheetId,
        isDeleted: false,
      });

      if (!timeSheetData) {
        throw Boom.notFound(RESPONSE_MESSAGE.TIMESHEET_NOT_FOUND);
      }

      timeSheetData.status = status;
      timeSheetData.updatedBy = req.user._id;
      await timeSheetData.save();

      const userData = await UserModel.findById(req.user._id);
      const userTimeSheet = await UserModel.findById(timeSheetData.addedBy);

      if (!userData) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const userFirstName = userData.firstName;
      const userLastName = userData.lastName;

      const descriptions: { [key: string]: string } = {
        approved: `The timesheet for ${userTimeSheet?.firstName} ${
          userTimeSheet?.lastName
        }, on ${formatDate(
          timeSheetData?.date.toISOString()
        )}, from ${formatTime(timeSheetData?.startTime)} to ${formatTime(
          timeSheetData?.endTime
        )}, has been approved by ${userFirstName} ${userLastName}.`,

        rejected: `The timesheet for ${userTimeSheet?.firstName} ${
          userTimeSheet?.lastName
        }, on ${formatDate(
          timeSheetData?.date.toISOString()
        )}, from ${formatTime(timeSheetData?.startTime)} to ${formatTime(
          timeSheetData?.endTime
        )}, has been rejected by ${userFirstName} ${userLastName}.`,
      };

      const description =
        descriptions[status] ||
        `The timesheet status has been updated to ${status}.`;

      const caseData = await CaseModel.findOne({
        _id: timeSheetData.caseId,
        isDeleted: false,
      });

      if (!caseData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const organizationData = await OrganizationModel.findOne({
        _id: caseData.organization,
        isDeleted: false,
      });

      if (!organizationData) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const adminUsers = await UserModel.find({
        role: "admin",
        organizationId: organizationData._id,
        isDeleted: false,
      }).select("_id");

      const accountantUsers = await UserModel.find({
        role: "accountant",
        organizationId: organizationData._id,
        isDeleted: false,
      }).select("_id");

      const informees = [
        timeSheetData.addedBy,
        ...adminUsers.map((user) => user._id),
        ...accountantUsers.map((user) => user._id),
      ];

      const notificationData = {
        type: "timesheet_update",
        caseId: timeSheetData.caseId || null,
        description: description,
        status: "normal",
        informees: [...new Set(informees)],
        informed: [],
        url: `/timesheets/${timesheetId}`,
      };

      await NotificationModel.create(notificationData);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: timeSheetData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
