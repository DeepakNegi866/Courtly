import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface District extends Document {
  title: string;
  stateId: mongoose.Types.ObjectId;
  description: string;
  isDeleted: boolean;
  addedBy: mongoose.Schema.Types.ObjectId;
}

interface DistrictModelInterface extends Model<District> {
  paginate(
    arg0?: { isDeleted: boolean; role: { $ne: string } },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
  generatePasswordHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<string>;
}

const modelSchema = new mongoose.Schema<District>(
  {
    title: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
      default: null,
      ref: "state",
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const DistrictModel = mongoose.model<District, DistrictModelInterface>(
  "district",
  modelSchema
);

export default DistrictModel;
