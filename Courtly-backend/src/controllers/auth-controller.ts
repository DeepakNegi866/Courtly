import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import UserModel from "../models/user-model";
import { requestHandler, responseHandler } from "../utils";
import Boom from "boom";
import { loginUser } from "../utils/user";
import { RESPONSE_MESSAGE } from "../constants/responseMessage";

export default {
  login: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      await requestHandler.validateRequest(req.body, schema);

      const { email, password } = req.body;

      let user = await UserModel.findOne({ email });

      if (user) {
        if (user.isDeleted == true) {
          throw Boom.forbidden(RESPONSE_MESSAGE.USER_NOT_ACTIVE);
        }
        if (user.isActive) {
          throw Boom.forbidden(RESPONSE_MESSAGE.USER_NOT_AUTHORIZED);
        }
        let loginUserResponse = await loginUser(user, req, {
          password,
        });

        if (loginUserResponse && loginUserResponse.token) {
          return responseHandler.handleSuccess(res, {
            message: RESPONSE_MESSAGE.SUCCESS,
            data: {
              token: loginUserResponse.token,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              phoneNumber: user.phoneNumber,
            },
          });
        } else {
          throw Boom.badRequest(RESPONSE_MESSAGE.INVALIDEMAILORPASSWORD);
        }
      } else {
        throw Boom.badRequest(RESPONSE_MESSAGE.NO_LOGIN_ACCOUNT);
      }
    } catch (error) {
      return responseHandler.handleError(res, error);
    }
  },
};
