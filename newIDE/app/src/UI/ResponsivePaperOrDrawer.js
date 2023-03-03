// @flow
import * as React from 'react';
import Paper from './Paper';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import Drawer from '@material-ui/core/Drawer';

const styles = {
  paper: {
    display: 'flex',
    width: 250,
  },
  drawerPaper: {
    display: 'flex',
  },
};

const drawerPaperProps = {
  style: styles.drawerPaper,
};

const drawerModalProps = {
  keepMounted: true,
};

/**
 * Display a Paper element, for medium/large screens, or a Drawer on small screens.
 */
export const ResponsivePaperOrDrawer = ({
  open,
  onClose,
  children,
}: {|
  open: boolean,
  onClose: () => void,
  children: React.Node,
|}) => {
  const windowWidth = useResponsiveWindowWidth();
  if (windowWidth !== 'small') {
    if (!open) return null;
    return (
      <Paper style={styles.paper} background="medium">
        {children}
      </Paper>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={drawerPaperProps}
      ModalProps={drawerModalProps}
    >
      {children}
    </Drawer>
  );
};
