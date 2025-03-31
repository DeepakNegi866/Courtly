import nodemailer from "nodemailer";
import { config } from "dotenv";
import bcrypt from "bcrypt";
import UserModel from "../models/user-model";
import { generateRandomString } from "../utils/common";
config();

export const sendEmail = async (
  email: string,
  userId = null,
  subject: string | null,
  html: any
) => {
  const user = await UserModel.findOne({ email });
  if (!user) {
    // Handle the case when no user is found
    throw new Error("User not found");
  }

  const plainPassword = generateRandomString();

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await UserModel.updateOne({ _id: user._id }, { password: hashedPassword });

  // Set up the email transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  } as nodemailer.TransportOptions);

  const mailOptions = {
    from: `Digi-Kase <${process.env.SMTP_USERNAME}>`,
    to: email,
    subject: subject || "Your Account Details - Digi-Kase",
    html:
      html ||
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50;">Welcome to Digi-Kase!</h1>
          <p>Hello,</p>
          <p>Your account has been created successfully. Below are your login details:</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${plainPassword}</p>
          <p>For security reasons, we recommend that you change your password after logging in.</p>
          <p>If you forget your password, you can always reset it using the "Forgot Password" option on the login page.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Best regards,</p>
          <p>The Digi-Kase Team</p>
        </div>
      `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    throw new Error("Failed to send email: " + error.message);
  }
};

export const sendActivityEmail = async (
  email: string,
  userId: string | null = null,
  subject: string,
  html: string
) => {
  // Set up the email transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `Digi-Kase <${process.env.SMTP_USERNAME}>`,
    to: email,
    subject: subject,
    html: html,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error: any) {
    throw new Error("Failed to send email: " + error.message);
  }
};
