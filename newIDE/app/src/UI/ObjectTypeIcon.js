// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import {
  OBJECT_TYPE_ICONS_STYLE,
  getObjectTypeIconForPaletteType,
  isObjectTypeIconsStyleTinted,
} from '../ObjectsRendering/ObjectTypeIcons';

type Props = {|
  src: string,
  width: number,
  height: number,
  title?: string,
  disabled?: boolean,
|};

/**
 * Display an object type icon from `res/object-icons/`, adapted to the theme.
 */
const ObjectTypeIcon = ({
  src,
  width,
  height,
  title,
  disabled,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  if (isObjectTypeIconsStyleTinted(OBJECT_TYPE_ICONS_STYLE)) {
    const maskImage = `url(${src})`;
    return (
      <span
        role="img"
        aria-label={title}
        title={title}
        style={{
          display: 'inline-block',
          width,
          height,
          verticalAlign: 'middle',
          backgroundColor: disabled
            ? gdevelopTheme.text.color.disabled
            : gdevelopTheme.text.color.primary,
          WebkitMaskImage: maskImage,
          maskImage,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }

  return (
    <img
      title={title}
      alt={title}
      src={getObjectTypeIconForPaletteType(src, gdevelopTheme.palette.type)}
      style={{
        width,
        height,
        verticalAlign: 'middle',
        opacity: disabled ? 0.5 : undefined,
      }}
    />
  );
};

export default ObjectTypeIcon;
