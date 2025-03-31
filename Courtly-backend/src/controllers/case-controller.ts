import Boom from "boom";
import * as xl from "excel4node";
import Joi from "joi";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";
import { sendActivityEmail } from "../middlewares/node-mailer";
import ActivityModel from "../models/activity-model";
import CaseDocumentModel from "../models/case-documents-model";
import CaseModel from "../models/case-model";
import CourtModel from "../models/court-model";
import DepartmentAuthorityModel from "../models/department-authority-model";
import HearingModel from "../models/hearing-model";
import NotesModel from "../models/notes-model";
import ToDoModel from "../models/to-do-model";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import mongoose from "mongoose";
import ClientModel from "../models/client-model";

export default {
  addCase: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        court: Joi.number().optional(),
        appearingModel: Joi.object().keys({
          id: Joi.number().optional(),
          title: Joi.string().optional(),
        }),
        yourClientId: Joi.string().optional(),
        appearingAs: Joi.string().optional(),
        yourTeam: Joi.array().items(Joi.string()).optional(),
        identifier: Joi.string().optional(),
        highCourtId: Joi.string().optional(),
        benches: Joi.string().optional(),
        districtId: Joi.string().optional(),
        comissionBenchId: Joi.string().optional(),
        stateId: Joi.string().optional(),
        consumer: Joi.string().optional(),
        tribunalAuthorityId: Joi.string().optional(),
        revenueCourtId: Joi.string().optional(),
        highCourtbencheId: Joi.string().optional(),
        comissionerRateAuthorityId: Joi.string().optional(),
        comissionerRate: Joi.string().optional(),
        authority: Joi.string().optional(),
        subDepartment: Joi.string().optional(),
        departmentId: Joi.string().optional(),
        lokAdalatId: Joi.string().optional(),
        caseType: Joi.string().optional(),
        caseNumber: Joi.string().optional(),
        appearingPerson: Joi.string().optional(),
        caseYear: Joi.number().optional(),
        dateOfFilling: Joi.date().optional(),
        courtHall: Joi.string().optional(),
        floor: Joi.string().optional(),
        classification: Joi.string().optional(),
        status: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        beforeHonableJudge: Joi.string().optional(),
        referredBy: Joi.string().optional(),
        sectionCategory: Joi.string().optional(),
        priority: Joi.string()
          .valid(
            "superCritical",
            "critical",
            "important",
            "routine",
            "normal",
            "others"
          )
          .optional(),
        underActs: Joi.string().optional(),
        firPoliceStation: Joi.string().optional(),
        firNumber: Joi.string().optional(),
        firYear: Joi.number().optional(),
        financialYear: Joi.array().items(Joi.string()).optional(),
        affidavitStatus: Joi.string().optional(),
        affidavitFillingDate: Joi.date().optional(),

        // Additional fields as an object
        additionalFields: Joi.object()
          .keys({
            auditProceedings: Joi.string().optional(),
            inspectionProceedings: Joi.string().optional(),
            securityAssesmentProceedings: Joi.string().optional(),
            preShowCauseProceedings: Joi.string().optional(),
            showCauseProceedings: Joi.string().optional(),
            order: Joi.string().optional(),
            appeal: Joi.string().optional(),
            reconciliationNotice: Joi.string().optional(),
            refund: Joi.string().optional(),
            summonProceedings: Joi.string().optional(),
            others: Joi.string().optional(),
          })
          .optional(),

        // Opponents as an array of objects
        opponents: Joi.array()
          .items(
            Joi.object().keys({
              email: Joi.string().email().optional(),
              fullName: Joi.string().optional(),
              phoneNumber: Joi.number().optional(),
            })
          )
          .optional(),

        // Opponent advocates as an array of objects
        opponentAdvocates: Joi.array()
          .items(
            Joi.object().keys({
              email: Joi.string().email().optional(),
              fullName: Joi.string().optional(),
              phoneNumber: Joi.number().optional(),
            })
          )
          .optional(),
        dateOfHearing: Joi.date().optional(),
        superCritical: Joi.string().optional(),
        critical: Joi.string().optional(),
        normal: Joi.string().optional(),
        dueDate: Joi.date().optional(),
        organization: Joi.string().optional(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      const caseData = req.body;

      if (caseData.authority === "other") {
        caseData.authority = null;
      }

      if (
        user.role === "admin" ||
        user.role === "team-member" ||
        user.role === "accountant"
      ) {
        caseData.organization = user.organizationId;
      }

      // Calculate the next serial number
      const existingCasesCount = await CaseModel.countDocuments({
        organization: caseData.organization,
        isDeleted: false,
      });
      caseData.serialNumber = `C${(existingCasesCount + 1)
        .toString()
        .padStart(2, "0")}`;

      caseData.addedBy = req.user._id;

      const newCase: any = new CaseModel(caseData);

      if (user.role === "super-admin") {
        newCase.organization = req.body.organization;
      }

      const organizationAdminsData = await UserModel.find({
        role: { $in: ["admin", "accountant"] },
        organizationId: newCase.organization,
        isDeleted: false,
      }).select("_id");

      const organizationAdmins = organizationAdminsData.map((el) => el._id);

      if (newCase.yourTeam && Array.isArray(newCase.yourTeam)) {
        let yourTeamCopy = [...newCase.yourTeam, ...organizationAdmins];
        newCase.yourTeam = yourTeamCopy;
      } else {
        newCase.yourTeam = organizationAdmins;
      }

      if (
        user &&
        user.role !== "super-admin" &&
        !newCase.yourTeam.includes(userId)
      ) {
        newCase.yourTeam = [...newCase.yourTeam, userId];
      }

      await newCase.save();

      const hearingData = new HearingModel({
        caseId: newCase._id,
        hearingDate: req.body.dateOfHearing,
        addedBy: req.user._id,
      });
      await hearingData.save();

      let clientName;
      if (newCase.yourClientId) {
        const client = await ClientModel.findOne({
          _id: newCase.yourClientId,
          isDeleted: false,
        }).select("fullName");
        if (client) {
          clientName = client.fullName;
        }
      }

      let teamMember = await UserModel.find({
        _id: { $in: newCase.yourTeam },
        isDeleted: false,
      }).select("firstName lastName email");

      // Create a list of team member names for the email
      const teamMemberNames = teamMember
        .map((member) => member.firstName + " " + member.lastName)
        .join(", ");

      const subject = `New Case Created: ${newCase.title || "Case #"}${
        newCase.serialNumber
      }`;

      const caseDetailsHtml = `
      <h3>New Case Created</h3>
      <p>A new case has been created by ${
        user.firstName + " " + user.lastName
      } and assigned to your team:</p>
      <ul>
        <li>Case Title: ${newCase.title || "Not Specified"}</li>
        <li>Case Number: ${newCase.caseNumber || "Not Specified"}</li>
        <li>Priority: ${newCase.priority || "Not Specified"}</li>
          <li>Client Name: ${clientName}</li>
          <li>Team Members: ${
            teamMemberNames || "No Team Members Assigned"
          }</li>
        <li>Description: ${
          newCase.description || "No Description Provided"
        }</li>
           <li>Date of Notice/Order: ${
             newCase.dateOfFilling
               ? new Date(newCase.dateOfFilling).toDateString()
               : "Not Specified"
           }</li>
    <li>Due Date: ${
      newCase.dueDate
        ? new Date(newCase.dueDate).toDateString()
        : "Not Specified"
    }</li>
      </ul>
      <p>
        Please <a href="https://digikase.com/management/cases/${
          newCase?._id
        }" target="_blank">click here</a> to log in to the dashboard and view more details.
      </p>
      <p>Thank you,</p>
      <p>Digi-Kase Team</p>
    `;

      // Send emails to team members
      const teamMembers = await UserModel.find({
        _id: { $in: newCase.yourTeam },
        isDeleted: false,
      });

      for (const member of teamMembers) {
        try {
          await sendActivityEmail(member.email, null, subject, caseDetailsHtml);
        } catch (error: any) {
          console.error(
            `Failed to send email to ${member.email}:`,
            error.message
          );
        }
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: newCase,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllCases: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        progress = "all",
        caseId = null,
        organization = null,
      } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };

      const userId = req.user._id;

      // Fetch user details
      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      // Prepare filters based on user role and input
      let filter: any = { isDeleted: false };

      if (
        user.role === "admin" ||
        user.role === "team-member" ||
        user.role === "accountant"
      ) {
        filter.organization = user.organizationId;
      }

      if (status) {
        filter.status = status;
      } else if (progress === "all") {
        filter.status = { $ne: "close" };
      } else if (progress === "super-critical") {
        filter.status = { $nin: ["archive", "close"] };
      } else if (progress === "critical") {
        filter.status = { $nin: ["archive", "close"] };
      } else if (progress === "normal") {
        filter.status = { $nin: ["archive", "close"] };
      }

      if (organization && user.role === "super-admin") {
        const orgId = mongoose.Types.ObjectId.isValid(organization)
          ? new mongoose.Types.ObjectId(organization)
          : organization;
        filter.organization = orgId;
      }

      if (caseId) {
        const currentOrganization: any = await CaseModel.findById(
          caseId
        ).select("organization");
        if (currentOrganization?.organization) {
          filter.organization = currentOrganization.organization;
        }
      }

      // Filter cases based on progress
      if (progress === "archive") {
        filter.status = "archive"; // Directly filter by status
      }
      if (progress === "close") {
        filter.status = "close";
      } else if (
        progress !== "all" &&
        ["normal", "critical"].includes(progress)
      ) {
        const allCasesList = await CaseModel.find({ ...filter }).exec();

        const filteredCases = allCasesList.filter((caseRecord) => {
          const progressStatus = caseRecord.calculateProgressStatus();
          return progressStatus === progress;
        });

        const filteredCaseIds = filteredCases.map((item) => item._id);
        filter._id = { $in: filteredCaseIds };
      }

      if (progress !== "all" && progress == "super-critical") {
        const allCasesList = await CaseModel.find({ ...filter }).exec();

        const filteredCases = allCasesList.filter((caseRecord) => {
          const progressStatus = caseRecord.calculateProgressStatus();
          return progressStatus === "superCritical";
        });

        const filteredCaseIds = filteredCases.map((item) => item._id);
        filter._id = { $in: filteredCaseIds };
      }

      // Aggregate pipeline
      const pipeline: any[] = [
        { $match: filter },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "hearings",
            localField: "_id",
            foreignField: "caseId",
            as: "hearings",
          },
        },
        {
          $addFields: {
            hearingDate: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$hearings",
                    as: "hearing",
                    in: "$$hearing.hearingDate",
                  },
                },
                0,
              ],
            },
          },
        },
        { $unset: "hearings" },
        {
          $lookup: {
            from: "clients",
            localField: "yourClientId",
            foreignField: "_id",
            as: "yourClient",
          },
        },
        { $unwind: { path: "$yourClient", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "addedBy",
            foreignField: "_id",
            as: "addedByUser",
          },
        },
        { $unwind: { path: "$addedByUser", preserveNullAndEmptyArrays: true } },
      ];

      // Add pagination
      const skip = (options.page - 1) * options.limit;
      pipeline.push({ $skip: skip }, { $limit: options.limit });

      // Execute aggregate pipeline
      const getAllCases = await CaseModel.aggregate(pipeline);

      // Count total documents matching the filters
      const totalCases = await CaseModel.countDocuments(filter);

      // Check for empty results
      if (getAllCases.length === 0 && totalCases > 0) {
        throw Boom.notFound("No data found in the aggregation pipeline.");
      }

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          docs: getAllCases,
          totalDocs: totalCases,
          totalPages: Math.ceil(totalCases / options.limit),
          page: options.page,
          limit: options.limit,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },

  updateCase: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        court: Joi.number().optional(),
        appearingModel: Joi.object().keys({
          id: Joi.number().optional(),
          title: Joi.string().optional(),
        }),
        yourClientId: Joi.string().optional(),
        appearingAs: Joi.string().optional(),
        yourTeam: Joi.array().items(Joi.string()).optional(),
        identifier: Joi.string().optional(),
        highCourtId: Joi.string().optional(),
        benches: Joi.string().optional(),
        districtId: Joi.string().optional(),
        stateId: Joi.string().optional(),
        consumer: Joi.string().optional(),
        tribunalAuthorityId: Joi.string().optional(),
        revenueCourtId: Joi.string().optional(),
        highCourtbencheId: Joi.string().optional(),
        comissionerRateAuthorityId: Joi.string().optional(),
        comissionerRate: Joi.string().optional(),
        authority: Joi.string().optional(),
        departmentId: Joi.string().optional(),
        subDepartment: Joi.string().optional(),
        lokAdalatId: Joi.string().optional(),
        caseType: Joi.string().optional(),
        caseNumber: Joi.string().optional(),
        appearingPerson: Joi.string().optional(),
        caseYear: Joi.number().optional(),
        dateOfFilling: Joi.date().optional(),
        courtHall: Joi.string().optional(),
        floor: Joi.string().optional(),
        classification: Joi.string().optional(),
        connectedCases: Joi.array().items(Joi.string()).optional(),
        status: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        beforeHonableJudge: Joi.string().optional(),
        referredBy: Joi.string().optional(),
        sectionCategory: Joi.string().optional(),
        priority: Joi.string()
          .valid(
            "superCritical",
            "critical",
            "important",
            "routine",
            "normal",
            "others"
          )
          .optional(),
        underActs: Joi.string().optional(),
        firPoliceStation: Joi.string().optional(),
        firNumber: Joi.string().optional(),
        firYear: Joi.number().optional(),
        financialYear: Joi.array().items(Joi.string()).optional(),
        affidavitStatus: Joi.string().optional(),
        affidavitFillingDate: Joi.date().optional(),

        // Additional fields as an object
        additionalFields: Joi.object()
          .keys({
            auditProceedings: Joi.string().optional(),
            inspectionProceedings: Joi.string().optional(),
            securityAssesmentProceedings: Joi.string().optional(),
            preShowCauseProceedings: Joi.string().optional(),
            showCauseProceedings: Joi.string().optional(),
            order: Joi.string().optional(),
            appeal: Joi.string().optional(),
            reconciliationNotice: Joi.string().optional(),
            refund: Joi.string().optional(),
            summonProceedings: Joi.string().optional(),
            others: Joi.string().optional(),
          })
          .optional(),

        // Opponents as an array of objects
        opponents: Joi.array()
          .items(
            Joi.object().keys({
              email: Joi.string().email().optional(),
              fullName: Joi.string().optional(),
              phoneNumber: Joi.number().optional(),
            })
          )
          .optional(),

        // Opponent advocates as an array of objects
        opponentAdvocates: Joi.array()
          .items(
            Joi.object().keys({
              email: Joi.string().email().optional(),
              fullName: Joi.string().optional(),
              phoneNumber: Joi.number().optional(),
            })
          )
          .optional(),
        caseId: Joi.string().required(),
        dateOfHearing: Joi.date().optional(),
        superCritical: Joi.string().optional(),
        critical: Joi.string().optional(),
        normal: Joi.string().optional(),
        dueDate: Joi.date().optional(),
        organization: Joi.string().optional(),
      });

      // Validate the request body
      await requestHandler.validateRequest(req.body, schema);

      const caseData = req.body;

      // Check if the case exists
      const isCaseIdExist = await CaseModel.findOne({
        _id: caseData.caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      if (caseData.authority == "other") {
        caseData.authority = null;
      }

      const updateCase = await CaseModel.findOneAndUpdate(
        { _id: caseData.caseId },
        { $set: caseData },
        { new: true }
      ).populate([{ path: "addedBy" }, { path: "yourTeam" }]);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: updateCase,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteCase: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        caseId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { caseId } = req.params;

      const caseData: any = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!caseData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      caseData.isDeleted = true;

      await caseData.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: caseData,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  uploadDocuments: async (req: any, res: any): Promise<any> => {
    try {
      const { caseId } = req.body;

      const isCaseIdExist = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const files = req.files;
      const documentEntries: any[] = [];

      const uploadPromises = files.map(async (file: any) => {
        if (file.fieldname === "document") {
          const documentEntry = new CaseDocumentModel({
            document: file,
            caseId,
            uploadedBy: req.user._id,
            addedBy: req.user._id,
            isDeleted: false,
          });
          await documentEntry.save();
          documentEntries.push(documentEntry);
        } else {
          console.log("Unrecognized file fieldname:::::", file.fieldname);
        }
      });

      await Promise.all(uploadPromises);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: documentEntries,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  deleteDocument: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        documentId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { documentId } = req.params;

      const isDocumentIdExist = await CaseDocumentModel.findOne({
        _id: documentId,
        isDeleted: false,
      });

      if (!isDocumentIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.DOCUMENT_NOT_FOUND);
      }

      isDocumentIdExist.isDeleted = true;

      await isDocumentIdExist.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: isDocumentIdExist,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  updateDocuments: async (req: any, res: any): Promise<any> => {
    try {
      const { documentId, docType } = req.body;

      const isDocumentIdExist = await CaseDocumentModel.findOne({
        _id: documentId,
        isDeleted: false,
      });

      if (!isDocumentIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.DOCUMENT_NOT_FOUND);
      }

      isDocumentIdExist.docType = docType;

      await isDocumentIdExist.save();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: isDocumentIdExist,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  addHearing: async (req: any, res: any): Promise<any> => {
    try {
      const {
        caseId,
        hearingDate,
        stage,
        postedFor,
        actionTaken,
        session,
        attendies,
        description,
      } = req.body;

      const isCaseIdExist = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      });

      if (!isCaseIdExist) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const hearing = new HearingModel({
        caseId,
        stage,
        postedFor,
        actionTaken,
        session,
        attendies,
        description,
        addedBy: req.user._id,
        hearingDate,
      });

      await hearing.save();

      const populatedHearing = await HearingModel.findById(
        hearing._id
      ).populate("caseId");

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: populatedHearing,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllHearings: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        caseId = null,
        organization = null,
      } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: {
          path: "caseId",
        },
      };

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      let filter: any = { isDeleted: false };

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role === "accountant"
      ) {
        const cases = await CaseModel.find({
          organization: user.organizationId,
          isDeleted: false,
        }).select("_id");

        const caseIds = cases.map((caseData) => caseData._id);

        filter.caseId = { $in: caseIds };
      }

      if (user.role === "super-admin" && organization) {
        const cases = await CaseModel.find({
          isDeleted: false,
          organization: organization,
        }).select("_id");
        const caseIds = cases.map((caseData) => caseData._id);
        filter.caseId = { $in: caseIds };
      }

      if (caseId) {
        filter.caseId = caseId;
      }

      const getAllHearings = await HearingModel.paginate(filter, options);

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllHearings,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getCaseById: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        caseId: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.params, schema);

      const { caseId } = req.params;

      const caseData: any = await CaseModel.findOne({
        _id: caseId,
        isDeleted: false,
      })
        .populate({
          path: "organization",
        })
        .populate({
          path: "highCourtId",
        })
        .populate({
          path: "districtId",
        })
        .populate({
          path: "stateId",
        })
        .populate({
          path: "tribunalAuthorityId",
        })
        .populate({
          path: "revenueCourtId",
        })
        .populate({
          path: "departmentId",
        })
        .populate({
          path: "lokAdalatId",
        })
        .populate({
          path: "yourClientId",
        })
        .populate({
          path: "yourTeam",
        })
        .populate({
          path: "comissionerRateAuthorityId",
        })
        .populate({
          path: "highCourtbencheId",
        });

      if (!caseData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const getAllNotes = await NotesModel.find({ caseId: caseId }).populate(
        "addedBy"
      );

      const court = await CourtModel.findOne({ uniqueCourtId: caseData.court });

      const courtTitle = court ? court.title : "";

      let authority;

      if (caseData.authority === "other") {
        authority = "other";
      } else {
        const authorityData = await DepartmentAuthorityModel.findOne({
          _id: caseData.authority,
        });

        if (authorityData) {
          authority = authorityData.title;
        } else {
          authority = "Unknown Authority";
        }
      }

      const getAllCaseDocumentsUpload = await CaseDocumentModel.find({
        caseId: caseId,
        isDeleted: false,
      }).populate("uploadedBy");

      const getAllTodos = await ToDoModel.find({ caseId: caseId });

      const getAllActivities = await ActivityModel.find({
        caseId: caseId,
      }).populate("addedBy");

      const getAllHearings = await HearingModel.find({ caseId: caseId })
        .sort({ createdAt: -1 })
        .populate("caseId")
        .exec();

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          authority: authority,
          caseData: caseData,
          courtTitle: courtTitle,
          notes: getAllNotes,
          caseDocuments: getAllCaseDocumentsUpload,
          todods: getAllTodos,
          hearings: getAllHearings,
          activities: getAllActivities,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  connectCase: async (req: any, res: any): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        connectedCase: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { caseId } = req.params;
      const { connectedCase } = req.body;

      const caseData = await CaseModel.findByIdAndUpdate(
        caseId,
        { $addToSet: { connectedCases: connectedCase } },
        { new: true }
      );

      if (!caseData) {
        throw Boom.notFound(RESPONSE_MESSAGE.CASE_NOT_FOUND);
      }

      const updateCaseData = await CaseModel.findById(caseData._id).populate({
        path: "connectedCases",
      });

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: {
          caseData: updateCaseData,
        },
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllCaseDocuments: async (req: any, res: any): Promise<any> => {
    try {
      const {
        page = 1,
        limit = 10,
        caseId = null,
        organization = null,
      } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
        populate: {
          path: "caseId",
        },
      };

      const userId = req.user._id;

      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      let filter: any = { isDeleted: false };

      if (
        user.role == "admin" ||
        user.role == "team-member" ||
        user.role === "accountant"
      ) {
        const cases = await CaseModel.find({
          isDeleted: false,
          organization: user.organizationId,
        }).select("_id");

        const caseIds = cases.map((caseData) => caseData._id);

        filter.caseId = { $in: caseIds };
      }

      if (user.role === "super-admin" && organization) {
        const cases = await CaseModel.find({
          organization: organization,
          isDeleted: false,
        }).select("_id");
        const caseIds = cases.map((caseData) => caseData._id);
        filter.caseId = { $in: caseIds };
      }

      if (caseId) {
        filter.caseId = caseId;
      }

      const getAllCaseDocuments = await CaseDocumentModel.paginate(
        filter,
        options
      );

      return responseHandler.handleSuccess(res, {
        statuscode: 200,
        message: RESPONSE_MESSAGE.SUCCESS,
        data: getAllCaseDocuments,
      });
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
  getAllCasesExcel: async (req: any, res: any): Promise<any> => {
    try {
      const { progress = "all", organization = null } = req.query;

      const userId = req.user._id;

      // Fetch user details
      const user: any = await UserModel.findOne({
        _id: userId,
        isDeleted: false,
      });

      if (!user) {
        throw Boom.notFound(RESPONSE_MESSAGE.USER_NOT_FOUND);
      }

      let filter: any = { isDeleted: false };

      if (user.role === "admin" || user.role === "team-member") {
        filter.organization = user.organizationId;
      }

      if (organization && user.role === "super-admin") {
        filter.organization = organization;
      }

      if (
        progress !== "all" &&
        (progress == "normal" ||
          progress == "critical" ||
          progress == "super-critical")
      ) {
        const allCasesList = await CaseModel.find({ ...filter }).exec();
        if (progress == "normal") {
          const allFilteredCases = allCasesList.filter((caseRecord) => {
            const progressStatus = caseRecord.calculateProgressStatus();
            return progressStatus === "normal";
          });
          const filterCaseId = allFilteredCases.map((item) => item._id);
          filter._id = { $in: filterCaseId };
        }

        if (progress == "critical") {
          const allFilteredCases = allCasesList.filter((caseRecord) => {
            const progressStatus = caseRecord.calculateProgressStatus();
            return progressStatus === "critical";
          });
          const filterCaseId = allFilteredCases.map((item) => item._id);
          filter._id = { $in: filterCaseId };
        }

        if (progress == "super-critical") {
          const allFilteredCases = allCasesList.filter((caseRecord) => {
            const progressStatus = caseRecord.calculateProgressStatus();
            return progressStatus === "superCritical";
          });
          const filterCaseId = allFilteredCases.map((item) => item._id);
          filter._id = { $in: filterCaseId };
        }
      }

      // Aggregate pipeline
      const pipeline: any[] = [
        { $match: filter }, // Match cases based on filters
        { $sort: { createdAt: -1 } }, // Sort by creation date

        // Convert "court" to string for court lookup
        {
          $addFields: {
            courtAsString: { $toString: "$court" }, // Cast court to string
          },
        },

        // Lookup for hearings
        {
          $lookup: {
            from: "hearings",
            localField: "_id",
            foreignField: "caseId",
            as: "hearings",
          },
        },
        {
          $addFields: {
            hearingDate: {
              $arrayElemAt: [
                {
                  $map: {
                    input: "$hearings",
                    as: "hearing",
                    in: "$$hearing.hearingDate",
                  },
                },
                0,
              ],
            },
          },
        },
        { $unset: "hearings" },

        // Lookup for courtDetails
        {
          $lookup: {
            from: "courts",
            localField: "courtAsString",
            foreignField: "uniqueCourtId",
            as: "courtDetails",
          },
        },
        {
          $unwind: { path: "$courtDetails", preserveNullAndEmptyArrays: true },
        },

        // Lookup for highCourtId
        {
          $lookup: {
            from: "highCourt",
            localField: "highCourtId",
            foreignField: "_id",
            as: "highCourt",
          },
        },
        { $unwind: { path: "$highCourt", preserveNullAndEmptyArrays: true } },

        // Lookup for comissionBenchId
        {
          $lookup: {
            from: "benches-comission",
            localField: "comissionBenchId",
            foreignField: "_id",
            as: "comissionBench",
          },
        },
        {
          $unwind: {
            path: "$comissionBench",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for comissionerRateAuthorityId
        {
          $lookup: {
            from: "comissionrate-authority",
            localField: "comissionerRateAuthorityId",
            foreignField: "_id",
            as: "comissionerRateAuthority",
          },
        },
        {
          $unwind: {
            path: "$comissionerRateAuthority",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for yourTeam
        {
          $lookup: {
            from: "users",
            localField: "yourTeam",
            foreignField: "_id",
            as: "yourTeamDetails",
          },
        },

        // Lookup for highCourtbencheId
        {
          $lookup: {
            from: "highCourtBenches",
            localField: "highCourtbencheId",
            foreignField: "_id",
            as: "highCourtBench",
          },
        },
        {
          $unwind: {
            path: "$highCourtBench",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for districtId
        {
          $lookup: {
            from: "districtCourt",
            localField: "districtId",
            foreignField: "_id",
            as: "districtCourt",
          },
        },
        {
          $unwind: { path: "$districtCourt", preserveNullAndEmptyArrays: true },
        },

        // Lookup for stateId
        {
          $lookup: {
            from: "state",
            localField: "stateId",
            foreignField: "_id",
            as: "stateDetails",
          },
        },
        {
          $unwind: { path: "$stateDetails", preserveNullAndEmptyArrays: true },
        },

        // Lookup for tribunalAuthorityId
        {
          $lookup: {
            from: "tribunal-authorities",
            localField: "tribunalAuthorityId",
            foreignField: "_id",
            as: "tribunalAuthority",
          },
        },
        {
          $unwind: {
            path: "$tribunalAuthority",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup for revenueCourtId
        {
          $lookup: {
            from: "revenue-courts",
            localField: "revenueCourtId",
            foreignField: "_id",
            as: "revenueCourt",
          },
        },
        {
          $unwind: { path: "$revenueCourt", preserveNullAndEmptyArrays: true },
        },

        // Lookup for departmentId
        {
          $lookup: {
            from: "departments",
            localField: "departmentId",
            foreignField: "_id",
            as: "department",
          },
        },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },

        // Lookup for lokAdalatId
        {
          $lookup: {
            from: "lok-adalat",
            localField: "lokAdalatId",
            foreignField: "_id",
            as: "lokAdalat",
          },
        },
        { $unwind: { path: "$lokAdalat", preserveNullAndEmptyArrays: true } },

        // Lookup for Clients
        {
          $lookup: {
            from: "clients",
            localField: "yourClientId",
            foreignField: "_id",
            as: "clients",
          },
        },
        { $unwind: { path: "$clients", preserveNullAndEmptyArrays: true } },

        // Lookup for connectedCases
        {
          $lookup: {
            from: "cases",
            localField: "connectedCases",
            foreignField: "_id",
            as: "connectedCasesDetails",
          },
        },

        // Unset the temporary courtAsString field
        { $unset: "courtAsString" },
      ];

      // Execute aggregate
      const getAllCases: any = await CaseModel.aggregate(pipeline);

      if (!getAllCases || getAllCases.length == 0) {
        return responseHandler.handleSuccess(res, {
          statuscode: 400,
          message: RESPONSE_MESSAGE.SUCCESS,
        });
      }

      const excelData = getAllCases.map((item: any, index: any) => ({
        srNo: index + 1,
        serialNumber: item?.serialNumber || "",
        court: `${item?.courtDetails?.title || ""} ${item?.identifier || ""} ${
          item?.highCourt?.title || ""
        } ${item?.department?.title || ""}  ${item?.lokAdalat?.title || ""} ${
          item?.revenueCourt?.title || ""
        } ${item?.tribunalAuthority?.title || ""} ${
          item?.districtCourt?.title || ""
        }`,
        case: item?.title || "",
        client: item?.clients?.fullName || "",
        team:
          item?.yourTeamDetails && Array.isArray(item?.yourTeamDetails)
            ? item?.yourTeamDetails
                .map(
                  (el: any) => `${el?.firstName || ""} ${el?.lastName || ""}`
                )
                .join(", ")
            : "",
        classification: item?.classification || "",
        fillingDate: item?.dateOfFilling || "",
        description: item?.description || "",
        appearingAs: item?.appearingAs || "",
        caseType: item?.caseType || "",
      }));

      // Create a new workbook and worksheet
      const wb = new xl.Workbook();
      const ws = wb.addWorksheet("Cases");

      // Define styles for headers
      const headerStyle = wb.createStyle({
        font: { bold: true, size: 12 },
        alignment: { horizontal: "center" },
      });

      const defaultStyle = wb.createStyle({
        alignment: { wrapText: true, vertical: "center" },
      });

      // Define headers
      const headers = [
        "Sr No",
        "Case Number",
        "Court",
        "Case",
        "Client",
        "Team Members",
        "Classification",
        "Date of Filling",
        "Case Description",
        "Appearing As",
        "Case Type",
      ];

      // Add headers
      headers.forEach((header, i) => {
        ws.cell(1, i + 1)
          .string(header)
          .style(headerStyle);
        ws.column(i + 1).setWidth(25);
      });

      // Add data rows
      excelData.forEach((row: any, rowIndex: number) => {
        ws.cell(rowIndex + 2, 1)
          .number(row.srNo)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 2)
          .string(row.serialNumber)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 3)
          .string(row.court)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 4)
          .string(row.case)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 5)
          .string(row.client)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 6)
          .string(row.team)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 7)
          .string(row.classification)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 8)
          .string(row.fillingDate)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 9)
          .string(row.description)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 10)
          .string(row.appearingAs)
          .style(defaultStyle);
        ws.cell(rowIndex + 2, 11)
          .string(row.caseType)
          .style(defaultStyle);
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");

      // Write the workbook to the response
      wb.write("data.xlsx", res);
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
