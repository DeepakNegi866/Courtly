import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface DepartmentAuthority extends Document {
  title: string;
  departmentId: mongoose.Schema.Types.ObjectId;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface DepartmentAuthorityModelInterface extends Model<DepartmentAuthority> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<DepartmentAuthority>(
  {
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "departments",
      default: null,
    },
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
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const DepartmentAuthorityModel = mongoose.model<
  DepartmentAuthority,
  DepartmentAuthorityModelInterface
>("department-authority", modelSchema);

export default DepartmentAuthorityModel;
