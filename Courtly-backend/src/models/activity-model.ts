import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface ActivitySchema extends Document {
  caseId: mongoose.Types.ObjectId;
  description: string;
  addedBy: mongoose.Types.ObjectId;
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
  isDeleted: boolean;
}

interface ActivityInterface extends Model<ActivitySchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<ActivitySchema>(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
    },
    description: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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
const ActivityModel = mongoose.model<ActivitySchema, ActivityInterface>(
  "activities",
  modelSchema
);

export default ActivityModel;
