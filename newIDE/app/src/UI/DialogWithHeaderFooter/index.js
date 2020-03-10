// @flow
import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ResponsiveWindowMeasurer } from '../Reponsive/ResponsiveWindowMeasurer';
import ScrollView from '../ScrollView';

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
  headerContainerStyle: {
    maxHeight: 80,
    overflow: 'auto',
  },
  mainContainerStyle: {
    maxHeight: 240,
    overflow: 'auto',
  },
  footerContainerStyle: {
    maxHeight: 80,
    overflow: 'auto',
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
    header,
    children,
    footer,
    headerContainerStyle,
    mainContainerStyle,
    footerContainerStyle,
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

  return (
    <ResponsiveWindowMeasurer>
      {size => (
        <Dialog
          open={open}
          onClose={onRequestClose}
          fullWidth
          fullScreen={size === 'small'}
          maxWidth={maxWidth !== undefined ? maxWidth : 'md'}
          disableBackdropClick
        >
          {title && (
            <DialogTitle
              style={noTitleMargin ? styles.noTitleMargin : undefined}
            >
              {title}
            </DialogTitle>
          )}
          <DialogContent
            style={{
              ...(noMargin ? styles.noMarginBody : styles.defaultBody),
              ...(flexRowBody ? styles.flexRowBody : {}),
              ...(flexBody ? styles.flexBody : {}),
              overflow: 'hidden',
            }}
          >
            <ScrollView
              style={{
                ...styles.headerContainerStyle,
                ...headerContainerStyle,
              }}
            >
              {header}
            </ScrollView>
            <ScrollView
              style={{
                ...styles.mainContainerStyle,
                ...mainContainerStyle,
              }}
            >
              {children}
            </ScrollView>
            <ScrollView
              style={{
                ...styles.footerContainerStyle,
                ...footerContainerStyle,
              }}
            >
              {footer}
            </ScrollView>
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
      )}
    </ResponsiveWindowMeasurer>
  );
};
