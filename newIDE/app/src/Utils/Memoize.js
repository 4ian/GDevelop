// @flow

export default function<Input, Output>(func: (Input) => Output): (Input) => Output {
  const primitives = new Map();
  const objects = new WeakMap();

  function cacheFor(input: Input) {
    const isObject = typeof input === 'object';
    return isObject ? objects : primitives;
  }

  return (input: Input): Output => {
    const cache = cacheFor(input);
    const isCached = cache.has(input);
    if (!isCached) {
      cache.set(input, func(input));
    }

    return (cache.get(input): Output);
  };
}
