// @flow

let globalCacheBurstId = 0;

export const burstCache = (): void => {
  globalCacheBurstId++;
};

/**
 * Returns the URL with an extra parameter to avoid it to be cached by the browser.
 * Useful when displaying image of a resource in a `<img src={...} />` tag.
 *
 * @param {?string} url
 */
export const getUncachedUrl = (url: ?string): ?string => {
  if (!url) return url;

  return `${url}?cacheBurstId=${globalCacheBurstId}`;
};
