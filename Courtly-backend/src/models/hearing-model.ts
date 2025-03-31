import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface HearingSchema extends Document {
  caseId: mongoose.Types.ObjectId;
  stage: string;
  postedFor: string;
  actionTaken: string;
  session: string;
  attendies: [mongoose.Schema.Types.ObjectId];
  description: string;
  hearingDate: Date;
  addedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

interface HearingInterface extends Model<HearingSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<HearingSchema>(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
      default: null,
    },
    stage: {
      type: String,
      default: null,
    },
    postedFor: {
      type: String,
      default: null,
    },
    actionTaken: {
      type: String,
      default: null,
    },
    session: {
      type: String,
      enum: ["morning", "evening"],
      default: null,
    },
    attendies: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
    },
    description: {
      type: String,
      default: null,
    },
    hearingDate: {
      type: Date,
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const HearingModel = mongoose.model<HearingSchema, HearingInterface>(
  "hearings",
  modelSchema
);

export default HearingModel;
