// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

const styles = {
  dot: {
    marginRight: 4,
    flexShrink: 0,
  },
};

const NotificationDot = ({
  color,
  size = 6,
}: {
  size?: number,
  color: 'notification' | 'warning',
}) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <span
      style={{
        ...styles.dot,
        height: size,
        width: size,
        borderRadius: Math.ceil(size / 2),
        backgroundColor:
          color === 'notification'
            ? gdevelopTheme.notification.badgeColor
            : gdevelopTheme.statusIndicator.warning,
      }}
    />
  );
};

export default NotificationDot;
