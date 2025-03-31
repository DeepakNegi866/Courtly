import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface LokAdalat extends Document {
  title: string;
  description: string;
  isDeleted: boolean;
  addedBy: mongoose.Schema.Types.ObjectId;
}

interface LokAdalatModelInterface extends Model<LokAdalat> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<LokAdalat>(
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
const LokAdalatModel = mongoose.model<LokAdalat, LokAdalatModelInterface>(
  "lok-adalat",
  modelSchema
);

export default LokAdalatModel;
