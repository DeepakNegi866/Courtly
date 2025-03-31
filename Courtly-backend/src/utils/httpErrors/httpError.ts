class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}

export default HttpError;
