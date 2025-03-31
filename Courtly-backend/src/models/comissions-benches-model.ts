import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface benchesComissions extends Document {
  title: string;
  description: string;
  addedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

interface benchesComissionsModelInterface extends Model<benchesComissions> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<benchesComissions>(
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
const BenchescomissionsModel = mongoose.model<
  benchesComissions,
  benchesComissionsModelInterface
>("benches-comission", modelSchema);

export default BenchescomissionsModel;
