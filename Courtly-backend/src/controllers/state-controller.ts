import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";
import StateModel from "../models/state-model";

export default {
  addState: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isHighcourtExist = await StateModel.findOne({
        title,
        isDeleted: false,
      });

      if (isHighcourtExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.STATE_EXIST);
      }

      const state = new StateModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await state.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.STATE_ADDED,
        data: state,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  getAllStates: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllStates = await StateModel.paginate(
        {
          isDeleted: false,
          role: { $ne: "super-admin" },
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllStates,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  deleteState: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        stateId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { stateId } = req.params;

      const state = await StateModel.findOne({
        _id: stateId,
        isDeleted: false,
      });

      if (!state) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_NOT_FOUND);
      }

      state.isDeleted = true;

      await state.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: state,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateState: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        stateId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { stateId } = req.body;

      const state = await StateModel.findOne({
        _id: stateId,
        isDeleted: false,
      });

      if (!state) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_NOT_FOUND);
      }

      state.title = req.body.title;
      state.description = req.body.description;

      await state.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_UPDATED,
        data: state,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
