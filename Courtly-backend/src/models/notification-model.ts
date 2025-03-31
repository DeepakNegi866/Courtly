import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface NotificationSchema extends Document {
  type: string;
  caseId: mongoose.Types.ObjectId;
  description: string;
  status: string;
  informees: mongoose.Types.ObjectId[];
  informed: mongoose.Types.ObjectId[];
  url: string;
  isDeleted: boolean;
}

interface NotificationInterface extends Model<NotificationSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<NotificationSchema>(
  {
    type: {
      type: String,
      default: null,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
      default: null,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    informees: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: null,
    },
    informed: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: null,
    },
    status: {
      type: String,
      default: "normal",
      enum: ["pending", "approved", "rejected", "normal"],
    },
    url: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const NotificationModel = mongoose.model<
  NotificationSchema,
  NotificationInterface
>("notifications", modelSchema);

export default NotificationModel;
