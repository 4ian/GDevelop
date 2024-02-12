// @flow

export const userCancellationErrorName = 'UserCancellationError';

export class UserCancellationError extends Error {
  constructor(message: string) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserCancellationError);
    }

    this.name = userCancellationErrorName;
  }
}
