// @flow
import React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import ThumbnailImage from './ThumbnailImage';
import { type Thumbnail } from '../ObjectsRendering/Thumbnail';
// No i18n in this file

type SizeProps =
  | {|
      iconSize: number,
    |}
  | {|
      iconWidth: number,
      iconHeight: number,
    |};

type Props = {|
  src: string,
  /** Optional thumbnail data for spritesheet frame support. If provided with a project, will render spritesheet frames correctly. */
  thumbnail?: ?Thumbnail,
  /** Project is required for spritesheet frame display */
  project?: ?gdProject,
  brightness?: ?number,
  tooltip?: string,
  disabled?: boolean,
  /**
   * Set true if icon is either an icon loaded from the
   * app or a base64 encoded SVG in a data url.
   */
  isGDevelopIcon?: boolean,
  useExactIconSize?: boolean,
  ...SizeProps,
|};

/**
 * An icon that can be used as the leftIcon of a ListItem.
 * Supports spritesheet frames when thumbnail and project are provided.
 */
function ListIcon(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;

  const {
    src,
    thumbnail,
    project,
    tooltip,
    disabled,
    isGDevelopIcon,
    useExactIconSize,
    brightness,
  } = props;

  const iconWidth =
    props.iconWidth !== undefined ? props.iconWidth : props.iconSize;
  const iconHeight =
    props.iconHeight !== undefined ? props.iconHeight : props.iconSize;

  // The material-ui List component reserves 56 pixels for the icon, so the maximum
  // size is 40px before we start consuming the padding space between the icon and
  // the text. Add it back if necessary
  const paddingRight = iconWidth > 40 ? 16 : 0;

  const isBlackIcon =
    src.startsWith('data:image/svg+xml') || src.includes('_black');
  const shouldInvertGrayScale = paletteType === 'dark' && isBlackIcon;

  let filter = undefined;
  if (brightness != null && Number.isFinite(brightness)) {
    filter = `grayscale(1) invert(1) brightness(${brightness})`;
  } else if (shouldInvertGrayScale) {
    filter = 'grayscale(1) invert(1)';
  } else if (isGDevelopIcon && !isBlackIcon) {
    filter = disabled
      ? 'grayscale(100%)'
      : gdevelopTheme.gdevelopIconsCSSFilter;
  }

  const style = {
    maxWidth: useExactIconSize ? undefined : iconWidth,
    maxHeight: useExactIconSize ? undefined : iconHeight,
    width: useExactIconSize ? iconWidth : undefined,
    height: useExactIconSize ? iconHeight : undefined,
    verticalAlign: 'middle', // Vertical centering
    filter,
  };

  const containerStyle = {
    width: iconWidth,
    height: iconHeight,
    lineHeight: `${iconHeight}px`, // Vertical centering
    textAlign: 'center', // Horizontal centering
    paddingRight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // If thumbnail with spritesheet frame is provided and we have a project, use ThumbnailImage
  if (thumbnail && thumbnail.spritesheetFrame && project) {
    return (
      <div style={containerStyle}>
        <ThumbnailImage
          project={project}
          thumbnail={thumbnail}
          alt={tooltip}
          title={tooltip}
          maxWidth={iconWidth}
          maxHeight={iconHeight}
          filter={filter}
        />
      </div>
    );
  }

  // For regular images, use the existing approach
  return (
    <div style={containerStyle}>
      {isGDevelopIcon ? (
        <img title={tooltip} alt={tooltip} src={src} style={style} />
      ) : (
        <CorsAwareImage title={tooltip} alt={tooltip} src={src} style={style} />
      )}
    </div>
  );
}

const ListIconMemo = React.memo<Props>(ListIcon);
export default ListIconMemo;
