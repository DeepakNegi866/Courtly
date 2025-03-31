import Boom from "boom";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import ActivityModel from "../models/activity-model";
import CaseModel from "../models/case-model";
import UserModel from "../models/user-model";
import { responseHandler } from "../utils";
import { populate } from "dotenv";
import ClientModel from "../models/client-model";
import { sendActivityEmail, sendEmail } from "../middlewares/node-mailer";

export default {
  addActivity: async (req: any, res: any): Promise<any> => {
    try {
      const user = req.user._id;

      const { caseId, description, informClient, informTeamMember } = req.body;

      const isCaseIdExist: any = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }
      // Retrieve client ID and check if client exists
      const clientId = isCaseIdExist.yourClientId;
      const clientData = await ClientModel.findOne({
        _id: clientId,
        isDeleted: false,
      });

      if (!clientData) {
        throw Boom.notFound("Client not found");
      }

      const currentCase = { ...isCaseIdExist?._doc };
      // Handle email logic
      if (informClient?.email) {
        if (!clientData.email) {
          throw Boom.notFound("Client email not found");
        }
        const subject = `Activity Notification`;
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50;">Activity Notification</h1>
          <p>Hello ${clientData.fullName || "Client"},</p>
          <p>You have a new activity related to your case:</p>
      <ul>
        <li>Case Title: ${currentCase.title || "Not Specified"}</li>
        <li>Case Number: ${currentCase.caseNumber || "Not Specified"}</li>
        <li>Priority: ${currentCase.priority || "Not Specified"}</li>
        <li>Description: ${
          currentCase.description || "No Description Provided"
        }</li>
           <li>Date of Notice/Order: ${
             currentCase.dateOfFilling
               ? new Date(currentCase.dateOfFilling).toDateString()
               : "Not Specified"
           }</li>
    <li>Due Date: ${
      currentCase.dueDate
        ? new Date(currentCase.dueDate).toDateString()
        : "Not Specified"
    }</li>
      </ul>
          <p><strong>Description:</strong> ${description}</p>
                <p>
        Please <a href="https://digikase.com/management/cases/${
          currentCase?._id
        }" target="_blank">click here</a> to log in to the dashboard and view more details.
      </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,</p>
          <p>The Digi-Kase Team</p>
        </div>
      `;

        // Send the email
        await sendActivityEmail(clientData.email, user, subject, htmlContent);
      }

      // Find team members in the `yourTeam` array of the case
      const caseTeamMembers = isCaseIdExist.yourTeam || [];

      let informTeamMembers: string[] = [];
      if (Array.isArray(informTeamMember)) {
        informTeamMembers = informTeamMember.filter((id: string) =>
          caseTeamMembers.includes(id)
        );
      }

      // Send email to selected team members
      if (informTeamMembers.length > 0) {
        const teamMembers = await UserModel.find({
          _id: { $in: informTeamMembers },
          isDeleted: false,
        });

        for (const member of teamMembers) {
          if (member.email) {
            const subject = `Activity Notification`;
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h1 style="color: #4CAF50;">Activity Notification</h1>
              <p>Hello ${member?.firstName} ${member?.lastName},</p>
              <p>You have a new activity related to your case:</p>
          <ul>
            <li>Case Title: ${currentCase.title || "Not Specified"}</li>
            <li>Case Number: ${currentCase.caseNumber || "Not Specified"}</li>
            <li>Priority: ${currentCase.priority || "Not Specified"}</li>
            <li>Description: ${
              currentCase.description || "No Description Provided"
            }</li>
               <li>Date of Notice/Order: ${
                 currentCase.dateOfFilling
                   ? new Date(currentCase.dateOfFilling).toDateString()
                   : "Not Specified"
               }</li>
        <li>Due Date: ${
          currentCase.dueDate
            ? new Date(currentCase.dueDate).toDateString()
            : "Not Specified"
        }</li>
          </ul>
              <p><strong>Description:</strong> ${description}</p>
                    <p>
            Please <a href="https://digikase.com/management/cases/${
              currentCase?._id
            }" target="_blank">click here</a> to log in to the dashboard and view more details.
          </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p>Best regards,</p>
              <p>The Digi-Kase Team</p>
            </div>
          `;
            await sendActivityEmail(member.email, user, subject, htmlContent);
          }
        }
      }

      const activity = new ActivityModel({
        caseId,
        description,
        informClient,
        informTeamMember,
        addedBy: user,
      });

      await activity.save();

      const activityData = await ActivityModel.findById(activity._id).populate({
        path: "addedBy",
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: activityData,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAllActivities: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        caseId = null,
        organization = null,
      } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
          {
            path: "caseId",
          },
          {
            path: "addedBy",
          },
        ],
      };

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      let filter: any = { isDeleted: false };

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role == "accountant"
      ) {
        const cases = await CaseModel.find({
          isDeleted: false,
          organization: user.organizationId,
        }).select("_id");

        const caseIds = cases.map((caseData) => caseData._id);

        filter.caseId = { $in: caseIds };
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

      const getAllActivities = await ActivityModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllActivities,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
