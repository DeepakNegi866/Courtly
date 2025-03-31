import cron from "node-cron";
import nodemailer from "nodemailer";
import moment from "moment-timezone";
import CaseModel from "../../models/case-model";
import UserModel from "../../models/user-model";
import OrganizationModel from "../../models/organization-model";

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Fetch case counts by priority
const getCaseCounts = async (organizationId: string, adminIds: string[]) => {
  const currentDate = moment().tz("Asia/Kolkata").startOf("day").toDate();

  const openCases = await CaseModel.countDocuments({
    organization: organizationId,
    yourTeam: { $in: adminIds },
    isDeleted: false,
    status: "open",
  });

  const closedCases = await CaseModel.countDocuments({
    organization: organizationId,
    yourTeam: { $in: adminIds },
    isDeleted: false,
    status: "close",
  });

  const dueCases = await CaseModel.countDocuments({
    organization: organizationId,
    yourTeam: { $in: adminIds },
    isDeleted: false,
    status: "open",
    dueDate: { $lte: currentDate },
  });

  const allCasesList = await CaseModel.find({
    organization: organizationId,
    isDeleted: false,
    yourTeam: { $in: adminIds },
    status: { $ne: "close" },
  });

  const normalCases = allCasesList.filter(
    (caseRecord) => caseRecord.calculateProgressStatus() === "normal"
  );

  const criticalCases = allCasesList.filter(
    (caseRecord) => caseRecord.calculateProgressStatus() === "critical"
  );

  const superCriticalCases = allCasesList.filter(
    (caseRecord) => caseRecord.calculateProgressStatus() === "superCritical"
  );

  const archiveCases = await CaseModel.countDocuments({
    organization: organizationId,
    isDeleted: false,
    status: "archive",
  });

  return {
    openCases,
    closedCases,
    dueCases,
    normalCount: normalCases.length,
    criticalCount: criticalCases.length,
    superCriticalCount: superCriticalCases.length,
    archiveCases,
  };
};

// Send daily emails
export const sendEmails = async () => {
  try {
    const organizations: any = await UserModel.distinct("organizationId", {
      role: { $in: ["admin", "accountant"] },
      isDeleted: false,
    });

    for (const orgId of organizations) {
      // Fetch admins of the organization
      const admins = await UserModel.find({
        organizationId: orgId,
        role: { $in: ["admin", "accountant"] },
        isDeleted: false,
      }).select("_id email firstName lastName");

      const adminIds = admins.map((admin: any) => admin._id.toString());

      const caseCounts = await getCaseCounts(orgId, adminIds);

      const organization = await OrganizationModel.findOne({
        _id: orgId,
        isDeleted: false,
      });

      const adminEmails = admins.map((admin: any) => admin.email).join(", ");
      const organizationName = organization?.companyName || "Your Organization";

      const mailOptions = {
        from: `Digi-Kase <${process.env.SMTP_USERNAME}>`,
        to: adminEmails,
        subject: `Daily Case Summary for ${organizationName}`,
        html: `
          <h3>Daily Case Summary</h3>
          <p>Here is the case summary for ${organizationName} as of ${moment()
          .tz("Asia/Kolkata")
          .format("MMMM Do YYYY, h:mm A")}:</p>
          <ul>
            <li><strong>Super Critical Cases:</strong> ${
              caseCounts.superCriticalCount
            }</li>
            <li><strong>Critical Cases:</strong> ${
              caseCounts.criticalCount
            }</li>
            <li><strong>Normal Cases:</strong> ${caseCounts.normalCount}</li>
            <li><strong>Closed Cases:</strong> ${caseCounts.closedCases}</li>
            <li><strong>Archive Cases:</strong> ${caseCounts.archiveCases}</li>
          </ul>
          <p>Thank you,</p>
          <p>Digi-Kase Team</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailError: any) {
        console.error(
          `Failed to send email to organization ${organizationName}:`,
          emailError.message
        );
      }
    }
  } catch (error: any) {
    console.error("Error sending daily summary emails:", error.message);
  }
};

// Schedule the task for 1:38 PM IST daily
cron.schedule("30 4 * * *", async () => {
  console.log(
    "Running daily email scheduler at",
    moment().tz("Asia/Kolkata").format()
  );
  await sendEmails();
});
