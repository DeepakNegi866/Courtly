import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import { sendEmail } from "../middlewares/node-mailer";
import OrganizationModel from "../models/organization-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";

export default {
  addOrganization: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        companyName: Joi.string().optional(),
        companyEmail: Joi.string().optional(),
        website: Joi.string().optional(),
        GSTN: Joi.string().optional(),
        PAN: Joi.string().optional(),
        description: Joi.string().optional(),
        address: Joi.array().items({
          city: Joi.string().optional(),
          state: Joi.string().optional(),
          postalCode: Joi.number().optional(),
          officeNumber: Joi.number().optional(),
        }),
        firstName: Joi.string().optional(),
        lastName: Joi.string().optional(),
        email: Joi.string().optional(),
        role: Joi.string().optional(),
        phoneNumber: Joi.number().optional(),
        status: Joi.boolean().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        companyName,
        companyEmail,
        website,
        GSTN,
        PAN,
        description,
        address,
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        status,
      } = req.body;

      const files = req.files ? req.files : null;

      const superAdmin = req.user._id;

      const isCompanyEmailExist = await OrganizationModel.findOne({
        companyEmail,
        isDeleted: false,
      });
      const isCompanyNameExist = await OrganizationModel.findOne({
        companyName,
        isDeleted: false,
      });

      if (isCompanyEmailExist || isCompanyNameExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.ORGANIZATION_ALREADY_EXIST);
      }

      const isUserEmailExist = await UserModel.findOne({
        email,
        isDeleted: false,
      });
      if (isUserEmailExist) {
        throw Boom.conflict("This user associated with another organization.");
      }

      let organizationData = new OrganizationModel({
        companyName,
        companyEmail,
        website,
        GSTN,
        PAN,
        description,
        addedBy: superAdmin,
        address,
      });

      if (files && Array.isArray(files)) {
        files.forEach((file) => {
          if (file.fieldname === "logo") {
            organizationData.logo = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
      }
      await organizationData.save();

      let userData = new UserModel({
        firstName,
        lastName,
        email,
        role,
        phoneNumber,
        status,
        createdBy: superAdmin,
        organizationId: organizationData._id,
      });

      if (files && Array.isArray(files)) {
        const uploadPromises = files.map(async (file) => {
          if (file.fieldname === "image") {
            userData.image = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      await userData.save();
      await sendEmail(email, null, null, null);

      return responseHandler.handleSuccess(res, {
        statusCode: 200,
        message: RESPONSE_MESSAGE.ORGANIZATION_ADDED,
        data: organizationData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllOrganizations: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllOrganizations = await OrganizationModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllOrganizations,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getOrganization: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        organizationId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);
      const { organizationId } = req.query;

      const organization = await OrganizationModel.findOne({
        _id: organizationId,
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
  deleteOrganization: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        organizationId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { organizationId } = req.params;

      const organization = await OrganizationModel.findOne({
        _id: organizationId,
        isDeleted: false,
      });

      if (!organization) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      organization.isDeleted = true;

      const userOrganization = await UserModel.find({
        organizationId: organizationId,
        isDeleted: false,
      });

      const allUsersSameOrganization = userOrganization.map((user) => {
        user.isDeleted = true;
        return user.save();
      });

      await Promise.all(allUsersSameOrganization);

      await organization.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: organization,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateOrganization: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        organizationId: Joi.string().required(),
        companyName: Joi.string().optional(),
        companyEmail: Joi.string().optional(),
        website: Joi.string().optional(),
        GSTN: Joi.string().optional(),
        PAN: Joi.string().optional(),
        description: Joi.string().optional(),
        address: Joi.array().items({
          city: Joi.string().optional(),
          state: Joi.string().optional(),
          postalCode: Joi.number().optional(),
          officeNumber: Joi.number().optional(),
        }),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { organizationId } = req.body;

      const organization = await OrganizationModel.findOne({
        _id: organizationId,
        isDeleted: false,
      });

      if (!organization) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const isCompanyEmailExist = await OrganizationModel.findOne({
        _id: { $ne: organizationId },
        companyEmail: req.body.companyEmail,
        isDeleted: false,
      });

      const isCompanyNameExist = await OrganizationModel.findOne({
        _id: { $ne: organizationId },
        companyName: req.body.companyName,
        isDeleted: false,
      });

      if (isCompanyNameExist || isCompanyEmailExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.ORGANIZATION_ALREADY_EXIST);
      }

      if (req.files && Array.isArray(req.files)) {
        const files = req.files;
        const uploadPromises = files.map(async (file: any) => {
          if (file.fieldname === "logo") {
            organization.logo = file.filename;
          } else {
            console.log("Unrecognized file fieldname:::::", file.fieldname);
          }
        });
        await Promise.all(uploadPromises);
      }

      organization.companyName = req.body.companyName;
      organization.companyEmail = req.body.companyEmail;
      organization.website = req.body.website;
      organization.GSTN = req.body.GSTN;
      organization.PAN = req.body.PAN;
      organization.description = req.body.description;
      organization.address = req.body.address;

      await organization.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.ORGANIZATION_UPDATED,
        data: organization,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
