/**
 * A value that round-trips through `JSON.stringify` / `JSON.parse`.
 * @typedef {null | boolean | number | string | Array<JsonValue> | {[key: string]: JsonValue}} JsonValue
 */

/**
 * Serialize a function + its arguments into a string suitable for CDP
 * `Runtime.evaluate` / `Page.addScriptToEvaluateOnNewDocument`. The function
 * source is taken verbatim from `Function.prototype.toString()` and wrapped
 * into an immediately-invoked call with JSON-serialized arguments.
 *
 * Constraints on `fn`:
 *   - Must be a plain named function declaration (so `.toString()` is a
 *     syntactically valid expression by itself — arrow functions and method
 *     shorthand work too, class/async methods do not).
 *   - Must be self-contained: may NOT reference any identifier from the
 *     surrounding module. The function runs in the preview window's V8,
 *     which has no access to the main-process module graph.
 *   - Must only accept JSON-serializable arguments; non-serializable values
 *     (functions, DOM nodes, `undefined`, etc.) will be silently coerced by
 *     `JSON.stringify`.
 *
 * @param {Function} fn
 * @param {...JsonValue} args
 * @returns {string}
 */
const serializeFunctionForCdp = (fn, ...args) => {
  if (typeof fn !== 'function') {
    throw new TypeError('serializeFunctionForCdp: fn is not a function');
  }
  const argsSource = args.map(a => JSON.stringify(a)).join(', ');
  return '(' + fn.toString() + ')(' + argsSource + ')';
};

module.exports = {
  serializeFunctionForCdp,
};
