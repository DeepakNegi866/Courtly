import Boom from "boom";
import Joi from "joi";
import mongoose from "mongoose";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import CaseTypeModel from "../models/case-type-model";
import CourtModel from "../models/court-model";
import { requestHandler, responseHandler } from "../utils";

export default {
  addCaseType: async (req: any, res: any): Promise<any> => {
    try {
      const caseTypeSchemaJoi = Joi.object({
        title: Joi.string().optional(),
        highCourtId: Joi.string().optional(),
        stateId: Joi.string().optional(),
        districtId: Joi.string().optional(),
        districtCourtId: Joi.string().optional(),
        highCourtBenchId: Joi.string().optional(),
        comissionStateId: Joi.string().optional(),
        comissionDistrictId: Joi.string().optional(),
        comissionBenchId: Joi.string().optional(),
        tribunalAuthorityId: Joi.string().optional(),
        revenueCourtId: Joi.string().optional(),
        comissionerRateAuthorityId: Joi.string().optional(),
        departmentId: Joi.string().optional(),
        departmentAuthorityId: Joi.string().optional(),
        lokAdalatId: Joi.string().optional(),
        court: Joi.string().optional(),
        comissionerRate: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, caseTypeSchemaJoi);

      const caseType = new CaseTypeModel({
        title: req.body.title,
        highCourtId: req.body.highCourtId,
        stateId: req.body.stateId,
        districtId: req.body.districtId,
        districtCourtId: req.body.districtCourtId,
        highCourtBenchId: req.body.highCourtBenchId,
        comissionStateId: req.body.comissionStateId,
        comissionDistrictId: req.body.comissionDistrictId,
        comissionBenchId: req.body.comissionBenchId,
        tribunalAuthorityId: req.body.tribunalAuthorityId,
        revenueCourtId: req.body.revenueCourtId,
        comissionerRateAuthorityId: req.body.comissionerRateAuthorityId,
        departmentId: req.body.departmentId,
        departmentAuthorityId: req.body.departmentAuthorityId,
        lokAdalatId: req.body.lokAdalatId,
        court: req.body.court,
        addedBy: req.user._id,
        comissionerRate: req.body.comissionerRate,
      });

      await caseType.save();
      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.CASE_TYPE_ADDED,
        data: caseType,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllCaseTypes: async (req: any, res: any): Promise<any> => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const options: any = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };
      const getAllCaseTypes = await CaseTypeModel.paginate(
        {
          isDeleted: false,
        },
        {
          ...options,
          populate: {
            path: "court",
          },
        }
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllCaseTypes,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteCaseType: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        caseTypeId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { caseTypeId } = req.params;

      const caseTypeData = await CaseTypeModel.findOne({
        _id: caseTypeId,
        isDeleted: false,
      });

      if (!caseTypeData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_TYPE_NOT_FOUND);
      }

      caseTypeData.isDeleted = true;

      await caseTypeData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: caseTypeData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateCaseType: async (req: any, res: any): Promise<any> => {
    try {
      const caseTypeSchemaJoi = Joi.object({
        title: Joi.string().optional(),
        highCourtId: Joi.string().optional(),
        stateId: Joi.string().optional(),
        highCourtBenchId: Joi.string().optional(),
        districtId: Joi.string().optional(),
        districtCourtId: Joi.string().optional(),
        comissionStateId: Joi.string().optional(),
        comissionDistrictId: Joi.string().optional(),
        comissionBenchId: Joi.string().optional(),
        tribunalAuthorityId: Joi.string().optional(),
        revenueCourtId: Joi.string().optional(),
        comissionerRateAuthorityId: Joi.string().optional(),
        departmentId: Joi.string().optional(),
        departmentAuthorityId: Joi.string().optional(),
        lokAdalatId: Joi.string().optional(),
        caseTypeId: Joi.string().required(),
        court: Joi.string().optional(),
        comissionerRate: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, caseTypeSchemaJoi);

      const caseType = await CaseTypeModel.findOneAndUpdate(
        {
          _id: req.body.caseTypeId,
          isDeleted: false,
        },
        {
          title: req.body.title,
          highCourtId: req.body.highCourtId,
          stateId: req.body.stateId,
          districtId: req.body.districtId,
          districtCourtId: req.body.districtCourtId,
          comissionStateId: req.body.comissionStateId,
          comissionDistrictId: req.body.comissionDistrictId,
          highCourtBenchId: req.body.highCourtBenchId,
          comissionBenchId: req.body.comissionBenchId,
          tribunalAuthorityId: req.body.tribunalAuthorityId,
          revenueCourtId: req.body.revenueCourtId,
          comissionerRateAuthorityId: req.body.comissionerRateAuthorityId,
          departmentId: req.body.departmentId,
          departmentAuthorityId: req.body.departmentAuthorityId,
          lokAdalatId: req.body.lokAdalatId,
          court: req.body.court,
          comissionerRate: req.body.comissionerRate,
        },
        { new: true }
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.CASE_TYPE_UPDATED,
        data: caseType,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getCaseType: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        uniqueCourtId,
        highCourtId,
        stateId,
        districtId,
        tribunalAuthorityId,
        revenueCourtId,
        departmentAuthorityId,
        departmentId,
        lokAdalatId,
        highCourtBenchId,
        comissionerRateAuthorityId,
        commissionBenchId,
      } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
      };

      const court = await CourtModel.findOne({ uniqueCourtId });

      if (!court) {
        throw Boom.notFound(RESPONSE_MESSAGE.COURT_NOT_FOUND);
      }

      const filter: any = {
        $and: [],
        isDeleted: false,
      };

      filter.$and.push({
        $or: [
          { court: court._id },
          { highCourtId: court._id },
          { revenueCourtId: court._id },
          { districtCourtId: court._id },
          { comissionBenchId: court._id },
          { comissionStateId: court._id },
          { comissionDistrictId: court._id },
          { comissionerRateId: court._id },
          { comissionerRateAuthorityId: court._id },
          { departmentAuthorityId: court._id },
          { districtId: court._id },
          { lokAdalatId: court._id },
          { stateId: court._id },
          { tribunalAuthorityId: court._id },
          { commissionBenchId: court._id },
        ],
      });

      if (highCourtId) {
        if (!mongoose.Types.ObjectId.isValid(highCourtId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_HIGH_COURT_ID);
        }

        filter.$and.push({
          highCourtId: new mongoose.Types.ObjectId(highCourtId),
        });
      }

      if (stateId) {
        if (!mongoose.Types.ObjectId.isValid(stateId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_STATE_ID);
        }

        filter.$and.push({
          stateId: new mongoose.Types.ObjectId(stateId),
        });
      }

      if (districtId) {
        if (!mongoose.Types.ObjectId.isValid(districtId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_DISTRICT_ID);
        }

        filter.$and.push({
          districtId: new mongoose.Types.ObjectId(districtId),
        });
      }

      if (tribunalAuthorityId) {
        if (!mongoose.Types.ObjectId.isValid(tribunalAuthorityId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_TRIBUNAL_AUTHORITY_ID);
        }

        filter.$and.push({
          tribunalAuthorityId: new mongoose.Types.ObjectId(tribunalAuthorityId),
        });
      }

      if (revenueCourtId) {
        if (!mongoose.Types.ObjectId.isValid(revenueCourtId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_REVENUE_COURT_ID);
        }

        filter.$and.push({
          revenueCourtId: new mongoose.Types.ObjectId(revenueCourtId),
        });
      }

      if (departmentAuthorityId) {
        if (!mongoose.Types.ObjectId.isValid(departmentAuthorityId)) {
          throw Boom.badRequest(
            RESPONSE_MESSAGE.INVALID_DEPARTMENT_AUTHORITY_ID
          );
        }

        filter.$and.push({
          departmentAuthorityId: new mongoose.Types.ObjectId(
            departmentAuthorityId
          ),
        });
      }

      if (departmentId) {
        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_DEPARTMENT_ID);
        }

        filter.$and.push({
          departmentId: new mongoose.Types.ObjectId(departmentId),
        });
      }

      if (lokAdalatId) {
        if (!mongoose.Types.ObjectId.isValid(lokAdalatId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_LOK_ADALAT_ID);
        }

        filter.$and.push({
          lokAdalatId: new mongoose.Types.ObjectId(lokAdalatId),
        });
      }

      if (highCourtBenchId) {
        if (!mongoose.Types.ObjectId.isValid(highCourtBenchId)) {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALID_HIGH_COURT_BENCH_ID);
        }

        filter.$and.push({
          highCourtBenchId: new mongoose.Types.ObjectId(highCourtBenchId),
        });
      }

      if (comissionerRateAuthorityId) {
        if (!mongoose.Types.ObjectId.isValid(comissionerRateAuthorityId)) {
          throw Boom.badRequest(
            RESPONSE_MESSAGE.INVALID_COMMISSION_AUTHORITY_ID
          );
        }

        filter.$and.push({
          comissionerRateAuthorityId: new mongoose.Types.ObjectId(
            comissionerRateAuthorityId
          ),
        });
      }

      if (commissionBenchId) {
        if (!mongoose.Types.ObjectId.isValid(commissionBenchId)) {
          throw Boom.badRequest(
            RESPONSE_MESSAGE.INVALID_COMMISSION_AUTHORITY_ID
          );
        }

        filter.$and.push({
          commissionBenchId: new mongoose.Types.ObjectId(commissionBenchId),
        });
      }

      const caseType = await CaseTypeModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: caseType,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
