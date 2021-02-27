// flow-typed signature: ee6aa6690ad469d64aa59033fa0e19eb
// flow-typed version: <<STUB>>/@supercharge/promise-pool_v1.6.0/flow_v0.120.1

declare module '@supercharge/promise-pool' {
  declare class PromisePoolError<T> extends Error {
    /**
     * Returns the item that caused this error.
     */
    item: T;

    /**
     * Create a new instance for the given `message` and `item`.
     *
     * @param error  The original error
     * @param item   The item causing the error
     */
    constructor(error: any, item: T): PromisePoolError<T>;

    /**
     * Returns a new promise pool error instance wrapping the `error` and `item`.
     *
     * @param {*} error
     * @param {*} item
     *
     * @returns {PromisePoolError}
     */
    static createFrom<T>(error: any, item: T): PromisePoolError<T>;
  }

  declare type ReturnValue<T, R> = {
    /**
     * The list of processed items.
     */
    results: R[],

    /**
     * The list of errors that occurred while processing all items in the pool.
     * Each error contains the error-causing item at `error.item` as a
     * reference for re-processing.
     */
    errors: Array<PromisePoolError<T>>,
  };

  declare class PromisePool<T> {
    constructor(): PromisePool<T>;
    withConcurrency(concurrency: number): PromisePool<T>;
    static withConcurrency(concurrency: number): typeof PromisePool;
    for(items: T[]): PromisePool<T>;
    static for<T>(items: T[]): PromisePool<T>;
    handleError(
      handler: (error: Error, item: T) => Promise<void> | void
    ): PromisePool<T>;
    process<R>(
      callback: (item: T) => R | Promise<R>
    ): Promise<ReturnValue<T, R>>;
  }

  declare export default typeof PromisePool;
}
