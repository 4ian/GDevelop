// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';

type Props = {|
  status: 'success' | 'error' | 'warning',
|};

const StatusIndicator = ({ status }: Props) => {
  const GDevelopTheme = React.useContext(GDevelopThemeContext);

  const color =
    status === 'success'
      ? GDevelopTheme.statusIndicator.success
      : status === 'error'
      ? GDevelopTheme.statusIndicator.error
      : GDevelopTheme.statusIndicator.warning;
  return (
    <div
      style={{
        width: 8,
        height: 8,
        margin: 6,
        borderRadius: 6,
        backgroundColor: color,
      }}
    />
  );
};

export default StatusIndicator;
