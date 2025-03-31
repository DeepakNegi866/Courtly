import Boom from "boom";
import NotificationModel from "../models/notification-model";
import { responseHandler } from "../utils";
import UserModel from "../models/user-model";

export default {
  markNotificationAsRead: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      let { notificationId } = req.body;

      if (!Array.isArray(notificationId)) {
        notificationId = [notificationId];
      }

      const updatedNotifications = [];

      for (const id of notificationId) {
        const notificationData = await NotificationModel.findOne({
          _id: id,
          isDeleted: false,
        });

        if (!notificationData) {
          continue;
        }

        if (!notificationData.informed.includes(userId)) {
          notificationData.informed.push(userId);
          await notificationData.save();
          updatedNotifications.push(notificationData);
        }
      }

      if (updatedNotifications.length === 0) {
        return responseHandler.handleError(res, {
          statusCode: 404,
          message: "No notifications were updated.",
        });
      }

      return responseHandler.handleSuccess(res, {
        statusCode: 200,
        message: "Notifications marked as read successfully.",
        data: updatedNotifications,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllNotifications: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      // Fetch user details
      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        return responseHandler.handleError(res, { message: "User not found" });
      }

      const organizationId = user.organizationId;
      const isSuperAdmin = user.role === "super-admin";

      // Define organization filter
      const organizationFilter = !isSuperAdmin
        ? { "caseDetails.organization": organizationId }
        : {};

      // Fetch all notifications with necessary filters
      const notifications = await NotificationModel.aggregate([
        {
          $match: {
            informed: { $nin: [userId] }, // User is not in the 'informed' array
            isDeleted: false, // Notification is not deleted
          },
        },
        {
          $lookup: {
            from: "cases", // Join with the 'cases' collection
            localField: "caseId",
            foreignField: "_id",
            as: "caseDetails",
          },
        },
        {
          $unwind: "$caseDetails", // Unwind the case details array
        },
        {
          $match: {
            "caseDetails.isDeleted": false, // Ensure case is not deleted
            ...organizationFilter, // Apply organization filter for non-super-admins
          },
        },
        {
          $project: {
            type: 1,
            description: 1,
            status: 1,
            url: 1,
            createdAt: 1,
            updatedAt: 1,
            caseDetails: 1,
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort notifications by most recent
        },
      ]);
      // Send response
      return responseHandler.handleSuccess(res, {
        statusCode: 200,
        message: "RESPONSE_MESSAGE.SUCCESS",
        data: notifications,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
