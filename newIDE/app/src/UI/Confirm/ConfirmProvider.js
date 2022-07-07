// @flow
import * as React from 'react';
import ConfirmContext from './ConfirmContext';
import ConfirmDialog from './ConfirmDialog';

type Props = {| children: React.Node |};

function ConfirmProvider({ children }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = React.useState({});

  const openDialog = ({ title, message, actionCallback }) => {
    setDialogOpen(true);
    setDialogConfig({ title, message, actionCallback });
  };

  const onConfirm = () => {
    setDialogOpen(false);
    dialogConfig.actionCallback(true);
  };

  const onDismiss = () => {
    setDialogOpen(false);
    dialogConfig.actionCallback(false);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirmDialog: openDialog }}>
      {children}
      <ConfirmDialog
        open={dialogOpen}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
        title={dialogConfig.title}
        message={dialogConfig.message}
      />
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
