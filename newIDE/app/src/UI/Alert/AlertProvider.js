// @flow
import * as React from 'react';
import AlertContext from './AlertContext';
import AlertDialog from './AlertDialog';
import ConfirmDialog from './ConfirmDialog';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import {
  type ShowAlertDialogOptions,
  type ShowConfirmDeleteDialogOptions,
  type ShowConfirmDialogOptions,
} from './AlertContext';

type Props = {|
  children: React.Node,
|};

type ShowAlertDialogState = {|
  options: ShowAlertDialogOptions,
  resolve: () => void,
|};
type ShowConfirmDeleteDialogState = {|
  options: ShowConfirmDeleteDialogOptions,
  resolve: boolean => void,
|};
type ShowConfirmDialogState = {|
  options: ShowConfirmDialogOptions,
  resolve: boolean => void,
|};

export default function AlertProvider({ children }: Props) {
  // Alert
  const [
    alertDialogState,
    setAlertDialogState,
  ] = React.useState<?ShowAlertDialogState>(null);
  const showAlertDialog = React.useCallback(
    async (options: ShowAlertDialogOptions): Promise<void> => {
      await new Promise(resolve => {
        setAlertDialogState({ options, resolve });
      });
      setAlertDialogState(null);
    },
    []
  );

  // Confirm
  const [
    confirmDialogState,
    setConfirmDialogState,
  ] = React.useState<?ShowConfirmDialogState>(null);
  const showConfirmDialog = React.useCallback(
    async (options: ShowConfirmDialogOptions): Promise<boolean> => {
      const result = await new Promise(resolve => {
        setConfirmDialogState({ options, resolve });
      });
      setConfirmDialogState(null);
      return result;
    },
    []
  );

  // Confirm Delete
  const [
    confirmDeleteDialogState,
    setConfirmDeleteDialogState,
  ] = React.useState<?ShowConfirmDeleteDialogState>(null);
  const showConfirmDeleteDialog = React.useCallback(
    async (options: ShowConfirmDeleteDialogOptions): Promise<boolean> => {
      const result = await new Promise(resolve => {
        setConfirmDeleteDialogState({ options, resolve });
      });
      setConfirmDeleteDialogState(null);
      return result;
    },
    []
  );

  const providerValue = React.useMemo(
    () => ({
      showAlertDialog,
      showConfirmDialog,
      showConfirmDeleteDialog,
    }),
    [showAlertDialog, showConfirmDialog, showConfirmDeleteDialog]
  );

  return (
    <AlertContext.Provider value={providerValue}>
      {children}
      {alertDialogState && (
        <AlertDialog
          open
          onDismiss={() => {
            alertDialogState.resolve();
          }}
          dismissButtonLabel={alertDialogState.options.dismissButtonLabel}
          title={alertDialogState.options.title}
          message={alertDialogState.options.message}
        />
      )}
      {confirmDialogState && (
        <ConfirmDialog
          open
          onConfirm={() => {
            confirmDialogState.resolve(true);
          }}
          confirmButtonLabel={confirmDialogState.options.confirmButtonLabel}
          onDismiss={() => {
            confirmDialogState.resolve(false);
          }}
          dismissButtonLabel={confirmDialogState.options.dismissButtonLabel}
          title={confirmDialogState.options.title}
          message={confirmDialogState.options.message}
        />
      )}
      {confirmDeleteDialogState && (
        <ConfirmDeleteDialog
          open
          onConfirm={() => {
            confirmDeleteDialogState.resolve(true);
          }}
          confirmButtonLabel={
            confirmDeleteDialogState.options.confirmButtonLabel
          }
          onDismiss={() => {
            confirmDeleteDialogState.resolve(false);
          }}
          dismissButtonLabel={
            confirmDeleteDialogState.options.dismissButtonLabel
          }
          title={confirmDeleteDialogState.options.title}
          message={confirmDeleteDialogState.options.message}
          fieldMessage={confirmDeleteDialogState.options.fieldMessage}
          confirmText={confirmDeleteDialogState.options.confirmText}
        />
      )}
    </AlertContext.Provider>
  );
}
