import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface ExpensesModel extends Document {
  caseId: mongoose.Types.ObjectId;
  type: string;
  amount: number;
  bill: string;
  date: Date;
  description: string;
  addedBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  reimbursement: string;
  reimbursement_requested_at: Date;
  reimbursement_verified_by: mongoose.Types.ObjectId;
  reimbursement_verified_at: Date;
  reimbursement_id: string;
}

interface ExpensesInterface extends Model<ExpensesModel> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<ExpensesModel>(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    bill: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    reimbursement:{
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
      ],
      default: null,
    },
    reimbursement_id:{
      type: String,
      default: null,
      trim: true,
    },
    reimbursement_requested_at:{
      type: Date,
      default: null,
    },
    reimbursement_verified_by:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    reimbursement_verified_at:{
      type: Date,
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
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const ExpensesModel = mongoose.model<ExpensesModel, ExpensesInterface>(
  "expenses",
  modelSchema
);

export default ExpensesModel;
