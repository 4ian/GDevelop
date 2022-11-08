// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiDialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import classNames from 'classnames';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  shouldCloseOrCancel,
  shouldSubmit,
} from './KeyboardShortcuts/InteractionKeys';
import { LineStackLayout } from './Layout';
import RaisedButton from './RaisedButton';
import Text from './Text';
import Cross from './CustomSvgIcons/Cross';
import IconButton from './IconButton';
import { Line } from './Grid';
import GDevelopThemeContext from './Theme/ThemeContext';

// Default.
const dialogPaddingX = 24;
const dialogTitlePaddingTop = 16;
const dialogTitlePaddingBottom = 16;
const dialogActionPaddingTop = 24;
const dialogActionPaddingBottom = 16;

// Mobile.
const dialogSmallPaddingX = 8;

const styles = {
  dialogContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    marginTop: dialogTitlePaddingTop,
    marginBottom: dialogActionPaddingBottom,
    marginLeft: dialogPaddingX,
    marginRight: dialogPaddingX,
  },
  dialogSmallContainer: {
    marginLeft: dialogSmallPaddingX,
    marginRight: dialogSmallPaddingX,
  },
  dialogContent: {
    overflowX: 'hidden',
    paddingLeft: 0, // Remove the default padding of MUI DialogContent.
    paddingRight: 0, // Remove the default padding of MUI DialogContent.
  },
  flexColumnBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexBody: {
    display: 'flex',
  },
  titleContainer: {
    paddingBottom: dialogTitlePaddingBottom,
    textAlign: 'left',
  },
  fixedContentContainer: {
    paddingBottom: 8,
  },
  actionsContainer: {
    paddingTop: dialogActionPaddingTop,
    paddingLeft: 0, // Remove the default padding of MUI DialogContent.
    paddingRight: 0, // Remove the default padding of MUI DialogContent.
  },
  actionsContainerWithSecondaryActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  fullHeightModal: {
    minHeight: 'calc(100% - 64px)',
  },
};

const useDangerousStylesForDialog = makeStyles(theme => ({
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

// Customize scrollbar inside Dialog so that it gives a bit of space
// to the content.
const useStylesForDialogContent = makeStyles({
  root: {
    '&::-webkit-scrollbar': {
      width: 11,
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.04)',
      borderRadius: 6,
    },
    '&::-webkit-scrollbar-thumb': {
      border: '3px solid rgba(0, 0, 0, 0)',
      backgroundClip: 'padding-box',
      borderRadius: 6,
    },
  },
});

// Customize the background appearing when the dialog is open, based on the theme.
const useStylesForDialogBackdrop = makeStyles({
  root: {
    backdropFilter: 'blur(1px)',
  },
});

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type DialogProps = {|
  open?: boolean,
  title: React.Node,
  fixedContent?: React.Node,
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
  noMobileFullScreen?: boolean,

  id?: ?string,
|};

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
  title,
  fixedContent,
  children,
  flexColumnBody,
  flexBody,
  fullHeight,
  id,
  cannotBeDismissed,
  noMobileFullScreen,
}: DialogProps) => {
  const preferences = React.useContext(PreferencesContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;
  const size = useResponsiveWindowWidth();
  const hasActions =
    (actions && actions.filter(Boolean).length > 0) ||
    (secondaryActions && secondaryActions.filter(Boolean).length > 0);

  const classesForDangerousDialog = useDangerousStylesForDialog();
  const classesForDialogContent = useStylesForDialogContent();
  const classesForDialogBackdrop = useStylesForDialogBackdrop();

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

  const flexStyle = flexColumnBody
    ? styles.flexColumnBody
    : flexBody
    ? styles.flexBody
    : {};
  const additionalPaddingStyle = {
    paddingTop: title ? 0 : dialogTitlePaddingTop,
    paddingBottom: hasActions ? 0 : dialogActionPaddingBottom,
  };
  const contentStyle = {
    ...styles.dialogContent,
    ...flexStyle,
    ...additionalPaddingStyle,
  };

  const dialogContainerStyle = {
    ...styles.dialogContainer,
    ...(size === 'small' ? styles.dialogSmallContainer : {}),
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
      fullScreen={size === 'small' && !noMobileFullScreen}
      className={classNames({
        'safe-area-aware-container': size === 'small',
      })}
      PaperProps={{
        id,
        style: {
          backgroundColor: gdevelopTheme.dialog.backgroundColor,
          ...(fullHeight ? styles.fullHeightModal : {}),
        },
      }}
      maxWidth={maxWidth !== undefined ? maxWidth : 'md'}
      disableBackdropClick={false}
      onKeyDown={handleKeyDown}
      BackdropProps={{
        classes: classesForDialogBackdrop,
      }}
    >
      <div style={dialogContainerStyle}>
        {title && (
          <div style={styles.titleContainer}>
            <Line noMargin justifyContent="space-between">
              <Text noMargin size="section-title">
                {title}
              </Text>
              {onRequestClose && !cannotBeDismissed && (
                <IconButton
                  onClick={onRequestClose}
                  size="small"
                  disabled={cannotBeDismissed}
                >
                  <Cross />
                </IconButton>
              )}
            </Line>
          </div>
        )}
        {fixedContent && (
          <div style={styles.fixedContentContainer}>{fixedContent}</div>
        )}
        <DialogContent classes={classesForDialogContent} style={contentStyle}>
          {children}
        </DialogContent>
        {hasActions && (
          <DialogActions
            style={{
              ...styles.actionsContainer,
              ...(secondaryActions
                ? styles.actionsContainerWithSecondaryActions
                : {}),
            }}
          >
            {dialogActions}
          </DialogActions>
        )}
      </div>
    </MuiDialog>
  );
};

export default Dialog;
