// @flow
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MuiDialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from './Responsive/ResponsiveWindowMeasurer';
import classNames from 'classnames';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  shouldCloseOrCancel,
  shouldSubmit,
} from './KeyboardShortcuts/InteractionKeys';
import { ColumnStackLayout, LineStackLayout } from './Layout';
import RaisedButton from './RaisedButton';
import Text from './Text';
import Cross from './CustomSvgIcons/Cross';
import IconButton from './IconButton';
import { Column, Line } from './Grid';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';

import { classNameToStillAllowRenderingInstancesEditor } from './MaterialUISpecificUtil';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from './MobileSoftKeyboard';
import {
  TitleBarLeftSafeMargins,
  TitleBarRightSafeMargins,
} from './TitleBarSafeMargins';

// Default.
const dialogPaddingX = 24;
const dialogTitlePadding = 16;
const dialogActionPadding = 24;

// Mobile.
const dialogSmallPadding = 8;

const getDefaultMaxWidthFromSize = (windowSize: WindowSizeType) => {
  switch (windowSize) {
    case 'small':
      return false; // Full width
    case 'medium':
    case 'large':
      return 'md';
    case 'xlarge':
      return 'lg';
    default:
      return 'md';
  }
};

const styles = {
  dialogContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
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
    textAlign: 'left',
    // Ensure the title can break on any character, to ensure it's visible on mobile. Especially useful for long emails.
    overflowWrap: 'anywhere',
  },
  closeDialogContainer: {
    // Ensure this part can be interacted with on macOS, when the dialog is fullscreen and used as PWA.
    // Otherwise, the close button is not clickable.
    WebkitAppRegion: 'no-drag',
  },
  fixedContentContainer: {
    paddingBottom: 8,
  },
  actionsContainer: {
    paddingTop: dialogActionPadding,
    paddingBottom: 0, // Remove the default padding of MUI DialogActions.
    paddingLeft: 0, // Remove the default padding of MUI DialogActions.
    paddingRight: 0, // Remove the default padding of MUI DialogActions.
  },
  actionsContainerWithSecondaryActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  minHeightForFullHeightModal: 'calc(100% - 64px)',
  minHeightForSmallHeightModal: 'min(100% - 64px, 350px)',
  minHeightForLargeHeightModal: 'min(100% - 64px, 800px)',
  topBackground: {
    position: 'absolute',
    top: 0,
    zIndex: -1,
    left: dialogPaddingX,
    right: dialogPaddingX,
    height: '100%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
  },
};

const useDangerousStylesForDialog = (dangerLevel?: 'warning' | 'danger') =>
  makeStyles(theme => {
    if (!dangerLevel) return {};
    const color =
      dangerLevel === 'warning' ? theme.palette.warning : theme.palette.error;
    return {
      paper: {
        '&:before': {
          content: '""',
          height: 60,
          background: `repeating-linear-gradient(110deg, ${color.dark}, ${
            color.dark
          } 25px, ${color.main} 25px, ${color.main} 40px)`,
        },
      },
    };
  })();

// Customize scrollbar inside Dialog so that it gives a bit of space
// to the content.
const useStylesForDialogContent = ({
  forceScroll,
}: {|
  forceScroll: boolean,
|}) => {
  const useStyles = React.useMemo(
    () =>
      makeStyles({
        root: {
          ...(forceScroll ? { overflowY: 'scroll' } : {}), // Force a scrollbar to prevent layout shifts.
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
      }),
    [forceScroll]
  );
  return useStyles();
};

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type DialogProps = {|
  open?: boolean,
  title: React.Node,
  subtitle?: React.Node,
  fixedContent?: React.Node,
  actions?: Array<?React.Node>,
  secondaryActions?: Array<?React.Node>,
  dangerLevel?: 'warning' | 'danger',

  topBackgroundSrc?: string,

  /**
   * Callback called when the dialog is asking to be closed
   * (either by Escape key or a click outside, according to preferences).
   * This is the default way of closing a dialog and should almost always be
   * specified - unless your dialog is representing an uninterruptible process.
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

  /**
   * Indicates that even when this dialog is opened, the instances editor should still continue to render.
   * Useful to see changes in realtime.
   */
  exceptionallyStillAllowRenderingInstancesEditors?: boolean,

  children: React.Node, // The content of the dialog

  // Display:
  flexColumnBody?: boolean,
  flexBody?: boolean,

  // Size
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false,
  minHeight?: 'sm' | 'lg',
  fullHeight?: boolean,
  fullscreen?: 'never-even-on-mobile' | 'always-even-on-desktop',
  actionsFullWidthOnMobile?: boolean,
  // Useful when the content of the dialog can change and we want to avoid layout shifts.
  forceScrollVisible?: boolean,

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
  dangerLevel,
  actions,
  open,
  onRequestClose,
  maxWidth,
  minHeight,
  title,
  subtitle,
  fixedContent,
  children,
  flexColumnBody,
  flexBody,
  fullHeight,
  id,
  cannotBeDismissed,
  exceptionallyStillAllowRenderingInstancesEditors,
  fullscreen,
  actionsFullWidthOnMobile,
  forceScrollVisible,
  topBackgroundSrc,
}: DialogProps) => {
  const preferences = React.useContext(PreferencesContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;
  const { windowSize, isMobile } = useResponsiveWindowSize();
  const hasActions =
    (actions && actions.filter(Boolean).length > 0) ||
    (secondaryActions && secondaryActions.filter(Boolean).length > 0);
  const isFullScreen =
    fullscreen === 'never-even-on-mobile'
      ? false
      : fullscreen === 'always-even-on-desktop'
      ? true
      : isMobile;

  const classesForDangerousDialog = useDangerousStylesForDialog(dangerLevel);
  const classesForDialogContent = useStylesForDialogContent({
    forceScroll: !!forceScrollVisible,
  });

  const dialogActions = React.useMemo(
    () => (
      <React.Fragment>
        {secondaryActions && (
          <LineStackLayout
            key="secondary-actions"
            noMargin
            expand={isMobile && actionsFullWidthOnMobile}
          >
            {secondaryActions}
          </LineStackLayout>
        )}
        {actions && (
          <LineStackLayout
            key="actions"
            noMargin
            expand={isMobile && actionsFullWidthOnMobile}
          >
            {actions}
          </LineStackLayout>
        )}
      </React.Fragment>
    ),
    [actions, secondaryActions, isMobile, actionsFullWidthOnMobile]
  );

  const flexStyle = flexColumnBody
    ? styles.flexColumnBody
    : flexBody
    ? styles.flexBody
    : {};
  const additionalPaddingStyle = {
    paddingTop: 0, // Let the title container handle the padding, or no padding if there is no title.
    paddingBottom: hasActions ? 0 : dialogActionPadding, // Ensure the padding is here if there are no actions.
  };
  const contentStyle = {
    ...styles.dialogContent,
    ...flexStyle,
    ...additionalPaddingStyle,
  };

  const dialogContainerStyle = {
    ...styles.dialogContainer,
    // Ensure we don't spread an object here, to avoid a styling bug when resizing.
    margin: isFullScreen
      ? dialogSmallPadding
      : `${dialogTitlePadding}px ${dialogPaddingX}px ${dialogActionPadding}px ${dialogPaddingX}px`,
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

  const softKeyboardBottomOffset = useSoftKeyboardBottomOffset();

  const paperMinHeight = fullHeight
    ? styles.minHeightForFullHeightModal
    : minHeight === 'lg'
    ? styles.minHeightForLargeHeightModal
    : minHeight === 'sm'
    ? styles.minHeightForSmallHeightModal
    : undefined;
  const paperStyle = React.useMemo(
    () => ({
      backgroundColor: gdevelopTheme.dialog.backgroundColor,
      minHeight: paperMinHeight,
      ...getAvoidSoftKeyboardStyle(softKeyboardBottomOffset),
    }),
    [
      gdevelopTheme.dialog.backgroundColor,
      paperMinHeight,
      softKeyboardBottomOffset,
    ]
  );

  return (
    <MuiDialog
      classes={classesForDangerousDialog}
      open={open}
      onClose={onCloseDialog}
      fullWidth
      fullScreen={isFullScreen}
      className={classNames({
        'safe-area-aware-container': isFullScreen,
        [classNameToStillAllowRenderingInstancesEditor]: exceptionallyStillAllowRenderingInstancesEditors,
      })}
      PaperProps={{
        id,
        style: paperStyle,
      }}
      maxWidth={
        maxWidth !== undefined
          ? maxWidth
          : getDefaultMaxWidthFromSize(windowSize)
      }
      disableBackdropClick={false}
      onKeyDown={handleKeyDown}
    >
      {topBackgroundSrc && (
        <div
          style={{
            ...styles.topBackground,
            backgroundImage: `url(${topBackgroundSrc})`,
          }}
        />
      )}
      <div style={dialogContainerStyle}>
        <div
          style={{
            ...styles.titleContainer,
            paddingBottom: title ? dialogTitlePadding : 0, // Keep the title container if there is no title, for the close button to be visible, but don't add padding.
          }}
        >
          <Line noMargin justifyContent="space-between" alignItems="flex-start">
            <Line noMargin alignItems="center">
              {isFullScreen && (
                <TitleBarLeftSafeMargins
                  backgroundColor={gdevelopTheme.dialog.backgroundColor}
                />
              )}
              <ColumnStackLayout noMargin>
                <Text noMargin size="section-title">
                  {title}
                </Text>
                {subtitle && <Text noMargin>{subtitle}</Text>}
              </ColumnStackLayout>
            </Line>
            <Column noMargin>
              <Line noMargin alignItems="center">
                {onRequestClose && !cannotBeDismissed && (
                  <div style={styles.closeDialogContainer}>
                    <IconButton
                      onClick={onRequestClose}
                      size="small"
                      disabled={cannotBeDismissed}
                    >
                      <Cross />
                    </IconButton>
                  </div>
                )}
                {isFullScreen && (
                  <TitleBarRightSafeMargins
                    backgroundColor={gdevelopTheme.dialog.backgroundColor}
                  />
                )}
              </Line>
            </Column>
          </Line>
        </div>
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
