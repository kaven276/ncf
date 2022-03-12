export class ServiceError extends Error {
  constructor(public code: number, public message: string, public data?: any) {
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
      data: this.data,
    }
  }

  toRespStr() {
    return JSON.stringify(this.toResponse());
  }

}

export function throwServiceError(code: number, message: string, data?: any) {
  throw new ServiceError(code, message, data);
}
