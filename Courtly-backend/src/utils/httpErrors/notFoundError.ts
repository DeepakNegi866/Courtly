import HttpError from "./httpError";

class NotFoundError extends HttpError {
  constructor(message: string, statusCode: number = 404) {
    super(message, statusCode);
  }
}

export default NotFoundError;
