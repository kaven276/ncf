export class ServiceError extends Error {
  constructor(public code: number, public message: string) {
    super(message);

    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, HttpError);
    // }
    this.code = code;
    this.message = message;
  }

  toString() {
    return `[${this.code}] ${this.message}`;
  }

  toResponse() {
    return {
      status: 500,
      code: this.code,
      msg: this.message,
    }
  }

  toRespStr() {
    return JSON.stringify(this.toResponse());
  }

}
