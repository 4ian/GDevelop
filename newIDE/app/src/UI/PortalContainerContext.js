// @flow
import * as React from 'react';

/**
 * Context that provides the DOM element where Material-UI portals
 * (Dialog, Menu, Popover, Popper, Tooltip, Drawer) should render.
 *
 * In the main window, this is undefined (meaning MUI uses its default
 * behavior of appending to document.body). In a popped-out separate
 * window (see WindowPortal), this is set to the container div in the
 * external window's document so that overlays render in the correct
 * window.
 */
const PortalContainerContext: React.Context<?HTMLElement> = React.createContext<?HTMLElement>(
  undefined
);

export default PortalContainerContext;
