// @flow
import * as React from 'react';
import Paper from './Paper';
import { useResponsiveWindowSize } from './Responsive/ResponsiveWindowMeasurer';
import Drawer from '@material-ui/core/Drawer';

const styles = {
  paper: {
    display: 'flex',
    width: 250,
  },
  drawerPaper: {
    display: 'flex',
    maxWidth: '80%', // Ensure it can always be closed on small screens.
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
  const { isMobile } = useResponsiveWindowSize();
  if (!isMobile) {
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
