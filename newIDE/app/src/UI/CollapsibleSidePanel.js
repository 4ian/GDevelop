// @flow
import * as React from 'react';
import classNames from 'classnames';
import classes from './CollapsibleSidePanel.module.css';

type Props = {|
  open: boolean,
  /** The width of the panel when open, in pixels. */
  width: number,
  /** The side of the parent the panel is attached to, it slides out on it. */
  anchor: 'left' | 'right',
  children: React.Node,
|};

/**
 * A panel displayed on the side of its parent (a flex row), sliding in and
 * out when opened and closed. Its content stays mounted while closed, so
 * that its state is kept, but is hidden and not focusable.
 */
const CollapsibleSidePanel = ({
  open,
  width,
  anchor,
  children,
}: Props): React.Node => (
  <div
    className={classNames(classes.container, {
      [classes.containerOpen]: open,
    })}
    style={{ width: open ? width : 0 }}
    aria-hidden={!open}
  >
    <div
      className={classNames(classes.content, {
        [classes.contentClosedLeft]: !open && anchor === 'left',
        [classes.contentClosedRight]: !open && anchor === 'right',
      })}
      style={{ width }}
    >
      {children}
    </div>
  </div>
);

export default CollapsibleSidePanel;
