// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import Toolbar, { type ToolbarInterface } from './Toolbar';
import type { MainFrameToolbarProps } from './Toolbar';
import IconButton from '../UI/IconButton';
import PopInIcon from '../UI/CustomSvgIcons/PopIn';
import {
  TitleBarLeftSafeMargins,
  TitleBarRightSafeMargins,
} from '../UI/TitleBarSafeMargins';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const styles = {
  container: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    position: 'relative', // to ensure it is displayed above any global iframe
  },
};

type Props = {|
  toolbarProps: MainFrameToolbarProps,
  onPopIn: () => void,
|};

/**
 * A titlebar for popped-out editor windows that contains safe margins for
 * window controls (like TabsTitlebar does for the main window), the Toolbar,
 * and a pop-in icon button.
 */
const ToolbarTitlebar = React.forwardRef<Props, ToolbarInterface>(
  function ToolbarTitlebar({ toolbarProps, onPopIn }: Props, ref) {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);

    return (
      <div
        className="title-bar-draggable-part"
        style={{
          ...styles.container,
          backgroundColor: gdevelopTheme.toolbar.backgroundColor,
        }}
      >
        <TitleBarLeftSafeMargins />
        <IconButton
          size="small"
          onClick={onPopIn}
          tooltip={t`Pop back into main window`}
          color="default"
          className="title-bar-non-draggable-part"
        >
          <PopInIcon />
        </IconButton>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Toolbar ref={ref} {...toolbarProps} />
        </div>
        <TitleBarRightSafeMargins />
      </div>
    );
  }
);

export default ToolbarTitlebar;
