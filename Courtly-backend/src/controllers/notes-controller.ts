import Boom from "boom";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import CaseModel from "../models/case-model";
import NotesModel from "../models/notes-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import ClientModel from "../models/client-model";
import { sendActivityEmail } from "../middlewares/node-mailer";

export default {
  addNotes: async (req: any, res: any): Promise<any> => {
    try {
      const { caseId, description, informClient, informTeamMember } = req.body;
      const user = req.user._id;

      // Validate case existence
      const isCaseIdExist: any = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      // Validate client existence
      const clientId = isCaseIdExist.yourClientId;
      const clientData = await ClientModel.findOne({
        _id: clientId,
        isDeleted: false,
      });

      if (!clientData) {
        throw Boom.notFound("Client not found");
      }

      const currentCase = { ...isCaseIdExist?._doc };

      // Send email to the client if informClient.email is true
      if (informClient?.email) {
        if (!clientData.email) {
          throw Boom.notFound("Client email not found");
        }

        const subject = `Notes Notification`;
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50;">Notes Notification</h1>
          <p>Hello ${clientData.fullName || "Client"},</p>
          <p>You have been informed about new notes added to the case:</p>
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

        await sendActivityEmail(clientData.email, user, subject, htmlContent);
      }

      // Filter and notify team members
      const caseTeamMembers = isCaseIdExist.yourTeam || [];
      const informTeamMembers = informTeamMember?.filter((id: any) =>
        caseTeamMembers.includes(id)
      );

      if (informTeamMembers?.length > 0) {
        const teamMembers = await UserModel.find({
          _id: { $in: informTeamMembers },
          isDeleted: false,
        });

        for (const member of teamMembers) {
          if (member.email) {
            const subject = `Notes Notification`;
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h1 style="color: #4CAF50;">Notes Notification</h1>
              <p>Hello ${member?.firstName} ${member?.lastName},</p>
              <p>You have been informed about new notes added to the case:</p>
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

      // Save the notes
      const notes = new NotesModel({
        caseId,
        description,
        addedBy: user,
        informClient,
        informTeamMember,
      });

      await notes.save();

      // Populate the addedBy field in the response
      const notesData = await NotesModel.findById(notes._id).populate({
        path: "addedBy",
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: notesData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteNotes: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        noteId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { noteId } = req.params;

      const noteData = await NotesModel.findOne({
        _id: noteId,
        isDeleted: false,
      });

      if (!noteData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      noteData.isDeleted = true;

      await noteData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: noteData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllNotes: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        caseId = null,
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

      const getAllCaseDocuments = await NotesModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllCaseDocuments,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateNotes: async (req: any, res: any): Promise<any> => {
    try {
      const { caseId, description, noteId } = req.body;

      const isCaseIdExist = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const notes = await NotesModel.findOne({
        _id: noteId,
        isDeleted: false,
      });

      if (!notes) {
        throw Boom.notFound(RESPONSE_MESSAGE.NOTE_NOT_FOUND);
      }

      notes.caseId = caseId;
      notes.description = description;
      notes.updatedBy = req.user._id;

      await notes.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: notes,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
