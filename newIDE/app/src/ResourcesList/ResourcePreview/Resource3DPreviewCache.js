// @flow

// Outside of React, so that thumbnails can read the previews synchronously.

// Previews are stored by URL without the cache-burst parameter of local files
// (see `ResourcesLoader`), so that a preview is still shown while it's rendered
// again for a new URL.
let previewCache: { [key: string]: {| url: string, preview: string |} } = {};
let requestPreview: ?(url: string) => Promise<?string> = null;
const requestedPreviewUrls: Set<string> = new Set();
const previewRenderedListeners: Set<() => void> = new Set();
let isListenersNotificationScheduled = false;

const getCacheKey = (url: string) => url.replace(/\?cache=\d+$/, '');

const revokePreview = (preview: string) => {
  if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
};

export const getCachedResource3DPreview = (url: string): ?string => {
  const cached = previewCache[getCacheKey(url)];
  return cached && cached.url === url ? cached.preview : null;
};

export const setCachedResource3DPreview = (url: string, preview: string) => {
  const key = getCacheKey(url);
  const previous = previewCache[key];
  if (previous && previous.preview !== preview) revokePreview(previous.preview);
  previewCache[key] = { url, preview };
};

// Frees the previews, whose blob URLs would otherwise stay alive until the
// page is reloaded.
export const burstResource3DPreviewCache = () => {
  Object.keys(previewCache).forEach(key =>
    revokePreview(previewCache[key].preview)
  );
  previewCache = {};
  requestedPreviewUrls.clear();
};

export const setResource3DPreviewRequester = (
  requester: ?(url: string) => Promise<?string>
) => {
  requestPreview = requester;
  if (!requester) burstResource3DPreviewCache();
};

const onPreviewRequestDone = () => {
  if (isListenersNotificationScheduled) return;
  isListenersNotificationScheduled = true;
  requestAnimationFrame(() => {
    isListenersNotificationScheduled = false;
    previewRenderedListeners.forEach(listener => listener());
  });
};

export const subscribeToResource3DPreviewRendered = (
  listener: () => void
): (() => void) => {
  previewRenderedListeners.add(listener);
  return () => {
    previewRenderedListeners.delete(listener);
  };
};

export const getResource3DPreviewOrRequest = (url: string): ?string => {
  const cached = previewCache[getCacheKey(url)];
  if (cached && cached.url === url) return cached.preview;
  if (!requestedPreviewUrls.has(url)) {
    requestedPreviewUrls.add(url);
    // Deferred, as this is called while rendering.
    queueMicrotask(() => {
      if (!requestPreview) {
        requestedPreviewUrls.delete(url);
        return;
      }
      requestPreview(url).then(onPreviewRequestDone, onPreviewRequestDone);
    });
  }
  return cached ? cached.preview : null;
};
