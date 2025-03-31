import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface ClientSchema extends Document {
  organizationId: mongoose.Schema.Types.ObjectId;
  fullName: string;
  nickName: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  email: string;
  age: number;
  phoneNumber: number;
  fatherName: string;
  companyName: string;
  website: string;
  TIN: string;
  GSTN: string;
  PAN: string;
  hourlyRate: number;
  officeAddress: {
    address1: string;
    address2: string;
    city: string;
    postalCode: number;
    country: string;
    state: string;
  };
  homeAddress: {
    address1: string;
    address2: string;
    city: string;
    postalCode: number;
    country: string;
    state: string;
  };
  contacts: {
    fullName: string;
    email: string;
    phoneNumber: number;
    designation: string;
  };
  isDeleted: boolean;
}

interface ClientModelInterface extends Model<ClientSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<ClientSchema>(
  {
    fullName: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: null,
    },
    nickName: {
      type: String,
      unique: true,
      default: null,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
    },
    fatherName: {
      type: String,
      default: null,
    },
    companyName: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    TIN: {
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
    hourlyRate: {
      type: Number,
      default: null,
    },
    officeAddress: {
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
      country: {
        type: String,
        default: null,
      },
      address1: {
        type: String,
        default: null,
      },
      address2: {
        type: String,
        default: null,
      },
    },
    homeAddress: {
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
      country: {
        type: String,
        default: null,
      },
      address1: {
        type: String,
        default: null,
      },
      address2: {
        type: String,
        default: null,
      },
    },
    contacts: {
      fullName: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        default: null,
      },
      phoneNumber: {
        type: Number,
        default: null,
      },
      designation: {
        type: String,
        default: null,
      },
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
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
const ClientModel = mongoose.model<ClientSchema, ClientModelInterface>(
  "clients",
  modelSchema
);

export default ClientModel;
