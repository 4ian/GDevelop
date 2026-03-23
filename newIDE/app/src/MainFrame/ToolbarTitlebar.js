// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import IconButton from '../UI/IconButton';
import PopInIcon from '../UI/CustomSvgIcons/PopIn';
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
  renderToolbar: () => React.Node,
  onPopIn: () => void,
|};

/**
 * A titlebar for popped-out editor windows that contains the Toolbar
 * and a pop-in icon button.
 *
 * Unlike TabsTitlebar (used in the main window), this does NOT render
 * TitleBarSafeMargins because popped-out windows (created via window.open)
 * have their own native window frame and controls — the main window's
 * navigator.windowControlsOverlay does not apply here.
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
    </div>
  );
}
