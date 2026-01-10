// @flow
import React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import {
  type ObjectThumbnail,
  getSpritesheetFrameImageStyle,
  useSpritesheetFrameData,
} from '../ObjectsRendering/Thumbnail';
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
  src: string | ObjectThumbnail,
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
 */
function ListIcon(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paletteType = gdevelopTheme.palette.type;

  const {
    src,
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

  const thumbnail: ObjectThumbnail =
    typeof src === 'string' ? { thumbnailSrc: src } : src;

  const spritesheetFrameData = useSpritesheetFrameData(
    thumbnail.project,
    thumbnail.spritesheetResourceName,
    thumbnail.spritesheetFrameName
  );
  const resolvedSrc = spritesheetFrameData
    ? spritesheetFrameData.imageSrc
    : thumbnail.thumbnailSrc;

  // The material-ui List component reserves 56 pixels for the icon, so the maximum
  // size is 40px before we start consuming the padding space between the icon and
  // the text. Add it back if necessary
  const paddingRight = iconWidth > 40 ? 16 : 0;

  const isBlackIcon =
    resolvedSrc.startsWith('data:image/svg+xml') ||
    resolvedSrc.includes('_black');
  const shouldInvertGrayScale = paletteType === 'dark' && isBlackIcon;

  let filter = undefined;
  if (!spritesheetFrameData) {
    if (brightness != null && Number.isFinite(brightness)) {
      filter = `grayscale(1) invert(1) brightness(${brightness})`;
    } else if (shouldInvertGrayScale) {
      filter = 'grayscale(1) invert(1)';
    } else if (isGDevelopIcon && !isBlackIcon) {
      filter = disabled
        ? 'grayscale(100%)'
        : gdevelopTheme.gdevelopIconsCSSFilter;
    }
  }

  const frameStyle = spritesheetFrameData
    ? getSpritesheetFrameImageStyle(
        spritesheetFrameData,
        iconWidth,
        iconHeight
      )
    : null;

  const style = frameStyle || {
    maxWidth: useExactIconSize ? undefined : iconWidth,
    maxHeight: useExactIconSize ? undefined : iconHeight,
    width: useExactIconSize ? iconWidth : undefined,
    height: useExactIconSize ? iconHeight : undefined,
    verticalAlign: 'middle', // Vertical centering
  };

  return (
    <div
      style={{
        width: iconWidth,
        height: iconHeight,
        lineHeight: `${iconHeight}px`, // Vertical centering
        textAlign: 'center', // Horizontal centering
        paddingRight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {isGDevelopIcon && typeof src === 'string' && !spritesheetFrameData ? (
        <img title={tooltip} alt={tooltip} src={resolvedSrc} style={style} />
      ) : (
        <CorsAwareImage
          title={tooltip}
          alt={tooltip}
          src={resolvedSrc}
          style={{
            ...style,
            filter,
          }}
        />
      )}
    </div>
  );
}

const ListIconMemo = React.memo<Props>(ListIcon);
export default ListIconMemo;
