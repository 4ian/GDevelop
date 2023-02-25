// @flow
import * as React from 'react';
import AlertContext from './AlertContext';

const useAlertDialog = () => {
  const {
    showAlertDialog,
    showConfirmDialog,
    showConfirmDeleteDialog,
  } = React.useContext(AlertContext);

  return {
    showAlert: showAlertDialog,
    showConfirmation: showConfirmDialog,
    showDeleteConfirmation: showConfirmDeleteDialog,
  };
};

export default useAlertDialog;
