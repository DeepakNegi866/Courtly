import { config } from "dotenv";
import UserModel from "../../models/user-model";
import { generatePasswordHash } from "../../utils/helper";
config();

export const SuperAdminSeeder = async () => {
  try {
    const isAdminExist = await UserModel.findOne({
      role: "super-admin",
      isDeleted: false,
    });

    if (!isAdminExist) {
      const adminInfo = {
        firstName: process.env.SUPER_ADMIN_FIRST_NAME,
        lastName: process.env.SUPER_ADMIN_LAST_NAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: generatePasswordHash(process.env.SUPER_ADMIN_PASSWORD),
        phoneNumber: process.env.SUPER_ADMIN_PHONENUMBER,
        role: "super-admin",
      };
      await UserModel.create(adminInfo);
    }
  } catch (error) {
    console.log("error", error);
  }
};
