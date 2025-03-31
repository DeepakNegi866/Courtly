import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface comissions extends Document {
  title: string;
  type: string;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface comissionsModelInterface extends Model<comissions> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<comissions>(
  {
    title: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    type: {
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
const ComissionsModel = mongoose.model<comissions, comissionsModelInterface>(
  "comissions",
  modelSchema
);

export default ComissionsModel;
