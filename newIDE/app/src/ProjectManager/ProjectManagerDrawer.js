// @flow
import * as React from 'react';
import EmptyMessage from '../UI/EmptyMessage';
import { Trans } from '@lingui/macro';
import {
  getAvoidSoftKeyboardStyle,
  useSoftKeyboardBottomOffset,
} from '../UI/MobileSoftKeyboard';
import { dataObjectToProps } from '../Utils/HTMLDataset';
import DrawerTopBar from '../UI/DrawerTopBar';
import Drawer from '@material-ui/core/Drawer';

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

type Props = {|
  title: string,
  projectManagerOpen: boolean,
  toggleProjectManager: () => void,
  children: React.Node | null,
|};

export const ProjectManagerDrawer = ({
  title,
  children,
  projectManagerOpen,
  toggleProjectManager,
}: Props) => {
  const softKeyboardBottomOffset = useSoftKeyboardBottomOffset();

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
      onClose={toggleProjectManager}
      {...dataObjectToProps({
        open: projectManagerOpen ? 'true' : undefined,
      })}
    >
      <DrawerTopBar
        title={title}
        onClose={toggleProjectManager}
        id="project-manager-drawer"
      />
      {children}
      {!children && (
        <EmptyMessage>
          <Trans>To begin, open or create a new project.</Trans>
        </EmptyMessage>
      )}
    </Drawer>
  );
};
