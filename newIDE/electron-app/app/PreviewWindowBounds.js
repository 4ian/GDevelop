const MIN_PREVIEW_WINDOW_SIZE = 1;

const isPositiveFiniteNumber = value =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const setPreviewWindowMenuBarVisibilityAndContentSize = (
  previewWindow,
  previewBrowserWindowOptions,
  menuBarVisibility
) => {
  if (
    !previewWindow ||
    typeof previewWindow.setMenuBarVisibility !== 'function'
  ) {
    return;
  }

  // Changing menu bar visibility can preserve the outer window bounds and
  // consequently change the content height. Reapply the requested content
  // size afterwards so the game viewport keeps its intended aspect ratio.
  previewWindow.setMenuBarVisibility(menuBarVisibility);

  if (
    previewBrowserWindowOptions &&
    previewBrowserWindowOptions.useContentSize &&
    isPositiveFiniteNumber(previewBrowserWindowOptions.width) &&
    isPositiveFiniteNumber(previewBrowserWindowOptions.height) &&
    typeof previewWindow.setContentSize === 'function'
  ) {
    previewWindow.setContentSize(
      previewBrowserWindowOptions.width,
      previewBrowserWindowOptions.height
    );
  }
};

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

  // Preview windows always use half of the configured game resolution,
  // independently of the display's DPI scale. A 1280x720 game therefore opens
  // in a 640x360 content area on every screen.
  const scaledOptions = {
    ...previewBrowserWindowOptions,
    height: Math.max(
      MIN_PREVIEW_WINDOW_SIZE,
      Math.floor(previewBrowserWindowOptions.height / 2)
    ),
  };

  if (isPositiveFiniteNumber(previewBrowserWindowOptions.width)) {
    scaledOptions.width = Math.max(
      MIN_PREVIEW_WINDOW_SIZE,
      Math.floor(previewBrowserWindowOptions.width / 2)
    );
  }

  const maxHeight = Math.max(
    MIN_PREVIEW_WINDOW_SIZE,
    Math.floor(displayWorkArea.height)
  );
  const requestedHeight = scaledOptions.height;
  if (requestedHeight <= maxHeight) return scaledOptions;

  const scale = maxHeight / requestedHeight;
  const fittedOptions = {
    ...scaledOptions,
    height: maxHeight,
  };

  if (isPositiveFiniteNumber(scaledOptions.width)) {
    fittedOptions.width = Math.max(
      MIN_PREVIEW_WINDOW_SIZE,
      Math.floor(scaledOptions.width * scale)
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
  setPreviewWindowMenuBarVisibilityAndContentSize,
  getPreviewBrowserWindowOptionsFittingDisplay,
  getBoundsFittingDisplayHeight,
};
