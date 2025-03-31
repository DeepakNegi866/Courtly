import dotenv from "dotenv";
import mongoose, { Document, Model, mongo } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const moment = require("moment");

dotenv.config();

interface CaseSchema extends Document {
  court: number;
  appearingModel: {
    id: number;
    title: string;
  };
  yourClientId: mongoose.Types.ObjectId;
  connectedCases: mongoose.Types.ObjectId[];
  yourTeam: mongoose.Schema.Types.ObjectId[];
  appearingAs: string;
  serialNumber: string;
  appearingPerson: string;
  identifier: string;
  highCourtId: mongoose.Types.ObjectId;
  comissionerRateAuthorityId: mongoose.Types.ObjectId;
  highCourtbencheId: mongoose.Types.ObjectId;
  districtId: mongoose.Types.ObjectId;
  comissionBenchId: mongoose.Types.ObjectId;
  stateId: mongoose.Types.ObjectId;
  status: string;
  consumer: string;
  tribunalAuthorityId: mongoose.Types.ObjectId;
  revenueCourtId: mongoose.Types.ObjectId;
  comissionerRate: string;
  authority: mongoose.Types.ObjectId;
  departmentId: mongoose.Types.ObjectId;
  subDepartment: string;
  lokAdalatId: mongoose.Types.ObjectId;
  caseType: string;
  caseNumber: string;
  caseYear: number;
  dateOfFilling: Date;
  courtHall: string;
  floor: string;
  classification: string;
  title: string;
  description: string;
  beforeHonableJudge: string;
  referredBy: string;
  sectionCategory: string;
  priority: string;
  underActs: string;
  superCritical: number;
  critical: number;
  normal: number;
  dueDate: Date;
  firPoliceStation: string;
  firNumber: string;
  firYear: number;
  financialYear: [string];
  affidavitStatus: string;
  affidavitFillingDate: Date;
  additionalFields: {
    auditProceedings: string;
    inspectionProceedings: string;
    securityAssesmentProceedings: string;
    preShowCauseProceedings: string;
    showCauseProceedings: string;
    order: string;
    appeal: string;
    reconciliationNotice: string;
    refund: string;
    summonProceedings: string;
    others: string;
  };
  opponents: [
    {
      email: string;
      fullName: string;
      phoneNumber: number;
    }
  ];
  opponentAdvocates: [
    {
      email: string;
      fullName: string;
      phoneNumber: number;
    }
  ];
  organization: mongoose.Schema.Types.ObjectId;
  addedBy: mongoose.Schema.Types.ObjectId;
  isDeleted: boolean;
  calculateProgress: () => number;
  calculateProgressStatus: () => string;
}

interface CaseSchemaModelInterface extends Model<CaseSchema> {
  paginate(
    arg0?: { isDeleted: boolean },
    options?: { page: number; limit: number; sort: { createdAt: number } }
  ): unknown;
}

const modelSchema = new mongoose.Schema<CaseSchema>(
  {
    court: {
      type: Number,
      default: null,
    },
    appearingModel: {
      id: {
        type: Number,
        default: null,
      },
      title: {
        type: String,
        default: null,
      },
    },
    appearingAs: {
      type: String,
      default: null,
    },
    identifier: {
      type: String,
      default: null,
    },
    appearingPerson: {
      type: String,
      default: null,
    },
    highCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "highCourt",
      default: null,
    },
    comissionBenchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "benches-comission",
      default: null,
    },
    comissionerRateAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comissionrate-authority",
      default: null,
    },
    yourClientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      default: null,
    },
    yourTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    highCourtbencheId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "highCourtBenches",
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "districtCourt",
      default: null,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "state",
      default: null,
    },
    consumer: {
      type: String,
      default: null,
    },
    tribunalAuthorityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tribunal-authorities",
      default: null,
    },
    revenueCourtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "revenue-courts",
      default: null,
    },
    comissionerRate: {
      type: String,
      default: null,
    },
    authority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "department-authority",
      default: null,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      default: null,
    },
    subDepartment: {
      type: String,
      default: null,
    },
    lokAdalatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lok-adalat",
      default: null,
    },
    caseType: {
      type: String,
      default: null,
    },
    caseNumber: {
      type: String,
      default: null,
    },
    caseYear: {
      type: Number,
      default: null,
    },
    dateOfFilling: {
      type: Date,
      default: null,
    },
    courtHall: {
      type: String,
      default: null,
    },
    floor: {
      type: String,
      default: null,
    },
    classification: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    beforeHonableJudge: {
      type: String,
      default: null,
    },
    referredBy: {
      type: String,
      default: null,
    },
    sectionCategory: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: [
        "superCritical",
        "critical",
        "important",
        "routine",
        "normal",
        "others",
      ],
      default: null,
    },
    underActs: {
      type: String,
      default: null,
    },
    firPoliceStation: {
      type: String,
      default: null,
    },
    firNumber: {
      type: String,
      default: null,
    },
    firYear: {
      type: Number,
      default: null,
    },
    financialYear: {
      type: [String],
      default: [],
    },
    affidavitStatus: {
      type: String,
      default: null,
    },
    affidavitFillingDate: {
      type: Date,
      default: null,
    },
    additionalFields: {
      auditProceedings: {
        type: String,
        default: null,
      },
      inspectionProceedings: {
        type: String,
        default: null,
      },
      securityAssesmentProceedings: {
        type: String,
        default: null,
      },
      preShowCauseProceedings: {
        type: String,
        default: null,
      },
      showCauseProceedings: {
        type: String,
        default: null,
      },
      order: {
        type: String,
        default: null,
      },
      appeal: {
        type: String,
        default: null,
      },
      reconciliationNotice: {
        type: String,
        default: null,
      },
      refund: {
        type: String,
        default: null,
      },
      summonProceedings: {
        type: String,
        default: null,
      },
      others: {
        type: String,
        default: null,
      },
    },
    opponents: [
      {
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
      },
    ],
    opponentAdvocates: [
      {
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
      },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
    superCritical: {
      type: Number,
      default: null,
    },
    critical: {
      type: Number,
      default: null,
    },
    normal: {
      type: Number,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "open",
      enum: ["open", "archive", "close"],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    connectedCases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cases",
      },
    ],
    serialNumber: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.plugin(mongoosePaginate);

// Method to calculate progress percentage
modelSchema.methods.calculateProgress = function () {
  const now = moment(); // Current date
  const startDate = moment(this.dateOfFilling);
  const endDate = moment(this.dueDate);

  // If dueDate is before dateOfFilling, return 100% because the case is overdue
  if (endDate.isBefore(startDate)) {
    return 100;
  }

  // If the dateOfFilling is in the future, return 0% (the case has not started)
  if (now.isBefore(startDate)) {
    return 0;
  }

  // Calculate total interval (from dateOfFilling to dueDate)
  const totalTime = endDate.diff(startDate, "milliseconds");
  const elapsedTime = now.diff(startDate, "milliseconds");

  // Calculate percentage of the time used
  const percentageUsed = (elapsedTime / totalTime) * 100;

  // Ensure percentage is between 0 and 100
  return Math.min(Math.max(percentageUsed, 0), 100);
};

modelSchema.methods.calculateProgressStatus = function (): string {
  const progress = this.calculateProgress();

  if (progress <= this.normal) {
    return "normal"; // Progress is within normal range
  } else if (progress <= this.critical) {
    return "critical"; // Progress is within critical range
  } else if (progress <= this.superCritical) {
    return "superCritical"; // Progress is within superCritical range
  }

  return "superCritical"; // If progress exceeds superCritical (100%)
};
// Virtual field to include progress in the case record (optional)
modelSchema.virtual("progress").get(function () {
  return this.calculateProgress();
});

modelSchema.virtual("progressStatus").get(function () {
  return this.calculateProgressStatus();
});

const CaseModel = mongoose.model<CaseSchema, CaseSchemaModelInterface>(
  "cases",
  modelSchema
);

export default CaseModel;
