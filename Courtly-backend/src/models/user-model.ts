import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import mongoose, { Document, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

dotenv.config();

interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  image: any;
  designation: string;
  address: string;
  isActive: Boolean;
  city: string;
  state: string;
  postalCode: number;
  landmark: string;
  updatedBy: mongoose.Types.ObjectId;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  status: string;
  addedBy: mongoose.Types.ObjectId;
  phoneNumber: number;
  manager: mongoose.Types.ObjectId;
  department: string,
  signature: any;
  password: string;
  isDeleted: Boolean;
}

interface UserModelInterface extends Model<User> {
  paginate(
    arg0?: { isDeleted: boolean; role: { $ne: string } },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
  generatePasswordHash(plainTextPassword: string): Promise<string>;
  validatePassword(candidatePassword: string): Promise<string>;
}

const modelSchema = new mongoose.Schema<User>(
  {
    firstName: {
      type: String,
      default: null,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
    },
    phoneNumber: {
      type: Number,
      default: null,
    },
    designation: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
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
    landmark: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "team-member",
        "accountant",
        "super-admin",
        "consultant",
        "advocate",
      ],
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      default: null,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "publish",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.statics.generatePasswordHash = (plainTextPassword: string) => {
  return bcrypt.hashSync(plainTextPassword, 10);
};

modelSchema.methods.validatePassword = async function (
  candidatePassword: string
) {
  const result = await bcrypt.compare(candidatePassword, this.password);
  return result;
};

modelSchema.methods.loginToken = async function (
  req: any,
  loginType = "password"
) {
  const secret = process.env.JWT_SECRET || "default-secret";
  let loginToken = jwt.sign(
    {
      _id: this._id,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
  return loginToken;
};

modelSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

modelSchema.plugin(mongoosePaginate);
const UserModel = mongoose.model<User, UserModelInterface>(
  "users",
  modelSchema
);

export default UserModel;
