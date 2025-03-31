import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface ComissionRateAuthority extends Document {
  title: string;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface ComissionRateAuthorityModelInterface
  extends Model<ComissionRateAuthority> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<ComissionRateAuthority>(
  {
    title: {
      type: String,
      default: null,
      required: true,
      trim: true,
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
const ComissionRateAuthorityModel = mongoose.model<
  ComissionRateAuthority,
  ComissionRateAuthorityModelInterface
>("comissionrate-authority", modelSchema);

export default ComissionRateAuthorityModel;
