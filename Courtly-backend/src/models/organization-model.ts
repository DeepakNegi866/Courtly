import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface Organization extends Document {
  companyName: string;
  companyEmail: string;
  website: string;
  GSTN: string;
  PAN: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  description: string;
  address: [
    {
      city: string;
      state: string;
      postalCode: number;
      officeNumber: number;
    }
  ];
  logo: any;
  isDeleted: boolean;
  status: string;
}

interface OrganizationModelInterface extends Model<Organization> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<Organization>(
  {
    companyName: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      default: null,
      required: true,
      unique: true,
      lowercase: true,
    },
    website: {
      type: String,
      default: null,
    },
    GSTN: {
      type: String,
      default: null,
    },
    PAN: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    address: [
      {
        city: {
          type: String,
          default: null,
        },
        state: {
          type: String,
          default: null,
        },
        postalCode: {
          type: Number,
          default: null,
        },
        officeNumber: {
          type: Number,
          default: null,
        },
      },
    ],
    logo: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "publish",
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
const OrganizationModel = mongoose.model<
  Organization,
  OrganizationModelInterface
>("organizations", modelSchema);

export default OrganizationModel;
