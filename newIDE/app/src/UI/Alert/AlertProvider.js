// @flow
import * as React from 'react';
import AlertContext from './AlertContext';
import AlertDialog from './AlertDialog';
import ConfirmDialog from './ConfirmDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDeleteDialogOptionsWithCallback,
  type ShowConfirmDialogOptionsWithCallback,
} from './AlertContext';

type Props = {| children: React.Node |};

function ConfirmProvider({ children }: Props) {
  // Alert
  const [alertDialogOpen, setAlertDialogOpen] = React.useState<boolean>(false);
  const [
    alertDialogConfig,
    setAlertDialogConfig,
  ] = React.useState<?ShowAlertDialogOptions>(null);
  const openAlertDialog = (options: ShowAlertDialogOptions) => {
    setAlertDialogOpen(true);
    setAlertDialogConfig(options);
  };

  // Confirm
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState<boolean>(
    false
  );
  const [
    confirmDialogConfig,
    setConfirmDialogConfig,
  ] = React.useState<?ShowConfirmDialogOptionsWithCallback>(null);
  const openConfirmDialog = (options: ShowConfirmDialogOptionsWithCallback) => {
    setConfirmDialogOpen(true);
    setConfirmDialogConfig(options);
  };

  // Confirm Delete
  const [
    confirmDeleteDialogOpen,
    setConfirmDeleteDialogOpen,
  ] = React.useState<boolean>(false);
  const [
    confirmDeleteDialogConfig,
    setConfirmDeleteDialogConfig,
  ] = React.useState<?ShowConfirmDeleteDialogOptionsWithCallback>(null);
  const openConfirmDeleteDialog = (
    options: ShowConfirmDeleteDialogOptionsWithCallback
  ) => {
    setConfirmDeleteDialogOpen(true);
    setConfirmDeleteDialogConfig(options);
  };

  return (
    <AlertContext.Provider
      value={{
        showAlertDialog: openAlertDialog,
        showConfirmDialog: openConfirmDialog,
        showConfirmDeleteDialog: openConfirmDeleteDialog,
      }}
    >
      {children}
      {alertDialogConfig && (
        <AlertDialog
          open={alertDialogOpen}
          onDismiss={() => {
            setAlertDialogOpen(false);
          }}
          title={alertDialogConfig.title}
          message={alertDialogConfig.message}
        />
      )}
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
    </AlertContext.Provider>
  );
}

export default ConfirmProvider;
