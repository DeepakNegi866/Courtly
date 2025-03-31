import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import ClientModel from "../models/client-model";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import Boom from "boom";
import OrganizationModel from "../models/organization-model";
import UserModel from "../models/user-model";

export default {
  addClient: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        fullName: Joi.string().required(),
        email: Joi.string().optional(),
        nickName: Joi.string().required(),
        age: Joi.number().optional(),
        phoneNumber: Joi.number().optional(),
        fatherName: Joi.string().optional(),
        companyName: Joi.string().optional(),
        website: Joi.string().optional(),
        TIN: Joi.string().optional(),
        GSTN: Joi.string().optional(),
        PAN: Joi.string().optional(),
        hourlyRate: Joi.number().optional(),
        officeAddress: Joi.object().keys({
          address1: Joi.string().optional(),
          address2: Joi.string().optional(),
          city: Joi.string().optional(),
          postalCode: Joi.number().optional(),
          country: Joi.string().optional(),
          state: Joi.string().optional(),
        }),
        homeAddress: Joi.object().keys({
          address1: Joi.string().optional(),
          address2: Joi.string().optional(),
          city: Joi.string().optional(),
          postalCode: Joi.number().optional(),
          country: Joi.string().optional(),
          state: Joi.string().optional(),
        }),
        contacts: Joi.object()
          .keys({
            fullName: Joi.string().optional(),
            email: Joi.string().optional(),
            phoneNumber: Joi.number().optional(),
            designation: Joi.string().optional(),
          })
          .optional(),
        organizationId: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        fullName,
        email,
        age,
        nickName,
        phoneNumber,
        fatherName,
        companyName,
        website,
        TIN,
        GSTN,
        PAN,
        hourlyRate,
        officeAddress,
        homeAddress,
        contacts,
      } = req.body;

      const userId = req.user._id;

      const user = await UserModel.findOne({ _id: userId, isDeleted: false });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      let organizationId = req.body.organizationId;

      if (
        user.role === "admin" ||
        user.role === "team-member" ||
        user.role === "accountant"
      ) {
        organizationId = user.organizationId;
      }

      const isOrgnizationExist = await OrganizationModel.findOne({
        _id: organizationId,
        isDeleted: false,
      });

      if (!isOrgnizationExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const isClientExist = await ClientModel.findOne({
        nickName,
        isDeleted: false,
      });

      if (isClientExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.CLIENT_ALREADY_EXIST);
      }

      const client = new ClientModel({
        fullName,
        email,
        nickName,
        age,
        phoneNumber,
        fatherName,
        companyName,
        website,
        TIN,
        GSTN,
        PAN,
        hourlyRate,
        officeAddress,
        homeAddress,
        addedBy: req.user._id,
        contacts,
        organizationId,
      });

      await client.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.CLIENT_ADDED,
        data: client,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllClients: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };

      const userId = req.user._id;

      const userOrganization: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      let filter: any = { isDeleted: false };

      if (
        userOrganization.organizationId &&
        userOrganization.role !== "super-admin"
      ) {
        filter.organizationId = userOrganization.organizationId;
      }

      if (userOrganization.role === "super-admin") {
        filter = { isDeleted: false };
      }

      const getAllClients = await ClientModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllClients,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteClient: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        clientId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { clientId } = req.params;

      const client = await ClientModel.findOne({
        _id: clientId,
        isDeleted: false,
      });

      if (!client) {
        throw Boom.notFound(RESPONSE_MESSAGE.CLIENT_NOT_FOUND);
      }

      client.isDeleted = true;

      await client.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: client,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getClient: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        clientId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);

      const { clientId } = req.query;

      const client = await ClientModel.findOne({
        _id: clientId,
        isDeleted: false,
      });

      if (!client) {
        throw Boom.notFound(RESPONSE_MESSAGE.CLIENT_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: client,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateClient: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        clientId: Joi.string().required(),
        fullName: Joi.string().optional(),
        email: Joi.string().optional(),
        age: Joi.number().optional(),
        phoneNumber: Joi.number().optional(),
        fatherName: Joi.string().optional(),
        nickName: Joi.string().required(),
        companyName: Joi.string().optional(),
        website: Joi.string().optional(),
        TIN: Joi.string().optional(),
        GSTN: Joi.string().optional(),
        PAN: Joi.string().optional(),
        hourlyRate: Joi.number().optional(),
        officeAddress: Joi.object()
          .keys({
            address1: Joi.string().optional(),
            address2: Joi.string().optional(),
            city: Joi.string().optional(),
            postalCode: Joi.number().optional(),
            country: Joi.string().optional(),
            state: Joi.string().optional(),
          })
          .optional(),
        homeAddress: Joi.object()
          .keys({
            address1: Joi.string().optional(),
            address2: Joi.string().optional(),
            city: Joi.string().optional(),
            postalCode: Joi.number().optional(),
            country: Joi.string().optional(),
            state: Joi.string().optional(),
          })
          .optional(),
        contacts: Joi.object()
          .keys({
            fullName: Joi.string().optional(),
            email: Joi.string().optional(),
            phoneNumber: Joi.number().optional(),
            designation: Joi.string().optional(),
          })
          .optional(),
        organizationId: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const {
        clientId,
        fullName,
        email,
        age,
        phoneNumber,
        fatherName,
        nickName,
        companyName,
        website,
        TIN,
        GSTN,
        PAN,
        hourlyRate,
        officeAddress,
        homeAddress,
        contacts,
      } = req.body;

      const userId = req.user._id;

      const user = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      let organizationId = req.body.organizationId;

      if (
        user.role === "team-member" ||
        user.role === "admin" ||
        user.role === "accountant"
      ) {
        organizationId = user.organizationId;
      }

      // Find the client to update
      const client = await ClientModel.findOne({
        _id: clientId,
        isDeleted: false,
      });

      if (!client) {
        throw Boom.notFound(RESPONSE_MESSAGE.CLIENT_NOT_FOUND);
      }

      // Check if the organization exists
      const isOrganizationExist = await OrganizationModel.findOne({
        _id: organizationId,
        isDeleted: false,
      });

      if (!isOrganizationExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      if (nickName) {
        const isClientExist = await ClientModel.findOne({
          nickName,
          _id: { $ne: clientId },
          isDeleted: false,
        });

        if (isClientExist) {
          throw Boom.conflict(RESPONSE_MESSAGE.CLIENT_ALREADY_EXIST);
        }
      }

      // Update client details
      if (fullName !== undefined) client.fullName = fullName;
      if (email !== undefined) client.email = email;
      if (age !== undefined) client.age = age;
      if (phoneNumber !== undefined) client.phoneNumber = phoneNumber;
      if (fatherName !== undefined) client.fatherName = fatherName;
      if (nickName !== undefined) client.nickName = nickName;
      if (companyName !== undefined) client.companyName = companyName;
      if (website !== undefined) client.website = website;
      if (TIN !== undefined) client.TIN = TIN;
      if (GSTN !== undefined) client.GSTN = GSTN;
      if (PAN !== undefined) client.PAN = PAN;
      if (hourlyRate !== undefined) client.hourlyRate = hourlyRate;
      if (officeAddress !== undefined) client.officeAddress = officeAddress;
      if (homeAddress !== undefined) client.homeAddress = homeAddress;
      if (contacts !== undefined) client.contacts = contacts;

      client.organizationId = organizationId;

      await client.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: client,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
