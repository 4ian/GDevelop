import React from 'react';
import Dialog from 'material-ui/Dialog';

const styles = {
  defaultBody: {
    overflowX: 'hidden',
  },
  noMarginBody: {
    padding: 0,
    overflowX: 'hidden',
  },
  actionsContainer: {},
  actionsContainerWithSecondaryActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
};

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
export default props => {
  const { secondaryActions, actions, noMargin, ...otherProps } = props;
  const dialogActions = secondaryActions
    ? [
        <div key="secondary-actions">{secondaryActions}</div>,
        <div key="actions">{actions}</div>,
      ]
    : actions;

  return (
    <Dialog
      bodyStyle={noMargin ? styles.noMarginBody : styles.defaultBody}
      actionsContainerStyle={
        secondaryActions
          ? styles.actionsContainerWithSecondaryActions
          : styles.actionsContainer
      }
      actions={dialogActions}
      {...otherProps}
    />
  );
};
