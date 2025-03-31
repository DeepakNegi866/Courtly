import UserModel from "../models/user-model";
import { generateRandomString, haveValue } from "./common";
import logger from "./logger";

export const signupUser = async (
  fields: any,
  alreadyRegisteredCheck = true
) => {
  try {
    if (!haveValue(fields.password)) {
      fields.password = generateRandomString(10);
    }

    if (haveValue(fields.email)) {
      let model = null;

      if (alreadyRegisteredCheck) {
        model = await UserModel.findOne({ email: fields.email });
      }

      if (model !== null) {
        return model;
      } else {
        fields.password = await UserModel.generatePasswordHash(fields.password);
        model = new UserModel(fields);
        await model.save();
        return model;
      }
    } else {
      return null;
    }
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return null;
  }
};

export const loginUser = async (
  userModel: any,
  req: any,
  additionalData: any = {}
) => {
  try {
    const validPassword = await userModel.validatePassword(
      additionalData?.password
    );
    if (!validPassword) {
      throw new Error("invalidLogin");
    } else {
      return {
        user: userModel,
        token: await userModel.loginToken(req),
      };
    }
  } catch (err: any) {
    logger.error(err.message, { stack: err.stack });
    return null;
  }
};
