import dotenv from "dotenv";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface TribunalsAuthorities extends Document {
  title: string;
  description: string;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
}

interface TribunalsAuthoritiesModelInterface
  extends Model<TribunalsAuthorities> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<TribunalsAuthorities>(
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);
const TribunalsAuthoritiesModel = mongoose.model<
  TribunalsAuthorities,
  TribunalsAuthoritiesModelInterface
>("tribunal-authorities", modelSchema);

export default TribunalsAuthoritiesModel;
