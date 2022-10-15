// @flow

export default function memoize<Input, Output>(
  func: Input => Output
): Input => Output {
  const primitives = new Map<Input, Output>();
  // $FlowFixMe - WeakMap is only used when Input is an object.
  const objects = new WeakMap<Input, Output>();

  function cacheFor(input: Input) {
    const isObject = typeof input === 'object';
    return isObject ? objects : primitives;
  }

  return (input: Input): Output => {
    const cache = cacheFor(input);
    const cachedValue = cache.get(input);
    if (cachedValue) return cachedValue;

    const value = func(input);
    cache.set(input, value);
    return value;
  };
}
