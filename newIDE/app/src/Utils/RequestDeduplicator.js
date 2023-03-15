// @flow

class RequestDeduplicator<T> {
  _promise: Promise<T> | null = null;
  // TODO: Improve typing of request sender args so that the request sender defines them.
  // See https://github.com/facebook/flow/issues/4672 for more details on how to do it.
  _requestSender: (...args: Array<any>) => Promise<T>;

  constructor(requestSender: (...args: Array<any>) => Promise<T>) {
    this._requestSender = requestSender;
  }

  launchRequestOrGetOngoingPromise(requestSenderArgs: Array<any>): Promise<T> {
    if (!this._promise) {
      this._promise = this._requestSender(...requestSenderArgs).finally(() => {
        this._promise = null;
      });
    }
    return this._promise;
  }
}

export default RequestDeduplicator;
