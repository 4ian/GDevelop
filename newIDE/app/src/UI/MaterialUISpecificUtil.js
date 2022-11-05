// @flow
export const aboveMaterialUiMaxZIndex = 1501; // highest z-index used by MaterialUI is 1500

export const isNoDialogOpened = (): boolean => {
  return !document.querySelector(
    'body > div[role="presentation"].MuiDialog-root'
  );
};
