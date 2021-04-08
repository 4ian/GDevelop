// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';

type Props = {|
  style?: Object,
|};

/**
 * Adds a checkered background to the container element.
 */
const CheckeredBackground = (props: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',

    // Apply a theme-defined CSS filter on static checkered background
    background: 'url("res/transparentback.png") repeat',
    filter: theme.imagePreview.backgroundFilter || 'none',

    ...props.style,
  };

  return <div style={backgroundStyle} />;
};

export default CheckeredBackground;
