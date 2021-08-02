import { useState } from 'react';

/**
 * A simple state hook for the MaterialUI Popover component.
 */
export const usePopoverState = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleEvent = event => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return {
    popoverProps: {
      open: !!anchorEl,
      anchorEl,
      onClose: handleClose,
    },
    open: setAnchorEl,
    handleEvent,
    handleClose,
  };
};
