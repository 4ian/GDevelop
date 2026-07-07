// @flow
import * as React from 'react';
import MenuIcon from '../UI/CustomSvgIcons/Menu';
import PinIcon from '../UI/CustomSvgIcons/Pin';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from '../UI/MobileSoftKeyboard';
import { dataObjectToProps } from '../Utils/HTMLDataset';
import DrawerTopBar from '../UI/DrawerTopBar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../UI/Tooltip';
import { Trans } from '@lingui/macro';

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  pinnedContent: {
    width: 320,
    flex: '0 0 320px',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'var(--theme-surface-window-background-color)',
    borderRight: '1px solid var(--theme-toolbar-separator-color)',
  },
};

type Props = {|
  title: string,
  projectManagerOpen: boolean,
  closeProjectManager: () => void,
  onPinProjectManager: () => void,
  isPinned?: boolean,
  children: React.Node | null,
|};

export const ProjectManagerDrawer = ({
  title,
  children,
  projectManagerOpen,
  closeProjectManager,
  onPinProjectManager,
  isPinned,
}: Props): React.Node => {
  const softKeyboardBottomOffset = useSoftKeyboardBottomOffset();

  if (isPinned) {
    return (
      <div style={styles.pinnedContent}>
        <DrawerTopBar
          icon={<MenuIcon />}
          title={title}
          onClose={closeProjectManager}
          id="project-manager-pinned"
        />
        {children}
      </div>
    );
  }

  return (
    <Drawer
      open={projectManagerOpen}
      PaperProps={{
        style: {
          ...styles.drawerContent,
          ...getAvoidSoftKeyboardStyle(softKeyboardBottomOffset),
        },
        className: 'safe-area-aware-left-container',
      }}
      ModalProps={{
        keepMounted: true,
      }}
      onClose={closeProjectManager}
      {...dataObjectToProps({
        open: projectManagerOpen ? 'true' : undefined,
      })}
    >
      <DrawerTopBar
        icon={<MenuIcon />}
        title={title}
        onClose={closeProjectManager}
        rightAction={
          <Tooltip
            title={<Trans>Pin menu to the left</Trans>}
            placement="bottom"
            enterDelay={tooltipEnterDelay}
          >
            <IconButton
              onClick={onPinProjectManager}
              color="inherit"
              size="small"
              id="project-manager-drawer-pin"
            >
              <PinIcon />
            </IconButton>
          </Tooltip>
        }
        id="project-manager-drawer"
      />
      {children}
    </Drawer>
  );
};
