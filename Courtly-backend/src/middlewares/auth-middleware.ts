import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { responseHandler } from "../utils";
import logger from "../utils/logger";
import { haveValue } from "../utils/common";
import UserModel from "../models/user-model";
import { promises } from "dns";

dotenv.config();

const Auth = (rolesAllowed: any = null) => {
  return async (req: any, res: any, next: any): Promise<any> => {
    if (typeof rolesAllowed == "string") {
      rolesAllowed = [rolesAllowed] as any;
    }

    let jwtToken = req.headers["authorization"];
    if (!haveValue(jwtToken)) {
      return responseHandler.handleError(res, {
        message: "authTokenRequired",
        statusCode: 403,
      });
    }

    let token = jwtToken.split(" ")[1];
    if (!token) {
      return responseHandler.handleError(res, {
        message: "Invalid token",
        statusCode: 403,
      });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      if (decode) {
        const userDetails: any = await UserModel.findOne({
          _id: decode?._id,
        });

        if (userDetails?.isDeleted) {
          return responseHandler.handleError(res, {
            message: "Invalid Account",
            statusCode: 403,
          });
        } else if (userDetails?.isActive) {
          return responseHandler.handleError(res, {
            message: "Your account is deactivated. Please contact admin.",
            statusCode: 403,
          });
        } else {
          let haveEligibleRole = true;
          if (rolesAllowed !== null) {
            haveEligibleRole = (rolesAllowed as string[]).includes(
              userDetails.role
            );
          }

          if (haveEligibleRole) {
            req.user = userDetails;
            next();
          } else {
            return responseHandler.handleError(res, {
              message: "unAuthorizedAccess",
              statusCode: 401,
            });
          }
        }
      } else {
        return responseHandler.handleError(res, {
          message: "invalidAuthToken",
          statusCode: 403,
        });
      }
    } catch (err) {
      logger.error(err);
      return responseHandler.handleError(res, {
        message: "requestFailed",
        statusCode: 403,
      });
    }
  };
};
export default Auth;
