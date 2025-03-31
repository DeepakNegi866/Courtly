import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface CaseTypeSchema extends Document {
  title: string;
  highCourtId: mongoose.Schema.Types.ObjectId;
  stateId: mongoose.Schema.Types.ObjectId;
  districtId: mongoose.Schema.Types.ObjectId;
  highCourtBenchId: mongoose.Schema.Types.ObjectId;
  districtCourtId: mongoose.Schema.Types.ObjectId;
  comissionStateId: mongoose.Schema.Types.ObjectId;
  comissionDistrictId: mongoose.Schema.Types.ObjectId;
  comissionBenchId: mongoose.Schema.Types.ObjectId;
  tribunalAuthorityId: mongoose.Schema.Types.ObjectId;
  revenueCourtId: mongoose.Schema.Types.ObjectId;
  comissionerRateAuthorityId: mongoose.Schema.Types.ObjectId;
  departmentId: mongoose.Schema.Types.ObjectId;
  departmentAuthorityId: mongoose.Schema.Types.ObjectId;
  lokAdalatId: mongoose.Schema.Types.ObjectId;
  addedBy: mongoose.Schema.Types.ObjectId;
  court: mongoose.Schema.Types.ObjectId;
  comissionerRate: string;
  isDeleted: boolean;
}

interface CaseTypeInterface extends Model<CaseTypeSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<CaseTypeSchema>(
  {
    title: {
      type: String,
      default: null,
    },
    highCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "highCourt",
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "state",
    },
    highCourtBenchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "highCourtBenches",
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "district",
    },
    districtCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "districtCourt",
    },
    comissionStateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "state-comission",
    },
    comissionDistrictId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "district-comission",
    },
    comissionBenchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "benches-comission",
    },
    tribunalAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tribunal-authorities",
    },
    revenueCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "revenue-courts",
    },
    comissionerRateAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comissionrate-authority",
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
    },
    departmentAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department-authority",
    },
    lokAdalatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lok-adalat",
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courts",
      default: null,
    },
    comissionerRate: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const CaseTypeModel = mongoose.model<CaseTypeSchema, CaseTypeInterface>(
  "case-types",
  modelSchema
);

export default CaseTypeModel;
