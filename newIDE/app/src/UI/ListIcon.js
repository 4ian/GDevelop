// @flow
import React from 'react';
import { CorsAwareImage } from './CorsAwareImage';
import GDevelopThemeContext from './Theme/ThemeContext';
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
  tooltip?: string,
  disabled?: boolean,
  isGDevelopIcon?: boolean,
  cssAnimation?: string,
  useExactIconSize?: boolean,
  ...SizeProps,
|};

/**
 * An icon that can be used as the leftIcon of a ListItem.
 * See also ToolbarIcon.
 */
function ListIcon(props: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    src,
    tooltip,
    disabled,
    isGDevelopIcon,
    cssAnimation,
    useExactIconSize,
  } = props;

  const iconWidth =
    props.iconWidth !== undefined ? props.iconWidth : props.iconSize;
  const iconHeight =
    props.iconHeight !== undefined ? props.iconHeight : props.iconSize;

  // The material-ui List component reserves 56 pixels for the icon, so the maximum
  // size is 40px before we start consuming the padding space between the icon and
  // the text. Add it back if necessary
  const paddingRight = iconWidth > 40 ? 16 : 0;

  const style = {
    maxWidth: useExactIconSize ? undefined : iconWidth,
    maxHeight: useExactIconSize ? undefined : iconHeight,
    width: useExactIconSize ? iconWidth : undefined,
    height: useExactIconSize ? iconHeight : undefined,
    verticalAlign: 'middle', // Vertical centering
    animation: cssAnimation,
    filter: !isGDevelopIcon
      ? undefined
      : disabled
      ? 'grayscale(100%)'
      : gdevelopTheme.gdevelopIconsCSSFilter,
  };

  return (
    <div
      style={{
        width: iconWidth,
        height: iconHeight,
        lineHeight: `${iconHeight}px`, // Vertical centering
        textAlign: 'center', // Horizontal centering
        paddingRight,
      }}
    >
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
