// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
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
    paddingLeft: 4,
  },
};

type Props = {|
  renderToolbar: () => React.Node,
  onPopIn: () => void,
|};

/**
 * A titlebar for popped-out editor windows that contains safe margins for
 * window controls (like TabsTitlebar does for the main window), the Toolbar,
 * and a pop-in icon button.
 */
export default function ToolbarTitlebar({
  renderToolbar,
  onPopIn,
}: Props): React.MixedElement {
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
      <div style={{ flex: 1, minWidth: 0 }}>{renderToolbar()}</div>
      <TitleBarRightSafeMargins />
    </div>
  );
}
