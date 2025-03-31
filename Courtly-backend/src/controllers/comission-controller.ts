import Boom from "boom";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import districtComissionsModel from "../models/comissions-district-model";
import ComissionsModel from "../models/comissions-model";
import StateComissionModel from "../models/comissions-state-model";
import { requestHandler, responseHandler } from "../utils";
import BenchescomissionsModel from "../models/comissions-benches-model";
import ComissionRateAuthorityModel from "../models/comissionrate-authority-model";
import LokAdalatModel from "../models/lok-adalat-model";
import RevenueCourtsModel from "../models/revenue-courts-model";
import TribunalsAuthoritiesModel from "../models/tribunal-authorities-model";
import DepartmentModel from "../models/department-model";
import DepartmentAuthorityModel from "../models/department-authority-model";
import { populate } from "dotenv";

export default {
  addComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        type: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { type, title, description } = req.body;

      const isComissionExist = await ComissionsModel.findOne({
        title,
        isDeleted: false,
      });

      if (isComissionExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.COMISSION_ALREADY_EXIST);
      }

      const comission = new ComissionsModel({
        type,
        title,
        description,
        addedBy: req.user._id,
      });

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_ADDED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        comissionId: Joi.string().required(),
        type: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { comissionId, type, title, description } = req.body;

      const isComissionExist = await ComissionsModel.findOne({
        _id: comissionId,
        isDeleted: false,
      });

      if (!isComissionExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_NOT_FOUND);
      }

      isComissionExist.type = type;
      isComissionExist.title = title;
      isComissionExist.description = description;

      await isComissionExist.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_UPDATED,
        data: isComissionExist,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllComissions: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllComissions = await ComissionsModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllComissions,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        comissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);

      const { comissionId } = req.query;

      const comission = await ComissionsModel.findOne({
        _id: comissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        comissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { comissionId } = req.params;

      const comission = await ComissionsModel.findOne({
        _id: comissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_NOT_FOUND);
      }

      comission.isDeleted = true;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addStateComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isComissionExist = await StateComissionModel.findOne({
        title,
        isDeleted: false,
      });

      if (isComissionExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.STATE_COMISSION_ALREADY_EXIST);
      }

      const comission = new StateComissionModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.STATE_COMISSION_ADDED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateStateComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        stateComissionId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { stateComissionId } = req.body;

      const comission = await StateComissionModel.findOne({
        _id: stateComissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_COMISSION_NOT_FOUND);
      }

      comission.title = req.body.title;
      comission.description = req.body.description;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.STATE_COMISSION_UPDATED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllStateComissions: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllStateComissions = await StateComissionModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllStateComissions,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getStateComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        stateComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);

      const { stateComissionId } = req.query;

      const stateComission = await StateComissionModel.findOne({
        _id: stateComissionId,
        isDeleted: false,
      });

      if (!stateComission) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_COMISSION_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: stateComission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteStateComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        stateComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { stateComissionId } = req.params;

      const comission = await StateComissionModel.findOne({
        _id: stateComissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_NOT_FOUND);
      }

      comission.isDeleted = true;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addDistrictComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
        stateComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description, stateComissionId } = req.body;

      const isComissionExist = await districtComissionsModel.findOne({
        title,
        isDeleted: false,
      });

      if (isComissionExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.DISTRICT_COMISSION_ALREADY_EXIST);
      }

      const isStateComissionExist = await StateComissionModel.findOne({
        _id: stateComissionId,
        isDeleted: false,
      });

      if (!isStateComissionExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_COMISSION_NOT_FOUND);
      }

      const comission = new districtComissionsModel({
        title,
        description,
        stateComissionId,
        addedBy: req.user._id,
      });

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_ADDED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateDistrictComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        districtComissionId: Joi.string().required(),
        stateComissionId: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { districtComissionId, stateComissionId, title, description } =
        req.body;

      const comission = await districtComissionsModel.findOne({
        _id: districtComissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.STATE_COMISSION_NOT_FOUND);
      }

      if (stateComissionId) {
        const isStateComissionExist = await StateComissionModel.findOne({
          _id: stateComissionId,
          isDeleted: false,
        });

        if (!isStateComissionExist) {
          throw Boom.notFound(RESPONSE_MESSAGE.STATE_COMISSION_NOT_FOUND);
        }
      }

      comission.title = title;
      comission.description = description;

      if (stateComissionId) {
        comission.stateComissionId = stateComissionId;
      }

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_UPDATED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllDistrictComissions: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: "stateComissionId",
      };
      const getAllDistrictComissions = await districtComissionsModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllDistrictComissions,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getDistrictComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        districtComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);

      const { districtComissionId } = req.query;

      const districtComission = await districtComissionsModel.findOne({
        _id: districtComissionId,
        isDeleted: false,
      });

      if (!districtComission) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_COMISSION_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: districtComission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteDistrictComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        districtComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { districtComissionId } = req.params;

      const comission = await districtComissionsModel.findOne({
        _id: districtComissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.DISTRICT_COMISSION_NOT_FOUND);
      }

      comission.isDeleted = true;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addBenchesComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const benchesComission = new BenchescomissionsModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await benchesComission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: benchesComission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateBenchesComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        benchesComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { benchesComissionId, title, description } = req.body;

      const benchesComission = await BenchescomissionsModel.findOne({
        _id: benchesComissionId,
        isDeleted: false,
      });

      if (!benchesComission) {
        throw Boom.notFound(RESPONSE_MESSAGE.BENCHES_COMISSION_NOT_FOUND);
      }

      benchesComission.title = title;
      benchesComission.description = description;

      await benchesComission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: benchesComission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllBenchesComissions: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllBenchesComissions = await BenchescomissionsModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllBenchesComissions,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getBenchesComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        benchesComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.query, schema);

      const { benchesComissionId } = req.query;

      const benchesComission = await BenchescomissionsModel.findOne({
        _id: benchesComissionId,
        isDeleted: false,
      });

      if (!benchesComission) {
        throw Boom.notFound(RESPONSE_MESSAGE.BENCHES_COMISSION_NOT_FOUND);
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: benchesComission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteBenchesComission: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        benchesComissionId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { benchesComissionId } = req.params;

      const comission = await BenchescomissionsModel.findOne({
        _id: benchesComissionId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.BENCHES_COMISSION_NOT_FOUND);
      }

      comission.isDeleted = true;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addComissionRateAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isComissionExist = await ComissionRateAuthorityModel.findOne({
        title,
        isDeleted: false,
      });

      if (isComissionExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.COMISSION_RATE_ALREADY_EXISTS);
      }

      const comission = new ComissionRateAuthorityModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_RATE_ADDED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateComissionRateAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        comissionRateAuthorityId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { comissionRateAuthorityId, title, description } = req.body;

      const comission = await ComissionRateAuthorityModel.findOne({
        _id: comissionRateAuthorityId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_RATE_NOT_FOUND);
      }

      comission.title = title;
      comission.description = description;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.COMISSION_RATE_UPDATED,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllComissionRateAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllComissionRateAuthority =
        await ComissionRateAuthorityModel.paginate(
          {
            isDeleted: false,
          },
          options
        );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllComissionRateAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteComissionRateAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        comissionRateAuthorityId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { comissionRateAuthorityId } = req.params;

      const comission = await ComissionRateAuthorityModel.findOne({
        _id: comissionRateAuthorityId,
        isDeleted: false,
      });

      if (!comission) {
        throw Boom.notFound(RESPONSE_MESSAGE.COMISSION_RATE_NOT_FOUND);
      }

      comission.isDeleted = true;

      await comission.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: comission,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addLokAdalat: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isLokAdalatExist = await LokAdalatModel.findOne({
        title,
        isDeleted: false,
      });

      if (isLokAdalatExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.LOK_ADALAT_ALREADY_EXISTS);
      }

      const lokAdalat = new LokAdalatModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await lokAdalat.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.LOK_ADALAT_ADDED,
        data: lokAdalat,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateLokAdalat: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        lokAdalatId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { lokAdalatId, title, description } = req.body;

      const lokAdalat = await LokAdalatModel.findOne({
        _id: lokAdalatId,
        isDeleted: false,
      });

      if (!lokAdalat) {
        throw Boom.notFound(RESPONSE_MESSAGE.LOK_ADALAT_NOT_FOUND);
      }

      lokAdalat.title = title;
      lokAdalat.description = description;

      await lokAdalat.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.LOK_ADALAT_UPDATED,
        data: lokAdalat,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllLokAdalat: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllLokAdalat = await LokAdalatModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllLokAdalat,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteLokAdalat: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        lokAdalatId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { lokAdalatId } = req.params;

      const lokAdalat = await LokAdalatModel.findOne({
        _id: lokAdalatId,
        isDeleted: false,
      });

      if (!lokAdalat) {
        throw Boom.notFound(RESPONSE_MESSAGE.LOK_ADALAT_NOT_FOUND);
      }

      lokAdalat.isDeleted = true;

      await lokAdalat.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.LOK_ADALAT_DELETED,
        data: lokAdalat,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addRevenueCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isRevenueCourtExist = await RevenueCourtsModel.findOne({
        title,
        isDeleted: false,
      });

      if (isRevenueCourtExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.REVENUE_COURT_ALREADY_EXISTS);
      }

      const revenueCourt = new RevenueCourtsModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await revenueCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.REVENUE_COURT_ADDED,
        data: revenueCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateRevenueCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        revenueCourtId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { revenueCourtId, title, description } = req.body;

      const revenueCourt = await RevenueCourtsModel.findOne({
        _id: revenueCourtId,
        isDeleted: false,
      });

      if (!revenueCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.REVENUE_COURT_NOT_FOUND);
      }

      revenueCourt.title = title;
      revenueCourt.description = description;

      await revenueCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.REVENUE_COURT_UPDATED,
        data: revenueCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllRevenueCourt: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllRevenueCourt = await RevenueCourtsModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllRevenueCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteRevenueCourt: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        revenueCourtId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { revenueCourtId } = req.params;

      const revenueCourt = await RevenueCourtsModel.findOne({
        _id: revenueCourtId,
        isDeleted: false,
      });

      if (!revenueCourt) {
        throw Boom.notFound(RESPONSE_MESSAGE.REVENUE_COURT_NOT_FOUND);
      }

      revenueCourt.isDeleted = true;

      await revenueCourt.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.REVENUE_COURT_DELETED,
        data: revenueCourt,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addTribunalAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isTribunalAuthorityExist = await TribunalsAuthoritiesModel.findOne({
        title,
        isDeleted: false,
      });

      if (isTribunalAuthorityExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_ALREADY_EXISTS);
      }

      const tribunalAuthority = new TribunalsAuthoritiesModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await tribunalAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_ADDED,
        data: tribunalAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateTribunalAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        tribunalAuthorityId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { tribunalAuthorityId, title, description } = req.body;

      const tribunalAuthority = await TribunalsAuthoritiesModel.findOne({
        _id: tribunalAuthorityId,
        isDeleted: false,
      });

      if (!tribunalAuthority) {
        throw Boom.notFound(RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_NOT_FOUND);
      }

      tribunalAuthority.title = title;
      tribunalAuthority.description = description;

      await tribunalAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_UPDATED,
        data: tribunalAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllTribunalAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllTribunalAuthority = await TribunalsAuthoritiesModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllTribunalAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteTribunalAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        tribunalAuthorityId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { tribunalAuthorityId } = req.params;

      const tribunalAuthority = await TribunalsAuthoritiesModel.findOne({
        _id: tribunalAuthorityId,
        isDeleted: false,
      });

      if (!tribunalAuthority) {
        throw Boom.notFound(RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_NOT_FOUND);
      }

      tribunalAuthority.isDeleted = true;

      await tribunalAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.TRIBUNAL_AUTHORITY_DELETED,
        data: tribunalAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addDepartment: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { title, description } = req.body;

      const isDepartmentExist = await DepartmentModel.findOne({
        title,
        isDeleted: false,
      });

      if (isDepartmentExist) {
        throw Boom.conflict(RESPONSE_MESSAGE.DEPARTMENT_ALREADY_EXISTS);
      }

      const department = new DepartmentModel({
        title,
        description,
        addedBy: req.user._id,
      });

      await department.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_ADDED,
        data: department,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateDepartment: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        departmentId: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { departmentId, title, description } = req.body;

      const department = await DepartmentModel.findOne({
        _id: departmentId,
        isDeleted: false,
      });

      if (!department) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_NOT_FOUND);
      }

      department.title = title;
      department.description = description;

      await department.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_UPDATED,
        data: department,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllDepartments: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllDepartments = await DepartmentModel.paginate(
        {
          isDeleted: false,
        },
        options
      );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllDepartments,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteDepartment: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        departmentId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { departmentId } = req.params;

      const department = await DepartmentModel.findOne({
        _id: departmentId,
        isDeleted: false,
      });

      if (!department) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_NOT_FOUND);
      }

      department.isDeleted = true;

      await department.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_DELETED,
        data: department,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addDepartmentAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        departmentId: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { departmentId, title, description } = req.body;

      const department = await DepartmentModel.findOne({
        _id: departmentId,
        isDeleted: false,
      });

      if (!department) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_NOT_FOUND);
      }

      const departmentAuthority = new DepartmentAuthorityModel({
        departmentId,
        title,
        addedBy: req.user._id,
        description,
      });

      await departmentAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_AUTHORITY_ADDED,
        data: departmentAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateDepartmentAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        departmentAuthorityId: Joi.string().required(),
        title: Joi.string().optional(),
        departmentId: Joi.string().optional(),
        description: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { departmentAuthorityId, title, departmentId, description } =
        req.body;

      const departmentAuthority = await DepartmentAuthorityModel.findOne({
        _id: departmentAuthorityId,
        isDeleted: false,
      });

      if (!departmentAuthority) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_AUTHORITY_NOT_FOUND);
      }

      const department = await DepartmentModel.findOne({
        _id: departmentId,
        isDeleted: false,
      });

      if (!department) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_NOT_FOUND);
      }

      departmentAuthority.title = title;
      departmentAuthority.departmentId = departmentId;
      departmentAuthority.description = description;

      await departmentAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_AUTHORITY_UPDATED,
        data: departmentAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllDepartmentAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: { path: "departmentId" },
      };
      const getAllDepartmentAuthorities =
        await DepartmentAuthorityModel.paginate(
          {
            isDeleted: false,
          },
          options
        );
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllDepartmentAuthorities,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteDepartmentAuthority: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        departmentAuthorityId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { departmentAuthorityId } = req.params;

      const departmentAuthority = await DepartmentAuthorityModel.findOne({
        _id: departmentAuthorityId,
        isDeleted: false,
      });

      if (!departmentAuthority) {
        throw Boom.notFound(RESPONSE_MESSAGE.DEPARTMENT_AUTHORITY_NOT_FOUND);
      }

      departmentAuthority.isDeleted = true;

      await departmentAuthority.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.DEPARTMENT_AUTHORITY_DELETED,
        data: departmentAuthority,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
