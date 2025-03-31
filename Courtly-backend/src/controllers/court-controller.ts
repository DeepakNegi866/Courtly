import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import CourtModel from "../models/court-model";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import Boom from "boom";

export default {
  addCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const court = new CourtModel({
        title: req.body.title,
        description: req.body.description,
        addedBy: req.user._id,
      });

      await court.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COURT_ADDED_SUCCESSFULLY,
        data: court,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        courtId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { courtId } = req.params;

      const CourtData = await CourtModel.findOne({
        _id: courtId,
        isDeleted: false,
      });

      if (!CourtData) {
        throw Boom.notFound(RESPONSE_MESSAGE.COURT_NOT_FOUND);
      }

      CourtData.isDeleted = true;

      await CourtData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: CourtData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        courtId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { courtId } = req.body;

      const CourtData = await CourtModel.findOne({
        _id: courtId,
        isDeleted: false,
      });

      if (!CourtData) {
        throw Boom.notFound(RESPONSE_MESSAGE.COURT_NOT_FOUND);
      }

      CourtData.title = req.body.title;
      CourtData.description = req.body.description;
      CourtData.updatedBy = req.user._id;

      await CourtData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: CourtData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllCourts: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const options: any = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const getAllCourts = await CourtModel.paginate({}, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllCourts,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
