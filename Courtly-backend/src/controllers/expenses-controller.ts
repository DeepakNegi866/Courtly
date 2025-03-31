import Boom from "boom";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import CaseModel from "../models/case-model";
import ExpensesModel from "../models/expenses-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import { sendActivityEmail } from "../middlewares/node-mailer";

export default {
  addExpenses: async (req: any, res: any): Promise<any> => {
    try {
      const { caseId, type, amount, date, description } = req.body;

      const isCaseExist = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      let expenses = new ExpensesModel({
        caseId,
        type,
        amount,
        description,
        date,
        addedBy: req.user._id,
      });

      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "bill") {
            expenses.bill = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      await expenses.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: expenses,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllExpenses: async (req: any, res: any): Promise<any> => {
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

        if (user.role === "team-member") {
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

      const getAllExpenses = await ExpensesModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllExpenses,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteExpenses: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        expenseId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { expenseId } = req.params;

      const expenseData = await ExpensesModel.findOne({
        _id: expenseId,
        isDeleted: false,
      });

      if (!expenseData) {
        throw Boom.notFound(RESPONSE_MESSAGE.EXPENSES_NOT_FOUND);
      }

      expenseData.isDeleted = true;

      await expenseData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: expenseData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  raise_reimbursement_request: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object({
        expenses: Joi.array().items(Joi.string().required()).required(), // Array of expense IDs
      });

      // Validate request body
      await requestHandler.validateRequest(req.body, schema);

      const { expenses } = req.body;
      const loggedInUserId = req.user._id; // Assuming user ID is available in req.user

      const user = await UserModel.findOne({
        _id: loggedInUserId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      // Fetch all expenses matching the provided IDs, belonging to the logged-in user, and not deleted
      const foundExpenses = await ExpensesModel.find({
        _id: { $in: expenses },
        isDeleted: false,
        addedBy: loggedInUserId,
        reimbursement: null,
      });

      // Check if all requested expenses are found
      if (foundExpenses.length !== expenses.length) {
        throw Boom.notFound(RESPONSE_MESSAGE.EXPENSES_NOT_FOUND);
      }

      // Generate a unique reimbursement ID
      const reimbursedRequestsCount = await ExpensesModel.countDocuments({
        reimbursement: { $ne: null },
      });
      const reimbursementId = `REID-00${reimbursedRequestsCount + 1}`;

      // Update the found expenses as needed
      const updatedExpenses = await Promise.all(
        foundExpenses.map((expense) => {
          expense.reimbursement = "requested"; // Mark as requested
          expense.reimbursement_id = reimbursementId;
          expense.reimbursement_requested_at = new Date(); // Use Date object directly
          return expense.save();
        })
      );

      const findAccountantIdOrganization = await UserModel.find({
        role: "accountant",
        organizationId: user.organizationId,
        isDeleted: false,
      });

      const findAdminIdOrganization = await UserModel.find({
        role: "admin",
        organizationId: user.organizationId,
        isDeleted: false,
      });

      // Extract email addresses of all accountants and admins
      const accountantEmails = findAccountantIdOrganization.map(
        (accountant) => accountant.email
      );
      const adminEmails = findAdminIdOrganization.map((admin) => admin.email);

      const recipientEmails = [...accountantEmails, ...adminEmails, user.email];

      const mailOptions = {
        subject: `Reimbursement Request Raised`,
        to: recipientEmails,
        html: `
        <p>Dear Recipient,</p>
        <p>A new reimbursement request has been raised.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Reimbursement ID:</strong> ${reimbursementId}</li>
          <li><strong>Requested By:</strong> ${user.firstName} ${
          user.lastName
        }</li>
          <li><strong>Request Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Please take necessary action.</p>
        <p>Thank you!</p>
      `,
      };

      // Send email to all recipients
      await sendActivityEmail(
        mailOptions.to as any,
        null,
        mailOptions.subject,
        mailOptions.html
      );
      // Return success response
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: updatedExpenses,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  verify_reimbursement_request: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object({
        expenses: Joi.array().items(Joi.string().required()).required(), // Array of expense IDs
        status: Joi.string().required(),
      });

      // Validate request body
      await requestHandler.validateRequest(req.body, schema);

      const { expenses, status } = req.body;
      const loggedInUserId = req.user._id; // Assuming user ID is available in req.user

      const user = await UserModel.findOne({
        _id: loggedInUserId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      if (
        !(
          user.role === "admin" ||
          user.role === "super-admin" ||
          user.role === "accountant"
        )
      ) {
        throw Boom.forbidden(RESPONSE_MESSAGE.UNAUTHORIZED_ACCESS);
      }

      // Fetch all expenses matching the provided IDs, belonging to the logged-in user, and not deleted
      const foundExpenses = await ExpensesModel.find({
        _id: { $in: expenses },
        isDeleted: false,
        reimbursement: "requested",
      });

      // Check if all requested expenses are found
      if (foundExpenses.length !== expenses.length) {
        throw Boom.notFound(RESPONSE_MESSAGE.EXPENSES_NOT_FOUND);
      }

      // Update the found expenses as needed
      const updatedExpenses = await Promise.all(
        foundExpenses.map((expense) => {
          expense.reimbursement = status; // Mark as requested
          expense.reimbursement_verified_by = req.user._id;
          expense.reimbursement_verified_at = new Date(); // Use Date object directly
          return expense.save();
        })
      );
      const findAccountantIdOrganization = await UserModel.find({
        role: "accountant",
        organizationId: user.organizationId,
        isDeleted: false,
      });

      const findAdminIdOrganization = await UserModel.find({
        role: "admin",
        organizationId: user.organizationId,
        isDeleted: false,
      });

      // Extract emails
      const accountantEmails = findAccountantIdOrganization.map(
        (accountant) => accountant.email
      );
      const adminEmails = findAdminIdOrganization.map((admin) => admin.email);
      const recipientEmails = [...accountantEmails, ...adminEmails, user.email];

      // Create email content based on status
      const emailSubject = `Reimbursement Request ${
        status === "approved" ? "approved" : "rejected"
      }`;
      const emailBody = `
        <p>Dear Recipient,</p>
        <p>The reimbursement request has been <strong>${status}</strong>.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Verified By:</strong> ${req.user.firstName} ${
        req.user.lastName
      }</li>
          <li><strong>Request Status:</strong> ${status}</li>
          <li><strong>Verification Date:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Thank you!</p>
      `;

      // Send email
      await sendActivityEmail(
        recipientEmails as any,
        null,
        emailSubject,
        emailBody
      );

      // Return success response
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: updatedExpenses,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
