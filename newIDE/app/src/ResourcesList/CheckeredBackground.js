// @flow
import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';

/**
 * Adds a checkered background to the container element.
 * This component is made to be used as background for sprite editors
 * and previews. Example usage:
 * ```
 * <ContainerElement>
 *   <CheckeredBackground />
 *   <SpriteResource />
 *   (... and any overlays ...)
 * </ContainerElement>
 * ```
 *
 * If while using this, the background overflows out of the parent element
 * (or it just doesn't work as expected), ensure that the parent element and
 * at least one of the sibling elements have `position: relative` set.
 */
const CheckeredBackground = () => {
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
  };

  return <div style={backgroundStyle} />;
};

export default CheckeredBackground;
