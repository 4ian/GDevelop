// @flow

export const timeFunction = (fn: Function, onResult: (number) => void) => {
  var t0 = performance.now();
  fn();
  var t1 = performance.now();
  onResult(t1 - t0);
};

export const timePromise = <T>(
  promiseFn: () => Promise<T>,
  onResult: (number) => void
): Promise<T> => {
  const t0 = performance.now();
  return promiseFn().then((result) => {
    const t1 = performance.now();
    onResult(t1 - t0);

    return result;
  });
};
