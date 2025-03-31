import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import ToDoModel from "../models/to-do-model";
import UserModel from "../models/user-model";
import OrganizationModel from "../models/organization-model";
import CaseModel from "../models/case-model";
import { sendActivityEmail } from "../middlewares/node-mailer";
const cron = require("node-cron");
import moment from "moment-timezone";

export default {
  addToDos: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        description: Joi.string().optional(),
        startDateTime: Joi.string().optional(),
        endDateTime: Joi.string().optional(),
        markAsPrivate: Joi.boolean().optional(),
        relatedToCaseId: Joi.array().items(Joi.string()).optional(),
        caseId: Joi.string().optional(),
        reminder: Joi.array().items(
          Joi.object({
            reminderMode: Joi.string().optional(),
            reminderTime: Joi.string().optional(),
            reminderModeTime: Joi.string().optional(),
          })
        ),
        status: Joi.string()
          .valid("open", "completed", "close")
          .default("open")
          .optional(),
        assignToMemberId: Joi.array().items(Joi.string()).optional(),
        organization: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        description,
        startDateTime,
        endDateTime,
        markAsPrivate,
        status,
        caseId,
        relatedToCaseId = [],
        reminder,
        assignToMemberId,
      } = req.body;

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (caseId && !relatedToCaseId.includes(caseId)) {
        relatedToCaseId.push(caseId);
      }

      const toDos = new ToDoModel({
        description,
        startDateTime,
        reminder,
        status,
        endDateTime,
        addedBy: userId,
        markAsPrivate,
        relatedToCaseId,
        assignToMemberId,
      });
      if (
        user.role === "admin" ||
        user.role === "team-member" ||
        user.role === "accountant"
      ) {
        toDos.organization = user.organizationId;
      }

      if (user.role === "super-admin") {
        toDos.organization = req.body.organization;
      }

      await toDos.save();

      for (let memberId of assignToMemberId) {
        const member: any = await UserModel.findOne({
          _id: memberId,
          isDeleted: false,
        });

        if (member && member.email) {
          const subject = "New Task Assigned";
          const html = `
            <p>Hi ${member.firstName},</p>
            <p>You have been assigned a new task by ${user.firstName} ${user.lastName}.</p>
            <p><strong>Task Description:</strong> ${description}</p>
            <p><strong>Start Date:</strong> ${startDateTime}</p>
            <p><strong>End Date:</strong> ${endDateTime}</p>
            <p><strong>Created by:</strong> ${user.firstName} ${user.lastName}</p>
            <p>Please make sure to complete the task as per the schedule.</p>
          `;
          await sendActivityEmail(member.email, userId, subject, html);
        }
      }

      if (reminder) {
        reminder.forEach((reminderItem: any) => {
          const { reminderMode, reminderTime, reminderModeTime } = reminderItem;

          if (reminderMode === "email") {
            const value = parseInt(reminderTime); // Numeric value (e.g., 5)
            const unit = reminderModeTime; // Unit (e.g., minute, hour)

            if (!value || !unit) {
              console.error("Invalid reminderTime or reminderModeTime");
              return;
            }

            // Calculate initial schedule time in IST
            let scheduleTime = moment
              .tz(startDateTime, "Asia/Kolkata")
              .subtract(value, unit as moment.unitOfTime.DurationConstructor);

            if (scheduleTime.isBefore(moment())) {
              // Adjust to the nearest future time
              scheduleTime = moment().add(1, "minute"); // Set buffer to 1 minute in the future
            }

            const interval = moment
              .duration(value, unit as moment.unitOfTime.DurationConstructor)
              .asMinutes(); // Convert interval to minutes

            // Create a recurring cron job
            const job = cron.schedule(
              `*/${interval} * * * *`,
              async () => {
                // Check if the case still exists
                const caseDetails: any = await CaseModel.findOne({
                  _id: { $in: relatedToCaseId },
                  isDeleted: false,
                });

                if (!caseDetails) {
                  job.stop();
                  return;
                }

                if (
                  moment().isSameOrAfter(moment.tz(endDateTime, "Asia/Kolkata"))
                ) {
                  job.stop();
                  return;
                }

                const subject = `Reminder: Task ${description}`;
                const html = `
                  <p>Hi,</p>
                  <p>This is a reminder for your task:</p>
                  <p><strong>Task Description:</strong> ${description}</p>
                  <p><strong>Start Date:</strong> ${startDateTime}</p>
                  <p><strong>End Date:</strong> ${endDateTime}</p>
                  <p>Make sure to complete it on time!</p>
                `;

                for (let memberId of assignToMemberId) {
                  const member: any = await UserModel.findOne({
                    _id: memberId,
                    isDeleted: false,
                  });

                  if (member && member.email) {
                    await sendActivityEmail(
                      member.email,
                      userId,
                      subject,
                      html
                    );
                  }
                }
              },
              {
                scheduled: true,
                timezone: "Asia/Kolkata",
              }
            );
          }
        });
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.TO_DO_ADDED,
        data: toDos,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllToDos: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        filter,
        organization = null,
        caseId = null,
      } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: "relatedToCaseId",
      };

      const currentDate = new Date().toISOString();

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw new Error("User not found");
      }

      let query: any = { isDeleted: false };
      const caseFilter: any = { isDeleted: false };
      const userFilter: any = { isDeleted: false };

      if (filter === "pending") {
        query = {
          ...query,
          status: "open",
          startDateTime: { $lte: currentDate },
        };
      } else if (filter === "upcoming") {
        query = {
          ...query,
          status: "open",
          startDateTime: { $gt: currentDate },
        };
      } else if (filter === "completed") {
        query = {
          ...query,
          status: "completed",
        };
      } else if (filter == "close") {
        query = {
          ...query,
          status: "close",
        };
      }

      if (user.role === "super-admin") {
        if (organization) {
          query.organization = organization;
        }
      } else if (user.role === "admin") {
        query.organization = user.organizationId;
      } else if (user.role === "team-member") {
        query.assignToMemberId = { $in: [userId] };
      } else if (user.role === "accountant") {
        query.organization = user.organizationId;
      }

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role == "accountant"
      ) {
        query.organization = user.organizationId;
        caseFilter.organization = user.organizationId;
        userFilter.organizationId = user.organizationId;
      }

      // if (user.role === "super-admin" && organization) {
      //   query.organization = organization;
      // }

      if (caseId) {
        query.relatedToCaseId = { $in: [caseId] };
      }

      const getAllToDos = await ToDoModel.paginate(query, options);

      const getAllCases = await CaseModel.find(caseFilter);
      const getAllUsers = await UserModel.find(userFilter);

      const countsQueryBase: any = {
        isDeleted: false,
        status: { $ne: "close" },
      };

      if (user.role !== "super-admin") {
        countsQueryBase["organization"] = user.organizationId;
      }
      if (caseId) {
        countsQueryBase.relatedToCaseId = { $in: [caseId] };
      }

      const responseData: any = {
        todos: getAllToDos,
        cases: getAllCases,
        users: getAllUsers,
        counts: {
          pending: await ToDoModel.countDocuments({
            ...countsQueryBase,
            isDeleted: false,
            status: "open",
            startDateTime: { $lte: currentDate },
          }),
          upcoming: await ToDoModel.countDocuments({
            ...countsQueryBase,
            isDeleted: false,
            status: "open",
            startDateTime: { $gt: currentDate },
          }),
          completed: await ToDoModel.countDocuments({
            ...countsQueryBase,
            isDeleted: false,
            status: "completed",
          }),
          close: await ToDoModel.countDocuments({
            ...countsQueryBase,
            isDeleted: false,
            status: "close",
          }),
        },
        upcomingTodos: await ToDoModel.find({
          ...query,
          isDeleted: false,
          status: "open",
          startDateTime: { $gt: currentDate },
        })
          .populate({
            path: "relatedToCaseId", // First level population
            populate: { path: "yourClientId" }, // Nested population inside relatedToCaseId
          })
          .exec(),
      };

      if (user.role === "super-admin") {
        const getAllOrganization = await OrganizationModel.find({
          isDeleted: false,
        });
        responseData.organization = getAllOrganization;
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: responseData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateToDos: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        description: Joi.string().optional(),
        startDateTime: Joi.string().optional(),
        endDateTime: Joi.string().optional(),
        markAsPrivate: Joi.boolean().optional(),
        relatedToCaseId: Joi.array().items(Joi.string()).optional(),
        reminder: Joi.array().items(
          Joi.object({
            reminderMode: Joi.string().optional(),
            reminderTime: Joi.string().optional(),
            reminderModeTime: Joi.string().optional(),
          })
        ),
        status: Joi.string()
          .valid("open", "completed", "close")
          .default("open")
          .optional(),
        assignToMemberId: Joi.array().items(Joi.string()).optional(),
        todoId: Joi.string().required(),
        organization: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        description,
        startDateTime,
        endDateTime,
        markAsPrivate,
        status,
        relatedToCaseId,
        reminder,
        assignToMemberId,
        todoId,
      } = req.body;

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      const toDos: any = await ToDoModel.findOne({
        _id: todoId,
        isDeleted: false,
      });

      if (user.role == "admin") {
        toDos.organization = user?.organizationId;
      }
      if (
        user.role == "super-admin" ||
        user.role == "team-member" ||
        user.role == "accountant"
      ) {
        toDos.organization == req.body.organization;
      }

      if (description !== undefined) toDos.description = description;
      if (startDateTime !== undefined) toDos.startDateTime = startDateTime;
      if (endDateTime !== undefined) toDos.endDateTime = endDateTime;
      if (markAsPrivate !== undefined) toDos.markAsPrivate = markAsPrivate;
      if (status !== undefined) toDos.status = status;
      if (relatedToCaseId !== undefined)
        toDos.relatedToCaseId = relatedToCaseId;
      if (reminder !== undefined) toDos.reminder = reminder;
      if (assignToMemberId !== undefined)
        toDos.assignToMemberId = assignToMemberId;

      await toDos.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.TO_DO_UPDATED,
        data: toDos,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
