// @flow

export const timeFunction = (fn: Function, onResult: number => void) => {
  // $FlowFixMe[cannot-resolve-name]
  var t0 = performance.now();
  fn();
  // $FlowFixMe[cannot-resolve-name]
  var t1 = performance.now();
  onResult(t1 - t0);
};
