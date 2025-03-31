import bcrypt from "bcrypt";
import fs from "fs";
const crypto = require("crypto");

export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleString().split(",")[0];
}

export function generateRandom6DigitNumber() {
  return crypto.randomInt(100000, 1000000).toString();
}

export const generatePasswordHash = (plainTextPassword: any) => {
  return bcrypt.hashSync(plainTextPassword, 10);
};

export const deleteFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
