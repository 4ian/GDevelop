// @flow

export const isNoDialogOpened = (): boolean => {
  return !document.querySelector(
    'body > div[role="presentation"].MuiDialog-root'
  );
};
