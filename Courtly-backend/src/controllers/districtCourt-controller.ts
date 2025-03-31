import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import DistrictCourtModel from "../models/districtCourt-model";
import DistrictModel from "../models/district-model";
import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";
import { populate } from "dotenv";

export default {
  addDistrictCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        districtId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, districtId, description } = req.body;

      const isDistrict = await DistrictModel.findOne({
        _id: districtId,
        isDeleted: false,
      });

      if (!isDistrict) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_NOT_FOUND);
      }

      const isDistrictCourt = await DistrictCourtModel.findOne({
        title,
        isDeleted: false,
      });

      if (isDistrictCourt) {
        throw Boom.conflict(RESPONSE_MESSAGE.DISTRICT_COURT_EXIST);
      }

      const districtCourt = new DistrictCourtModel({
        title,
        districtId,
        description,
        addedBy: req.user._id,
      });

      await districtCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_COURT_ADDED,
        data: districtCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllDistrictCourts: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: "districtId",
      };
      const getAllDistrictCourts = await DistrictCourtModel.paginate(
        {
          isDeleted: false,
          role: { $ne: "super-admin" },
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllDistrictCourts,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteDistrictCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        districtCourtId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { districtCourtId } = req.params;

      const districtCourt = await DistrictCourtModel.findOne({
        _id: districtCourtId,
        isDeleted: false,
      });

      if (!districtCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_COURT_NOT_FOUND);
      }

      districtCourt.isDeleted = true;

      await districtCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: districtCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateDistrictCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        districtId: Joi.string().required(),
        districtCourtId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { districtCourtId, districtId } = req.body;

      const isDistrictExist = await DistrictModel.findOne({
        _id: districtId,
        isDeleted: false,
      });

      if (!isDistrictExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.ORGANIZATION_NOT_FOUND);
      }

      const districtCourt = await DistrictCourtModel.findOne({
        _id: districtCourtId,
        isDeleted: false,
      });

      if (!districtCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      districtCourt.title = req.body.title;
      districtCourt.description = req.body.description;
      districtCourt.districtId = req.body.districtId;

      await districtCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_COURT_UPDATED,
        data: districtCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
