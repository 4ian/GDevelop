// @flow
import * as React from 'react';
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

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  open?: boolean,
  noMargin?: boolean,
  title?: React.Node,
  actions?: React.Node,
  secondaryActions?: React.Node,

  onRequestClose?: () => void,

  modal?: boolean, // Force the user to use one of the actions in the Dialog. Clicking outside the Dialog will not trigger the onRequestClose.

  children: React.Node, // The content of the dialog

  // Style:
  contentStyle?: {|
    maxWidth?: string | number,
    width?: string,
  |},
  titleStyle?: {| padding?: 0 |},
  bodyStyle?: {|
    padding?: 0,
    display?: 'flex',
    flexDirection?: 'row',
    overflowX?: 'hidden',
  |},

  // Positioning:
  autoScrollBodyContent?: boolean,
  repositionOnUpdate?: boolean,
|};

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
export default (props: Props) => {
  const { secondaryActions, actions, noMargin, title, ...otherProps } = props;
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
      title={title ? <h3>{title}</h3> : null} // Explictly pass a h3 like done in default implementation https://github.com/mui-org/material-ui/blob/v0.x/src/Dialog/Dialog.js#L315
      // This is done to support passing translated strings (<Trans>) as title
      {...otherProps}
    />
  );
};
