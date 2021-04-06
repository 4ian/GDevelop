// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';
import checkeredBackgroundStyle from '../CheckeredBackground';

const styles = {
  previewContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  icon: { width: 60, height: 60 },
};

type Props = {|
  renderIcon: ({| style: Object |}) => React.Node,
|};

/**
 * Display a generic container to display an icon.
 */
export default ({ renderIcon }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);

  return (
    <div
      style={{ ...styles.previewContainer, ...checkeredBackgroundStyle(theme) }}
    >
      {renderIcon({ style: styles.icon })}
    </div>
  );
};
