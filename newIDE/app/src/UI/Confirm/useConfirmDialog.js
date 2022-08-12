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

  return { showConfirmation, showDeleteConfirmation };
};

export default useConfirmDialog;
