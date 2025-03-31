import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface NotesSchema extends Document {
  description: string;
  caseId: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  informClient: {
    email: boolean;
    mobile: boolean;
    whatsapp: boolean;
  };
  informTeamMember: [
    {
      type: mongoose.Schema.Types.ObjectId;
      ref: "users";
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}

interface NotesInterface extends Model<NotesSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<NotesSchema>(
  {
    description: {
      type: String,
      default: null,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
      default: null,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    informClient: {
      email: {
        type: Boolean,
        default: false,
      },
      mobile: {
        type: Boolean,
        default: false,
      },
      whatsapp: {
        type: Boolean,
        default: false,
      },
    },
    informTeamMember: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const NotesModel = mongoose.model<NotesSchema, NotesInterface>(
  "notes",
  modelSchema
);

export default NotesModel;
