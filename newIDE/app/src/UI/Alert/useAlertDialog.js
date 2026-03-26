// @flow
import * as React from 'react';
import AlertContext from './AlertContext';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDeleteDialogOptions,
  type ShowConfirmDialogOptions,
  type ShowYesNoCancelDialogOptions,
} from './AlertContext';
import PortalContainerContext from '../PortalContainerContext';

const useAlertDialog = (): {
  showAlert: (options: ShowAlertDialogOptions) => Promise<void>,
  showConfirmation: (options: ShowConfirmDialogOptions) => Promise<boolean>,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
  showYesNoCancel: (options: ShowYesNoCancelDialogOptions) => Promise<boolean>,
} => {
  const {
    showAlertDialog,
    showConfirmDialog,
    showConfirmDeleteDialog,
    showYesNoCancelDialog,
  } = React.useContext(AlertContext);

  const portalContainer = React.useContext(PortalContainerContext);

  const showAlert = React.useCallback(
    (options: ShowAlertDialogOptions): Promise<void> =>
      new Promise(resolve => {
        showAlertDialog({
          callback: resolve,
          portalContainer,
          ...options,
        });
      }),
    [showAlertDialog, portalContainer]
  );

  const showConfirmation = React.useCallback(
    (options: ShowConfirmDialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        showConfirmDialog({
          callback: resolve,
          portalContainer,
          ...options,
        });
      }),
    [showConfirmDialog, portalContainer]
  );

  const showDeleteConfirmation = React.useCallback(
    (options: ShowConfirmDeleteDialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        showConfirmDeleteDialog({
          callback: resolve,
          portalContainer,
          ...options,
        });
      }),
    [showConfirmDeleteDialog, portalContainer]
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
        showYesNoCancelDialog({
          callback: resolve,
          portalContainer,
          ...options,
        });
      }),
    [showYesNoCancelDialog, portalContainer]
  );

  return {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
    showYesNoCancel,
  };
};

export default useAlertDialog;
