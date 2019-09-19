// @flow
import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = {
  defaultBody: {
    overflowX: 'hidden',
  },
  noMarginBody: {
    padding: 0,
    overflowX: 'hidden',
  },
  flexRowBody: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexBody: {
    display: 'flex',
  },
  actionsContainerWithSecondaryActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  noTitleMargin: {
    padding: 0,
  },
};

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  open?: boolean,
  title?: React.Node,
  actions?: React.Node,
  secondaryActions?: React.Node,
  onRequestClose?: () => void,

  modal?: boolean, // Force the user to use one of the actions in the Dialog. Clicking outside the Dialog will not trigger the onRequestClose.

  children: React.Node, // The content of the dialog

  // Display:
  flexRowBody?: boolean, //Check if necessary
  flexBody?: boolean,

  // Size
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false,

  // Style:
  noMargin?: boolean,
  noTitleMargin?: boolean,

  // Positioning:
  autoScrollBodyContent?: boolean, // TODO
  repositionOnUpdate?: boolean, // TODO
|};

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
export default (props: Props) => {
  const {
    secondaryActions,
    actions,
    open,
    onRequestClose,
    maxWidth,
    noMargin,
    title,
    children,
    flexRowBody,
    flexBody,
    noTitleMargin,
  } = props;
  const dialogActions = secondaryActions ? (
    <React.Fragment>
      <div key="secondary-actions">{secondaryActions}</div>
      <div key="actions">{actions}</div>
    </React.Fragment>
  ) : (
    actions
  );

  // TODO: On very small screens, make the dialogs always fullscreen
  // TODO: Fix font
  // TODO: Fix AboutDialog width
  return (
    <Dialog
      open={open}
      onClose={onRequestClose}
      fullWidth
      maxWidth={maxWidth !== undefined ? maxWidth : 'md'}
    >
      {title && (
        <DialogTitle style={noTitleMargin ? styles.noTitleMargin : undefined}>
          {title}
        </DialogTitle>
      )}
      <DialogContent
        style={{
          ...(noMargin ? styles.noMarginBody : styles.defaultBody),
          ...(flexRowBody ? styles.flexRowBody : {}),
          ...(flexBody ? styles.flexBody : {}),
        }}
      >
        {children}
      </DialogContent>
      <DialogActions
        style={
          secondaryActions
            ? styles.actionsContainerWithSecondaryActions
            : undefined
        }
      >
        {dialogActions}
      </DialogActions>
    </Dialog>
  );
};
