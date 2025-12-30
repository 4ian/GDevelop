// @ts-check

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @template T
 * @param {{
 *   times: number,
 *   backoff?: {
 *     initialDelay: number, // in milliseconds
 *     factor?: number // optional multiplier (default is 2)
 *   }
 * }} configuration
 * @param {() => Promise<T>} functionCalled
 * @returns {Promise<T>}
 */
const retryIfFailed = async ({ times, backoff }, functionCalled) => {
  let tries = 0;
  let latestError = null;
  const useBackoff = !!backoff;
  let delayTime = (backoff && backoff.initialDelay) || 0;
  const factor = (backoff && backoff.factor) || 2;

  while (tries < times) {
    tries++;
    latestError = null;
    try {
      const latestReturnValue = await functionCalled();
      return latestReturnValue;
    } catch (error) {
      latestError = error;
      if (tries < times && useBackoff) {
        await delay(delayTime);
        delayTime *= factor;
      }
    }
  }

  throw latestError;
};

module.exports = {
  retryIfFailed,
};
