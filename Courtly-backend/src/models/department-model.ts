import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface Department extends Document {
  title: string;
  description: string;
  isDeleted: boolean;
  addedBy: mongoose.Schema.Types.ObjectId;
}

interface DepartmentModelInterface extends Model<Department> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<Department>(
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
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const DepartmentModel = mongoose.model<Department, DepartmentModelInterface>(
  "departments",
  modelSchema
);

export default DepartmentModel;
