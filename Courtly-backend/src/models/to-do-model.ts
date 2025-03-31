import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface ToDoSchema extends Document {
  description: string;
  startDateTime: string;
  endDateTime: string;
  markAsPrivate: boolean;
  reminder: [
    {
      reminderMode: string;
      reminderTime: string;
      reminderModeTime: string;
    }
  ];
  status: string;
  relatedToCaseId: [mongoose.Types.ObjectId];
  assignToMemberId: [mongoose.Types.ObjectId];
  organization: mongoose.Types.ObjectId;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  progressStatus?: string; // Virtual field
}

interface ToDoModelInterface extends Model<ToDoSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<ToDoSchema>(
  {
    description: {
      type: String,
      default: null,
      trim: true,
    },
    startDateTime: {
      type: String,
      default: null,
      trim: true,
    },
    endDateTime: {
      type: String,
      default: null,
      trim: true,
    },
    markAsPrivate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "open",
      enum: ["open", "completed", "close"],
    },
    relatedToCaseId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cases",
      },
    ],
    assignToMemberId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    reminder: [
      {
        reminderMode: {
          type: String,
          default: null,
          trim: true,
        },
        reminderTime: {
          type: String,
          default: null,
          trim: true,
        },
        reminderModeTime: {
          type: String,
          default: null,
          trim: true,
        },
      },
    ],
    organization: {
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for `progressStatus`
modelSchema.virtual("progressStatus").get(function () {
  const currentDate = new Date();

  if (this.status === "completed") {
    return "completed";
  }

  const startDateTime = new Date(this.startDateTime);

  if (this.status === "open" && startDateTime <= currentDate) {
    return "pending";
  } else if (this.status === "open" && startDateTime > currentDate) {
    return "upcoming";
  }

  return null;
});

// Enable virtuals in JSON and Object responses
modelSchema.set("toObject", { virtuals: true });
modelSchema.set("toJSON", { virtuals: true });

modelSchema.plugin(mongoosePaginate);
const ToDoModel = mongoose.model<ToDoSchema, ToDoModelInterface>(
  "to-dos",
  modelSchema
);

export default ToDoModel;
