import dotenv from "dotenv";
import { object } from "joi";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface caseDocumentSchema extends Document {
  document: object;
  docType: string;
  caseId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  addedBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

interface CaseDocumentInterface extends Model<caseDocumentSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<caseDocumentSchema>(
  {
    document: {
      type: Object,
      default: null,
    },
    docType: {
      type: String,
      default: null,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cases",
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    addedBy: {
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
const CaseDocumentModel = mongoose.model<
  caseDocumentSchema,
  CaseDocumentInterface
>("case-documents", modelSchema);

export default CaseDocumentModel;
