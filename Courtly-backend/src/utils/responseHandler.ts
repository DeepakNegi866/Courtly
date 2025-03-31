import { Response } from "express";

export const handleSuccess = (res: Response, response: any = {}) => {
  const statusCode =
    response && response.statusCode ? response.statusCode : 200;
  const message =
    response && response.message
      ? response.message
      : "Request has been Completed";
  const data = response.data ? response.data : {};
  return res.status(statusCode).send({
    status: statusCode,
    message,
    data,
  });
};

const handleValidationError = (err: any) => {
  let message;
  const key = Object.keys(err.errors);
  message = `Invalid ${err.errors[key[0]].path}: ${err.errors[key[0]].value}.`;
  if (err.errors[key[0]] && err.errors[key[0]].properties) {
    message = err.errors[key[0]].properties.message;
    message = message.replace("Path", "Field");
  }
  return message;
};

export const handleError = (res: Response, error: any) => {
  let errorMsg =
    error && error.message ? error.message : "Request has been Failed";
  if (error.code === 11000) {
    const keys = Object.keys(error.keyValue);
    if (keys.length > 1) {
      errorMsg = keys.join(", ") + " fields are duplicate";
    } else {
      errorMsg = keys[0] + " is duplicate";
    }
  } else if (error.name === "ValidationError") {
    errorMsg = handleValidationError(error);
  }

  if (
    errorMsg ===
    "Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer"
  ) {
    errorMsg = "Invalid Data";
  }

  const statusCode = error && error.statusCode ? error.statusCode : 422;
  const data = error.data ? error.data : {};
  return res.status(statusCode).send({
    status: statusCode,
    message: errorMsg,
    data,
  });
};
