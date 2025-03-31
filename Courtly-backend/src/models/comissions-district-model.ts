import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface districtComission extends Document {
  title: string;
  stateComissionId: mongoose.Types.ObjectId;
  description: string;
  addedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

interface districtComissionsModelInterface extends Model<districtComission> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<districtComission>(
  {
    title: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    stateComissionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "state-comission",
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
const districtComissionsModel = mongoose.model<
  districtComission,
  districtComissionsModelInterface
>("district-comission", modelSchema);

export default districtComissionsModel;
