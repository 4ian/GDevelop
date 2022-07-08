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

  const onConfirm = ({ deleteDialog }: { deleteDialog: boolean }) => {
    if (deleteDialog) {
      setConfirmDeleteDialogOpen(false);
      confirmDeleteDialogConfig && confirmDeleteDialogConfig.callback(true);
    } else {
      setConfirmDialogOpen(false);
      confirmDialogConfig && confirmDialogConfig.callback(true);
    }
  };

  const onDismiss = ({ deleteDialog }: { deleteDialog: boolean }) => {
    if (deleteDialog) {
      setConfirmDeleteDialogOpen(false);
      confirmDeleteDialogConfig && confirmDeleteDialogConfig.callback(false);
    } else {
      setConfirmDialogOpen(false);
      confirmDialogConfig && confirmDialogConfig.callback(false);
    }
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
          onConfirm={() => onConfirm({ deleteDialog: false })}
          onDismiss={() => onDismiss({ deleteDialog: false })}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
        />
      )}
      {confirmDeleteDialogConfig && (
        <ConfirmDeleteDialog
          open={confirmDeleteDialogOpen}
          onConfirm={() => onConfirm({ deleteDialog: true })}
          onDismiss={() => onDismiss({ deleteDialog: true })}
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
