// @flow
import * as React from 'react';
import ConfirmContext from './ConfirmContext';
import ConfirmDialog from './ConfirmDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import {
  type ShowConfirmDeleteDialogOptionsWithCallback,
  type ShowConfirmDialogOptionsWithCallback,
} from './ConfirmContext';

type Props = {| children: React.Node |};

function ConfirmProvider({ children }: Props) {
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    confirmDialogConfig,
    setConfirmDialogConfig,
  ] = React.useState<?ShowConfirmDialogOptionsWithCallback>(null);
  const [
    confirmDeleteDialogConfig,
    setConfirmDeleteDialogConfig,
  ] = React.useState<?ShowConfirmDeleteDialogOptionsWithCallback>(null);

  const openConfirmDialog = (options: ShowConfirmDialogOptionsWithCallback) => {
    setConfirmDialogOpen(true);
    setConfirmDialogConfig(options);
  };

  const openConfirmDeleteDialog = (
    options: ShowConfirmDeleteDialogOptionsWithCallback
  ) => {
    setConfirmDeleteDialogOpen(true);
    setConfirmDeleteDialogConfig(options);
  };

  return (
    <ConfirmContext.Provider
      value={{
        showConfirmDialog: openConfirmDialog,
        showConfirmDeleteDialog: openConfirmDeleteDialog,
      }}
    >
      {children}
      {confirmDialogConfig && (
        <ConfirmDialog
          open={confirmDialogOpen}
          onConfirm={() => {
            setConfirmDialogOpen(false);
            confirmDialogConfig.callback(true);
          }}
          onDismiss={() => {
            setConfirmDialogOpen(false);
            confirmDialogConfig.callback(false);
          }}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
        />
      )}
      {confirmDeleteDialogConfig && (
        <ConfirmDeleteDialog
          open={confirmDeleteDialogOpen}
          onConfirm={() => {
            setConfirmDeleteDialogOpen(false);
            confirmDeleteDialogConfig.callback(true);
          }}
          onDismiss={() => {
            setConfirmDeleteDialogOpen(false);
            confirmDeleteDialogConfig.callback(false);
          }}
          title={confirmDeleteDialogConfig.title}
          message={confirmDeleteDialogConfig.message}
          fieldMessage={confirmDeleteDialogConfig.fieldMessage}
          confirmText={confirmDeleteDialogConfig.confirmText}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
