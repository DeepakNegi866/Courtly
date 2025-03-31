import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface HighCourt extends Document {
  title: string;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface HighCourtModelInterface extends Model<HighCourt> {
  paginate(
    arg0?: { isDeleted: boolean; role: { $ne: string } },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
  generatePasswordHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<string>;
}

const modelSchema = new mongoose.Schema<HighCourt>(
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
const HighCourtModel = mongoose.model<HighCourt, HighCourtModelInterface>(
  "highCourt",
  modelSchema
);

export default HighCourtModel;
