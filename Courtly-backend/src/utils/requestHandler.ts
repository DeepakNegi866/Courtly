export const sendBadRequestError = (error: any) => {
  let message = error.details[0].message;
  message = message.replace(/"/g, "");
  message = message.replace("[", "");
  message = message.replace("]", "");
  return message;
};

export const validateRequest = async (data: any, schema: any) => {
  return new Promise((resolve, reject) => {
    const { error } = schema.validate(data);
    if (error) {
      let message = sendBadRequestError(error);
      reject(new Error(message));
    } else {
      return resolve(true);
    }
  });
};
