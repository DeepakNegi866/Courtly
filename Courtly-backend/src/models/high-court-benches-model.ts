import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface HighCourtBenches extends Document {
  title: string;
  highCourtId: mongoose.Schema.Types.ObjectId;
  description: string;
  isDeleted: boolean;
  addedBy: mongoose.Schema.Types.ObjectId;
}

interface HighCourtBenchesModelInterface extends Model<HighCourtBenches> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<HighCourtBenches>(
  {
    title: {
      type: String,
      default: null,
      trim: true,
    },
    highCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "highCourt",
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
const HighCourtBenchesModel = mongoose.model<
  HighCourtBenches,
  HighCourtBenchesModelInterface
>("highCourtBenches", modelSchema);

export default HighCourtBenchesModel;
