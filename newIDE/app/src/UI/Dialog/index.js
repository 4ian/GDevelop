// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiDialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useResponsiveWindowWidth } from '../Reponsive/ResponsiveWindowMeasurer';
import classNames from 'classnames';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import {
  shouldCloseOrCancel,
  shouldSubmit,
} from '../KeyboardShortcuts/InteractionKeys';
import { LineStackLayout } from '../Layout';
import RaisedButton from '../RaisedButton';

const styles = {
  defaultBody: {
    overflowX: 'hidden',
  },
  noMarginBody: {
    padding: 0,
    overflowX: 'hidden',
  },
  flexColumnBody: {
    display: 'flex',
    flexDirection: 'column',
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

const useDangerousStyles = makeStyles(theme => ({
  paper: {
    '&:before': {
      content: '""',
      height: 60,
      background: `repeating-linear-gradient(110deg, ${
        theme.palette.error.dark
      }, ${theme.palette.error.dark} 25px, ${theme.palette.error.main} 25px, ${
        theme.palette.error.main
      } 40px)`,
    },
  },
}));

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  open?: boolean,
  title?: React.Node,
  actions?: Array<?React.Node>,
  secondaryActions?: Array<?React.Node>,
  isDangerous?: boolean,

  /**
   * Callback called when the dialog is asking to be closed
   * (either by Escape key or a click outside, according to preferences).
   * This is the default way of closing a dialog and should almost always be
   * specified - unless your dialog is representing an uninteruptible process.
   *
   * If `onApply` is also specified, this must be interpreted as a "cancelling"
   * of changes.
   */
  onRequestClose?: () => void | Promise<void>,

  /**
   * If specified, will be called when the dialog is dismissed in a way where changes
   * must be kept or when using the submit keyboard shortcut.
   * This is not applicable to all dialogs. Some dialogs may have no `onApply` and just a
   * single `onRequestClose`.
   */
  onApply?: ?() => void | Promise<void>,

  /**
   * If specified, allows to prevent closing the dialog by clicking outside.
   * This is useful for dialogs that either are in a loading state so we don't want to allow closing it,
   * or for dialogs that may apply significant changes and we don't want the user to misclick.
   */
  cannotBeDismissed?: boolean,

  children: React.Node, // The content of the dialog

  // Display:
  flexColumnBody?: boolean,
  flexBody?: boolean,

  // Size
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false,
  fullHeight?: boolean,

  // Style:
  noMargin?: boolean,
  noTitleMargin?: boolean,

  id?: ?string,
|};

// Help Flow to understand the type of the dialog content style.
type DialogContentStyle = {
  padding?: 0,
  overflowX?: 'hidden',
  display?: 'flex',
  flexDirection?: 'row' | 'column',
};

export const DialogPrimaryButton = RaisedButton;

/**
 * A enhanced material-ui Dialog that can have optional secondary actions
 * and no margins if required.
 */
const Dialog = ({
  onApply,
  secondaryActions,
  isDangerous,
  actions,
  open,
  onRequestClose,
  maxWidth,
  noMargin,
  title,
  children,
  flexColumnBody,
  flexBody,
  fullHeight,
  noTitleMargin,
  id,
  cannotBeDismissed,
}: Props) => {
  const preferences = React.useContext(PreferencesContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;
  const size = useResponsiveWindowWidth();

  const classesForDangerousDialog = useDangerousStyles();

  const dialogActions = React.useMemo(
    () => (
      <React.Fragment>
        {secondaryActions && (
          <LineStackLayout key="secondary-actions" noMargin>
            {secondaryActions}
          </LineStackLayout>
        )}
        {actions && (
          <LineStackLayout key="actions" noMargin>
            {actions}
          </LineStackLayout>
        )}
      </React.Fragment>
    ),
    [actions, secondaryActions]
  );

  const dialogContentStyle: DialogContentStyle = {
    ...(noMargin ? styles.noMarginBody : styles.defaultBody),
    ...((flexColumnBody ? styles.flexColumnBody : {}): DialogContentStyle),
    ...((flexBody ? styles.flexBody : {}): DialogContentStyle),
  };

  const onCloseDialog = React.useCallback(
    (event: any, reason: string) => {
      if (!!cannotBeDismissed) return;
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
    },
    [onRequestClose, onApply, backdropClickBehavior, cannotBeDismissed]
  );

  const handleKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLElement>) => {
      // When specifying a onKeyDown props, the MUIDialog does not handle
      // the close on escape key feature anymore so it should be handled here.
      if (shouldCloseOrCancel(event)) {
        onCloseDialog(event, 'escapeKeyDown');
        event.stopPropagation();
        return;
      }

      if (onApply && shouldSubmit(event)) {
        event.stopPropagation();
        const element = document.activeElement;
        if (element) element.blur();

        onApply();
      }
    },
    [onCloseDialog, onApply]
  );

  return (
    <MuiDialog
      classes={isDangerous ? classesForDangerousDialog : undefined}
      open={open}
      onClose={onCloseDialog}
      fullWidth
      fullScreen={size === 'small'}
      className={classNames({
        'safe-area-aware-container': size === 'small',
      })}
      PaperProps={{ style: fullHeight ? styles.fullHeightModal : {}, id }}
      maxWidth={maxWidth !== undefined ? maxWidth : 'md'}
      disableBackdropClick={false}
      onKeyDown={handleKeyDown}
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
    </MuiDialog>
  );
};

export default Dialog;
