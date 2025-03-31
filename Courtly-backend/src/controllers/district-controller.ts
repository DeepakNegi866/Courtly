import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import DistrictModel from "../models/district-model";
import StateModel from "../models/state-model";
import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";

export default {
  addDistrict: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        stateId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, stateId, description } = req.body;

      const isStateExist = await StateModel.findOne({
        _id: stateId,
        isDeleted: false,
      });

      if (!isStateExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_NOT_FOUND);
      }

      const isDistrict = await DistrictModel.findOne({
        title,
        isDeleted: false,
      });

      if (isDistrict) {
        throw Boom.conflict(RESPONSE_MESSAGE.DISTRICT_EXIST);
      }

      const district = new DistrictModel({
        title,
        stateId,
        description,
        addedBy: req.user._id,
      });

      await district.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_ADDED,
        data: district,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getAllDistricts: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: "stateId",
      };
      const getAllDistricts = await DistrictModel.paginate(
        {
          isDeleted: false,
          role: { $ne: "super-admin" },
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllDistricts,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  deleteDistrict: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        districtId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { districtId } = req.params;

      const district = await DistrictModel.findOne({
        _id: districtId,
        isDeleted: false,
      });

      if (!district) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_NOT_FOUND);
      }

      district.isDeleted = true;

      await district.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: district,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateDistrict: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        districtId: Joi.string().required(),
        stateId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { districtId, stateId } = req.body;

      const isStateExist = await StateModel.findOne({
        _id: stateId,
        isDeleted: false,
      });

      if (!isStateExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_NOT_FOUND);
      }

      const district = await DistrictModel.findOne({
        _id: districtId,
        isDeleted: false,
      });

      if (!district) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_NOT_FOUND);
      }

      district.title = req.body.title;
      district.description = req.body.description;
      district.stateId = req.body.stateId;

      await district.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_UPDATED,
        data: district,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
