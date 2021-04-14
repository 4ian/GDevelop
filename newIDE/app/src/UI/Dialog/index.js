// @flow
import * as React from 'react';
import { Dialog as DialogMaterialUI } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useResponsiveWindowWidth } from '../Reponsive/ResponsiveWindowMeasurer';
import classNames from 'classnames';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';

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
  fullHeightModal: {
    minHeight: 'calc(100% - 64px)',
  },
};

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  open?: boolean,
  title?: React.Node,
  actions?: React.Node,
  secondaryActions?: React.Node,

  /**
   * Callback called when the dialog is asking to be closed
   * (either by Escape key or a click outside, according to preferences).
   * This is the default way of closing a dialog and should almost always be
   * specified - unless your dialog is an representing an uninteruptible process.
   *
   * If `onApply` is also specified, this must be interpreted as a "cancelling"
   * of changes.
   */
  onRequestClose?: () => void,
  /**
   * Is specified, will be called when the dialog is dismissed in a way where changes
   * must be kept.
   * This is not applicable to all dialogs. Some dialogs may have no `onApply` and just a
   * single `onRequestClose`.
   */
  onApply?: () => void,

  cannotBeDismissed?: boolean, // Currently unused.

  children: React.Node, // The content of the dialog

  // Display:
  flexRowBody?: boolean, //Check if necessary
  flexBody?: boolean,

  // Size
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false,
  fullHeight?: boolean,

  // Style:
  noMargin?: boolean,
  noTitleMargin?: boolean,
|};

// Help Flow to understand the type of the dialog content style.
type DialogContentStyle = {
  padding?: 0,
  overflowX?: 'hidden',
  display?: 'flex',
  flexDirection?: 'row',
};

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
export default (props: Props) => {
  const {
    onApply,
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
    fullHeight,
    noTitleMargin,
  } = props;

  const preferences = React.useContext(PreferencesContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;
  const size = useResponsiveWindowWidth();

  const dialogActions = secondaryActions ? (
    <React.Fragment>
      <div key="secondary-actions">{secondaryActions}</div>
      <div key="actions">{actions}</div>
    </React.Fragment>
  ) : (
    actions
  );

  const dialogContentStyle: DialogContentStyle = {
    ...(noMargin ? styles.noMarginBody : styles.defaultBody),
    ...((flexRowBody ? styles.flexRowBody : {}): DialogContentStyle),
    ...((flexBody ? styles.flexBody : {}): DialogContentStyle),
  };

  return (
    <DialogMaterialUI
      open={open}
      onClose={(event: any, reason: string) => {
        if (reason === 'escapeKeyDown') {
          if (onRequestClose) onRequestClose();
        } else if (reason === 'backdropClick') {
          if (backdropClickBehavior === 'cancel') {
            if (onRequestClose) onRequestClose();
          } else if (backdropClickBehavior === 'apply') {
            if (onApply) onApply();
            else if (onRequestClose) onRequestClose();
          } else if (backdropClickBehavior === 'nothing') {
            return;
          }
        }
      }}
      fullWidth
      fullScreen={size === 'small'}
      className={classNames({
        'safe-area-aware-container': size === 'small',
      })}
      PaperProps={{ style: fullHeight ? styles.fullHeightModal : {} }}
      maxWidth={maxWidth !== undefined ? maxWidth : 'md'}
      disableBackdropClick={false}
    >
      {title && (
        <DialogTitle style={noTitleMargin ? styles.noTitleMargin : undefined}>
          {title}
        </DialogTitle>
      )}
      <DialogContent style={dialogContentStyle}>{children}</DialogContent>
      <DialogActions
        style={
          secondaryActions
            ? styles.actionsContainerWithSecondaryActions
            : undefined
        }
      >
        {dialogActions}
      </DialogActions>
    </DialogMaterialUI>
  );
};
