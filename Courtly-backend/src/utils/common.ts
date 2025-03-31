import CaseModel from "../models/case-model";

export const paginateOptions = (options: any) => {
  return {
    page: options.page ? options.page : 1,
    limit: options.limit ? options.limit : 10,
    sort: {
      updatedAt: "desc",
    },
  };
};

export const generateRandomString = (length = 8) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const haveValue = (data: any) => {
  if (isEmpty(data)) {
    return false;
  }

  return true;
};

export const isEmpty = (data: any) => {
  if (
    data !== undefined &&
    data !== "undefined" &&
    data !== "" &&
    data !== null &&
    data !== "null"
  ) {
    return false;
  }
  return true;
};

export const getIpFromRequest = async (req: any) => {
  return req?.ip;
};

export const getUserAgentFromRequest = async (req: any) => {
  return req.get("User-Agent");
};
