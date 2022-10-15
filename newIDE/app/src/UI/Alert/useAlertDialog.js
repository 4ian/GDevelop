// @flow
import * as React from 'react';
import AlertContext from './AlertContext';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDeleteDialogOptions,
  type ShowConfirmDialogOptions,
} from './AlertContext';

const useAlertDialog = () => {
  const {
    showAlertDialog,
    showConfirmDialog,
    showConfirmDeleteDialog,
  } = React.useContext(AlertContext);

  const showAlert = React.useCallback(
    (options: ShowAlertDialogOptions): Promise<void> =>
      new Promise(resolve => {
        showAlertDialog({ callback: resolve, ...options });
      }),
    [showAlertDialog]
  );

  const showConfirmation = React.useCallback(
    (options: ShowConfirmDialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        showConfirmDialog({ callback: resolve, ...options });
      }),
    [showConfirmDialog]
  );

  const showDeleteConfirmation = React.useCallback(
    (options: ShowConfirmDeleteDialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        showConfirmDeleteDialog({ callback: resolve, ...options });
      }),
    [showConfirmDeleteDialog]
  );

  return {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
  };
};

export default useAlertDialog;
