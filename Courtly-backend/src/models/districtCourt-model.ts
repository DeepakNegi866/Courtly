import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface DistrictCourt extends Document {
  title: string;
  districtId: mongoose.Types.ObjectId;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface DistrictCourtModelInterface extends Model<DistrictCourt> {
  paginate(
    arg0?: { isDeleted: boolean; role: { $ne: string } },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
  generatePasswordHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<string>;
}

const modelSchema = new mongoose.Schema<DistrictCourt>(
  {
    title: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "district",
      default: null,
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
const DistrictCourtModel = mongoose.model<
  DistrictCourt,
  DistrictCourtModelInterface
>("districtCourt", modelSchema);

export default DistrictCourtModel;
