import Boom from "boom";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import CaseModel from "../models/case-model";
import OrganizationModel from "../models/organization-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import { sendActivityEmail } from "../middlewares/node-mailer";
const bcrypt = require("bcrypt");

export default {
  adduser: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().optional(),
        email: Joi.string().required(),
        phoneNumber: Joi.number().optional(),
        role: Joi.string().optional(),
        organizationId: Joi.string().optional(),
        password: Joi.string().required(),
        manager: Joi.string().optional(),
        department: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        organizationId,
        manager,
        department,
        password,
      } = req.body;

      const userId = req.user._id;

      const loggedInUser: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });
      const isUserExist = await UserModel.findOne({
        email,
        isDeleted: false,
      });

      if (isUserExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.USER_ALREADY_EXIST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new UserModel({
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        organizationId,
        department,
        manager,
        addedBy: req.user._id,
        password: hashedPassword,
      });

      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "image") {
            user.image = file.filename;
          }
          else if(file.fieldname === "signature")
          {
            user.signature = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      const organizationNewId =
        user?.role == "super-admin"
          ? organizationId
          : loggedInUser?.organizationId;
      const organization = await OrganizationModel.findOne({
        _id: organizationNewId,
        isDeleted: false,
      });

      if (loggedInUser.role === "super-admin") {
        user.organizationId = organizationId;
      }
      if (
        loggedInUser.role === "admin" ||
        loggedInUser.role === "team-member" ||
        loggedInUser.role === "accountant"
      ) {
        user.organizationId = loggedInUser.organizationId;
      }

      await user.save();

      const organizationName = organization?.companyName;
      const newUserEmailHtml = `
      <h3>Welcome to the Team</h3>
      <p>Hello ${firstName},</p>
      <p>You have been added to the team at <strong>${organizationName}</strong> by <strong>${
        loggedInUser.firstName
      } ${loggedInUser.lastName || ""}</strong>.</p>
      <p>Your login credentials:</p>
      <ul>
        <li>Email: ${email}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>
        Please <a href="http://digikase.com" target="_blank">click here</a> to log in to the dashboard and view more details.
      </p>
      <p>Thank you,</p>
      <p>Digi-Kase Team</p>
    `;

      await sendActivityEmail(
        user.email,
        null,
        "Welcome to the Team!",
        newUserEmailHtml
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.USER_ADDED,
        data: user,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getAllUsers: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllUsers = await UserModel.paginate(
        {
          isDeleted: false,
          role: { $ne: "super-admin" },
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllUsers,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  deleteUser: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        userId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { userId } = req.params;

      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      user.isDeleted = true;

      await user.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: user,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getUser: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        userId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);
      const { userId } = req.query;

      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: user,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateUser: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().optional(),
        phoneNumber: Joi.number().optional(),
        role: Joi.string().optional(),
        userId: Joi.string().required(),
        organizationId: Joi.string().optional(),
        manager: Joi.string().optional(),
        department: Joi.string().optional(),
        password: Joi.string().optional(),
        confirmPassword: Joi.string()
          .valid(Joi.ref("password"))
          .optional()
          .messages({
            "any.only": "Confirm password must match the password.",
          }),
        designation: Joi.string().optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postalCode: Joi.string().optional(),
        landmark: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const userToUpdate: any = await UserModel.findOne({
        _id: req.body.userId,
        isDeleted: false,
      });

      if (!userToUpdate) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const loggedInUser = await UserModel.findOne({
        _id: req.user._id,
        isDeleted: false,
      });

      if (!loggedInUser) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const loggedInUserRole = loggedInUser.role;

      // Restrict updates based on roles
      if (loggedInUserRole === "admin" || loggedInUserRole === "accountant") {
        if (
          userToUpdate._id.toString() !== req.user._id.toString() && // Not the admin's own account
          userToUpdate.organizationId.toString() !==
            loggedInUser.organizationId.toString()
        ) {
          throw Boom.forbidden(
            "Admins can only update their own data or users in their organization."
          );
        }
      } else if (
        loggedInUserRole === "teammember" &&
        userToUpdate._id.toString() !== req.user._id.toString()
      ) {
        throw Boom.forbidden("Teammembers can only update their own data.");
      }

      // Password update logic
      if (req.body.password) {
        if (
          loggedInUserRole === "super-admin" || // Super-admin can change any password
          req.body.userId === String(req.user._id) || // Users can change their own password
          (loggedInUserRole === "admin" && // Admins can change passwords for users in the same organization
            userToUpdate.organizationId.toString() ===
              loggedInUser.organizationId.toString())
        ) {
          const hashedPassword = await bcrypt.hash(req.body.password, 10);
          userToUpdate.password = hashedPassword;
        } else {
          throw Boom.forbidden("You are not authorized.");
        }
      }

      // Update only provided fields
      const updatableFields = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "designation",
        "address",
        "manager",
        "department",
        "city",
        "state",
        "postalCode",
        "landmark",
        "description",
      ];

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          userToUpdate[field] = req.body[field];
        }
      });

      if (
        loggedInUserRole == "super-admin" ||
        loggedInUserRole == "admin" ||
        loggedInUserRole == "accountant"
      ) {
        if (req.body.role) {
          userToUpdate.role = req.body.role;
        }

        if (req.body.organizationId) {
          const isOrganizationExist = await OrganizationModel.findOne({
            _id: req.body.organizationId,
            isDeleted: false,
          });

          if (!isOrganizationExist) {
            throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
          }

          userToUpdate.organizationId = req.body.organizationId;
        }
      }

      // Email uniqueness check
      if (req.body.email) {
        const isUserEmailExist = await UserModel.findOne({
          _id: { $ne: req.body.userId },
          email: req.body.email,
          isDeleted: false,
        });

        if (isUserEmailExist) {
          throw Boom.conflict(RESPONSE_MESSAGE.USER_ALREADY_EXIST);
        }
      }

      // File updates
      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "image") {
            userToUpdate.image = file.filename;
          }
          else if (file.fieldname === "signature") {
            userToUpdate.signature = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      userToUpdate.updatedBy = req.user._id;

      await userToUpdate.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.USER_UPDATED,
        data: userToUpdate,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  changePassword: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        password: Joi.string().required(),
        confirmPassword: Joi.string()
          .valid(Joi.ref("password"))
          .required()
          .messages({
            "any.only": "Confirm password must match the password.",
          }),
      });

      await requestHandler.validateRequest(req.body, schema);

      const loggedInUser: any = await UserModel.findOne({
        _id: req.user._id,
        isDeleted: false,
      });

      if (!loggedInUser) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      // Password update logic
      if (req.body.password) {
        const hashedPassword: any = await bcrypt.hash(req.body.password, 10);
        loggedInUser.password = hashedPassword;
      }

      loggedInUser.updatedBy = req.user._id;

      await loggedInUser.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.USER_UPDATED,
        data: loggedInUser,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateProfile: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().optional(),
        phoneNumber: Joi.number().optional(),
        designation: Joi.string().optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        postalCode: Joi.string().optional(),
        landmark: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const loggedInUser: any = await UserModel.findOne({
        _id: req.user._id,
        isDeleted: false,
      });

      if (!loggedInUser) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      // Update only provided fields
      const updatableFields = [
        "firstName",
        "lastName",
        "email",
        "phoneNumber",
        "designation",
        "address",
        "city",
        "state",
        "postalCode",
        "landmark",
        "description",
      ];

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          loggedInUser[field] = req.body[field];
        }
      });

      // Email uniqueness check
      if (req.body.email && req.body.email !== loggedInUser.email) {
        const isUserEmailExist = await UserModel.findOne({
          _id: { $ne: req.body.userId },
          email: req.body.email,
          isDeleted: false,
        });

        if (isUserEmailExist) {
          throw Boom.conflict(RESPONSE_MESSAGE.USER_ALREADY_EXIST);
        }
      }

      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "image") {
            loggedInUser.image = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      loggedInUser.updatedBy = req.user._id;

      await loggedInUser.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.USER_UPDATED,
        data: loggedInUser,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getAllTeamMembers: async (req: any, res: any): Promise<any> => {
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
        role: { $in: ["admin", "team-member", "super-admin", "accountant"] },
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      let filter: any = { _id: { $ne: userId }, isDeleted: false };

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role == "accountant"
      ) {
        filter.organizationId = user.organizationId;
      }

      if (user.role === "super-admin" && organization) {
        filter.organizationId = organization;
      }

      if (caseId) {
        const caseUsers = await CaseModel.findById(caseId).select("yourTeam");

        if (caseUsers) {
          const teamMembers =
            caseUsers.yourTeam && caseUsers.yourTeam.length > 0
              ? caseUsers.yourTeam
              : [];
          filter._id = { $in: teamMembers };
        }
      }

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [
          {
            path: "addedBy",
          },
        ],
      };

      const getAllTeamMembers = await UserModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllTeamMembers,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getProfile: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: user,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getOrganizationProfile: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const organization = await OrganizationModel.findOne({
        _id: user.organizationId,
        isDeleted: false,
      });

      if (!organization) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: organization,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateOrganizationProfile: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object({
        organizationId: Joi.string().required(),
        companyName: Joi.string().optional(),
        companyEmail: Joi.string().email().optional(),
        website: Joi.string().optional(),
        GSTN: Joi.string().optional(),
        PAN: Joi.string().optional(),
        description: Joi.string().optional(),
        address: Joi.array()
          .items(
            Joi.object({
              city: Joi.string().optional(),
              state: Joi.string().optional(),
              postalCode: Joi.number().optional(),
              officeNumber: Joi.number().optional(),
            })
          )
          .optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const loggedInUser = await UserModel.findOne({
        _id: req.user._id,
        isDeleted: false,
      });

      if (!loggedInUser) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      const organization = await OrganizationModel.findOne({
        _id: req.body.organizationId,
        isDeleted: false,
      });

      if (!organization) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const updateData: any = {};
      const updatableFields = [
        "companyName",
        "companyEmail",
        "website",
        "GSTN",
        "PAN",
        "description",
        "address",
      ];

      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "logo") {
            updateData.logo = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedOrganization = await OrganizationModel.findByIdAndUpdate(
        organization._id,
        { $set: updateData },
        { new: true }
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: updatedOrganization,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addUserStatus: async (req: any, res: any): Promise<any> => {
    try {
      const userId = req.user._id;

      const user = await UserModel.findOne({
        _id: userId,
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

      const schema = Joi.object().keys({
        memberId: Joi.string().required(),
        isActive: Joi.boolean().required(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { memberId, isActive } = req.body;

      let teamMember;

      if (user.role === "super-admin") {
        teamMember = await UserModel.findOne({
          _id: memberId,
        });
      } else if (user.role === "admin" || user.role === "accountant") {
        teamMember = await UserModel.findOne({
          _id: memberId,
          organizationId: user.organizationId,
        });
      }

      if (!teamMember) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      teamMember.isActive = isActive;
      await teamMember.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: teamMember,
      });
    } catch (error) {
      // Handle errors
      return responseHandler.handleError(res, error);
    }
  },
};
