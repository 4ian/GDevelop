// @flow

// Outside of React, so that thumbnails can read the previews synchronously.

let previewCache: { [url: string]: string } = {};
let requestPreview: ?(url: string) => Promise<?string> = null;
const requestedPreviewUrls: Set<string> = new Set();
const previewRenderedListeners: Set<() => void> = new Set();
let isListenersNotificationScheduled = false;

export const getCachedResource3DPreview = (url: string): ?string =>
  previewCache[url] || null;

export const setCachedResource3DPreview = (url: string, dataUrl: string) => {
  previewCache[url] = dataUrl;
};

// Frees the previews, whose blob URLs would otherwise stay alive until the
// page is reloaded.
export const burstResource3DPreviewCache = () => {
  Object.keys(previewCache).forEach(url => {
    if (previewCache[url].startsWith('blob:')) {
      URL.revokeObjectURL(previewCache[url]);
    }
  });
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
  if (previewCache[url]) return previewCache[url];
  if (!requestedPreviewUrls.has(url)) {
    requestedPreviewUrls.add(url);
    // Deferred: called while rendering, and requesting sets the provider state.
    queueMicrotask(() => {
      if (!requestPreview) {
        requestedPreviewUrls.delete(url);
        return;
      }
      requestPreview(url).then(onPreviewRequestDone, onPreviewRequestDone);
    });
  }
  return null;
};
