// @flow
export const aboveMaterialUiMaxZIndex = 1501; // highest z-index used by MaterialUI is 1500

export const isNoDialogOpened = (): boolean => {
  return !document.querySelector(
    'body > div[role="presentation"].MuiDialog-root'
  );
};

export const isElementADialog = (
  element: Element,
  options?: { isVisible: true }
) => {
  const isDialog =
    element.tagName === 'DIV' &&
    element.getAttribute('role') === 'presentation';
  if (!isDialog) return false;
  if (options && options.isVisible) {
    return !element.getAttribute('aria-hidden');
  }
  return true;
};
