// @flow
import * as React from 'react';
import AlertContext from './AlertContext';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDeleteDialogOptions,
  type ShowConfirmDialogOptions,
  type ShowYesNoCancelDialogOptions,
} from './AlertContext';

const useAlertDialog = () => {
  const {
    showAlertDialog,
    showConfirmDialog,
    showConfirmDeleteDialog,
    showYesNoCancelDialog,
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

  /**
   * Displays a 3-choice alert dialog (Defaults to Yes No Cancel).
   * Callback will be called with:
   * - 0 for yes (primary button)
   * - 1 for no (flat button next to primary button)
   * - 2 for cancel (secondary action)
   */
  const showYesNoCancel = React.useCallback(
    (options: ShowYesNoCancelDialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        showYesNoCancelDialog({ callback: resolve, ...options });
      }),
    [showYesNoCancelDialog]
  );

  return {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
    showYesNoCancel,
  };
};

export default useAlertDialog;
