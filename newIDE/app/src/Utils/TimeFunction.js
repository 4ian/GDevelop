// @flow

export const timeFunction = (fn: Function, onResult: number => void) => {
  var t0 = performance.now();
  fn();
  var t1 = performance.now();
  onResult(t1 - t0);
};
