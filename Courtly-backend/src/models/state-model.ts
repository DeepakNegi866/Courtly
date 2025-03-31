import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface State extends Document {
  title: string;
  description: string;
  isDeleted: boolean;
  addedBy: mongoose.Schema.Types.ObjectId;
}

interface StateModelInterface extends Model<State> {
  paginate(
    arg0?: { isDeleted: boolean; role: { $ne: string } },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
  generatePasswordHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<string>;
}

const modelSchema = new mongoose.Schema<State>(
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
const StateModel = mongoose.model<State, StateModelInterface>(
  "state",
  modelSchema
);

export default StateModel;
