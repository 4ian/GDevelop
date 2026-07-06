const MIN_PREVIEW_WINDOW_SIZE = 1;

const isPositiveFiniteNumber = value =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const getPreviewBrowserWindowOptionsFittingDisplay = (
  previewBrowserWindowOptions,
  displayWorkArea
) => {
  if (
    !previewBrowserWindowOptions ||
    !displayWorkArea ||
    !isPositiveFiniteNumber(displayWorkArea.height) ||
    !isPositiveFiniteNumber(previewBrowserWindowOptions.height)
  ) {
    return previewBrowserWindowOptions;
  }

  const maxHeight = Math.max(
    MIN_PREVIEW_WINDOW_SIZE,
    Math.floor(displayWorkArea.height)
  );
  const requestedHeight = previewBrowserWindowOptions.height;
  if (requestedHeight <= maxHeight) return previewBrowserWindowOptions;

  const scale = maxHeight / requestedHeight;
  const fittedOptions = {
    ...previewBrowserWindowOptions,
    height: maxHeight,
  };

  if (isPositiveFiniteNumber(previewBrowserWindowOptions.width)) {
    fittedOptions.width = Math.max(
      MIN_PREVIEW_WINDOW_SIZE,
      Math.floor(previewBrowserWindowOptions.width * scale)
    );
  }

  return fittedOptions;
};

const getBoundsFittingDisplayHeight = (bounds, displayWorkArea) => {
  if (
    !bounds ||
    !displayWorkArea ||
    !isPositiveFiniteNumber(bounds.height) ||
    !isPositiveFiniteNumber(displayWorkArea.height)
  ) {
    return null;
  }

  const maxHeight = Math.max(
    MIN_PREVIEW_WINDOW_SIZE,
    Math.floor(displayWorkArea.height)
  );
  const fittedHeight = Math.min(bounds.height, maxHeight);
  const fittedY = clamp(
    bounds.y,
    displayWorkArea.y,
    displayWorkArea.y + displayWorkArea.height - fittedHeight
  );

  if (fittedHeight === bounds.height && fittedY === bounds.y) return null;

  return {
    ...bounds,
    y: Math.round(fittedY),
    height: Math.round(fittedHeight),
  };
};

module.exports = {
  getPreviewBrowserWindowOptionsFittingDisplay,
  getBoundsFittingDisplayHeight,
};
