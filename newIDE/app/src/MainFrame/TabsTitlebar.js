// @flow
import * as React from 'react';
import ThemeContext from '../UI/Theme/ThemeContext';
import optionalRequire from '../Utils/OptionalRequire';
import { isMacLike } from '../Utils/Platform';
import Window from '../Utils/Window';
const electron = optionalRequire('electron');

type Props = {|
  children: React.Node,
|};

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

const styles = {
  container: { display: 'flex', flexShrink: 0 },
  rightSide: { flex: 1 },
};

export default function TabsTitlebar({ children }: Props) {
  const gdevelopTheme = React.useContext(ThemeContext);
  const backgroundColor = gdevelopTheme.titlebar.backgroundColor;
  React.useEffect(
    () => {
      Window.setTitleBarColor(backgroundColor);
    },
    [backgroundColor]
  );

  const isMacos = !!electron && isMacLike();
  const isWindowsOrLinux = !!electron && !isMacLike();

  return (
    <div style={{ ...styles.container, backgroundColor }}>
      <div
        style={{
          width: isMacos ? 80 : 8,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
      {children}
      <div
        style={{
          ...styles.rightSide,
          minWidth: isWindowsOrLinux ? 150 : 0,
        }}
        className={DRAGGABLE_PART_CLASS_NAME}
      />
    </div>
  );
}
