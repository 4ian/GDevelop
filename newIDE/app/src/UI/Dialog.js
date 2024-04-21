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
import { LineStackLayout } from './Layout';
import RaisedButton from './RaisedButton';
import Text from './Text';
import Cross from './CustomSvgIcons/Cross';
import IconButton from './IconButton';
import { Line } from './Grid';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import useForceUpdate from '../Utils/UseForceUpdate';
import { useWindowControlsOverlayWatcher } from '../Utils/Window';
import { classNameToStillAllowRenderingInstancesEditor } from './MaterialUISpecificUtil';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from './MobileSoftKeyboard';

const electron = optionalRequire('electron');

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

export const DialogTitleBar = ({
  backgroundColor,
}: {|
  backgroundColor: string,
|}) => {
  // An installed PWA can have window controls displayed as overlay. If supported,
  // we set up a listener to detect any change and force a refresh that will read
  // the latest size of the controls.
  const forceUpdate = useForceUpdate();
  useWindowControlsOverlayWatcher({ onChanged: forceUpdate });

  // $FlowFixMe - this API is not handled by Flow.
  const { windowControlsOverlay } = navigator;

  if (!!electron || (windowControlsOverlay && windowControlsOverlay.visible)) {
    // We're on the desktop app, or in an installed PWA with window controls displayed
    // as overlay: we need to display a spacing at the top of the dialog.
    return (
      <div
        className={DRAGGABLE_PART_CLASS_NAME}
        style={{ height: 38, backgroundColor, flexShrink: 0 }}
      />
    );
  }

  // Not on the desktop app, and not in an installed PWA with window controls displayed
  // as overlay: no need to display a spacing.
  return null;
};

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

// We support a subset of the props supported by Material-UI v0.x Dialog
// They should be self descriptive - refer to Material UI docs otherwise.
type DialogProps = {|
  open?: boolean,
  title: React.Node,
  fixedContent?: React.Node,
  actions?: Array<?React.Node>,
  secondaryActions?: Array<?React.Node>,
  dangerLevel?: 'warning' | 'danger',

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
  dangerLevel,
  actions,
  open,
  onRequestClose,
  maxWidth,
  minHeight,
  title,
  fixedContent,
  children,
  flexColumnBody,
  flexBody,
  fullHeight,
  id,
  cannotBeDismissed,
  exceptionallyStillAllowRenderingInstancesEditors,
  noMobileFullScreen,
}: DialogProps) => {
  const preferences = React.useContext(PreferencesContext);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const backdropClickBehavior = preferences.values.backdropClickBehavior;
  const { windowSize, isMobile } = useResponsiveWindowSize();
  const hasActions =
    (actions && actions.filter(Boolean).length > 0) ||
    (secondaryActions && secondaryActions.filter(Boolean).length > 0);
  const isFullScreen = isMobile && !noMobileFullScreen;

  const classesForDangerousDialog = useDangerousStylesForDialog(dangerLevel);
  const classesForDialogContent = useStylesForDialogContent();

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
    paddingTop: title ? 0 : dialogTitlePadding, // Ensure the padding is here if there is no title.
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
        style: {
          backgroundColor: gdevelopTheme.dialog.backgroundColor,
          minHeight: fullHeight
            ? styles.minHeightForFullHeightModal
            : minHeight === 'lg'
            ? styles.minHeightForLargeHeightModal
            : minHeight === 'sm'
            ? styles.minHeightForSmallHeightModal
            : undefined,
          ...getAvoidSoftKeyboardStyle(softKeyboardBottomOffset),
        },
      }}
      maxWidth={
        maxWidth !== undefined
          ? maxWidth
          : getDefaultMaxWidthFromSize(windowSize)
      }
      disableBackdropClick={false}
      onKeyDown={handleKeyDown}
    >
      {isFullScreen && (
        <DialogTitleBar
          backgroundColor={gdevelopTheme.titlebar.backgroundColor}
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
