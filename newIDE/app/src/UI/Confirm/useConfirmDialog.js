// @flow
import * as React from 'react';
import ConfirmContext from './ConfirmContext';
import {
  type ShowConfirmDeleteDialogOptions,
  type ShowConfirmDialogOptions,
} from './ConfirmContext';

const useConfirmDialog = () => {
  const { showConfirmDialog, showConfirmDeleteDialog } = React.useContext(
    ConfirmContext
  );

  const getConfirmation = (
    options: ShowConfirmDialogOptions
  ): Promise<boolean> =>
    new Promise((resolve, reject) => {
      showConfirmDialog({ callback: resolve, ...options });
    });

  const getDeleteConfirmation = (
    options: ShowConfirmDeleteDialogOptions
  ): Promise<boolean> =>
    new Promise((resolve, reject) => {
      showConfirmDeleteDialog({ callback: resolve, ...options });
    });

  return { getConfirmation, getDeleteConfirmation };
};

export default useConfirmDialog;
