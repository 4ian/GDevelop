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

  const showAlert = async (options: ShowAlertDialogOptions): Promise<void> =>
    new Promise(resolve => {
      showAlertDialog({ callback: resolve, ...options });
    });

  const showConfirmation = (
    options: ShowConfirmDialogOptions
  ): Promise<boolean> =>
    new Promise(resolve => {
      showConfirmDialog({ callback: resolve, ...options });
    });

  const showDeleteConfirmation = (
    options: ShowConfirmDeleteDialogOptions
  ): Promise<boolean> =>
    new Promise(resolve => {
      showConfirmDeleteDialog({ callback: resolve, ...options });
    });

  return { showAlert, showConfirmation, showDeleteConfirmation };
};

export default useAlertDialog;
