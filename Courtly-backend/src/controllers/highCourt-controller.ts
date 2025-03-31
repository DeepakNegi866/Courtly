import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import HighCourtModel from "../models/hightCourt-model";
import Joi from "joi";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";
import HighCourtBenchesModel from "../models/high-court-benches-model";
import { populate } from "dotenv";

export default {
  addhighcourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isHighcourtExist = await HighCourtModel.findOne({
        title,
        isDeleted: false,
      });

      if (isHighcourtExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.HIGH_COURT_EXIST);
      }

      const highCourt = new HighCourtModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await highCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.HIGH_COURT_ADDED,
        data: highCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllHighCourts: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllHighCourts = await HighCourtModel.paginate(
        {
          isDeleted: false,
          role: { $ne: "super-admin" },
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllHighCourts,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteHighCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        highCourtId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { highCourtId } = req.params;

      const highCourt = await HighCourtModel.findOne({
        _id: highCourtId,
        isDeleted: false,
      });

      if (!highCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.HIGH_COURT_NOT_FOUND);
      }

      highCourt.isDeleted = true;

      await highCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: highCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateHighCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        highCourtId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { highCourtId } = req.body;

      const highCourt = await HighCourtModel.findOne({
        _id: highCourtId,
        isDeleted: false,
      });

      if (!highCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.HIGH_COURT_NOT_FOUND);
      }

      highCourt.title = req.body.title;
      highCourt.description = req.body.description;

      await highCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DISTRICT_UPDATED,
        data: highCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  // High Court Benches Controller

  addHighCourtBenches: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        highCourtId: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, highCourtId, description } = req.body;

      const isHighCourt = await HighCourtModel.findOne({
        _id: highCourtId,
        isDeleted: false,
      });

      if (!isHighCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.HIGH_COURT_NOT_FOUND);
      }

      const highCourtBenches = new HighCourtBenchesModel({
        title,
        highCourtId,
        description,
        addedBy: req.user._id,
      });

      await highCourtBenches.save();

      const populatedHighCourtBenches = await HighCourtBenchesModel.findOne({
        _id: highCourtBenches._id,
      }).populate([
        {
          path: "highCourtId",
        },
        {
          path: "addedBy",
        },
      ]);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.HIGH_COURT_BENCHES_ADDED,
        data: populatedHighCourtBenches,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllHighCourtBenches: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: [{ path: "highCourtId" }, { path: "addedBy" }],
      };

      const getAllHighCourtBenches = await HighCourtBenchesModel.paginate(
        { isDeleted: false },
        options
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllHighCourtBenches,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteHighCourtBenches: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        highCourtBencheId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { highCourtBencheId } = req.params;

      const highCourtBenchesData = await HighCourtBenchesModel.findOne({
        _id: highCourtBencheId,
        isDeleted: false,
      });

      if (!highCourtBenchesData) {
        throw Boom.notFound(RESPONSE_MESSAGE.HIGH_COURT_BENCHES_NOT_FOUND);
      }

      highCourtBenchesData.isDeleted = true;

      await highCourtBenchesData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: highCourtBenchesData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateHighCourtBenches: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().optional(),
        highCourtBencheId: Joi.string().required(),
        description: Joi.string().optional(),
        highCourtId: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, highCourtBencheId, description, highCourtId } = req.body;

      const highCourtBenchesData = await HighCourtBenchesModel.findOne({
        _id: highCourtBencheId,
        isDeleted: false,
      });

      if (!highCourtBenchesData) {
        throw Boom.notFound(RESPONSE_MESSAGE.HIGH_COURT_BENCHES_NOT_FOUND);
      }

      highCourtBenchesData.title = title;
      highCourtBenchesData.description = description;
      highCourtBenchesData.highCourtId = highCourtId;

      await highCourtBenchesData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: highCourtBenchesData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
