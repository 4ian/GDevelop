// @flow
import React, { PureComponent } from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
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
  ...SizeProps,
|};

/**
 * An icon that can be used as the leftIcon of a ListItem.
 * See also ToolbarIcon.
 */
export default class ListIcon extends PureComponent<Props> {
  render() {
    const { src, tooltip, disabled, isGDevelopIcon, cssAnimation } = this.props;

    const iconWidth =
      this.props.iconWidth !== undefined
        ? this.props.iconWidth
        : this.props.iconSize;
    const iconHeight =
      this.props.iconHeight !== undefined
        ? this.props.iconHeight
        : this.props.iconSize;

    // The material-ui List component reserves 56 pixels for the icon, so the maximum
    // size is 40px before we start consuming the padding space between the icon and
    // the text. Add it back if necessary
    const paddingRight = iconWidth > 40 ? 16 : 0;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <div
            style={{
              width: iconWidth,
              height: iconHeight,
              lineHeight: `${iconHeight}px`, // Vertical centering
              textAlign: 'center', // Horizontal centering
              paddingRight,
            }}
          >
            <img
              title={tooltip}
              alt={tooltip}
              src={src}
              style={{
                maxWidth: iconWidth,
                maxHeight: iconHeight,
                verticalAlign: 'middle', // Vertical centering
                animation: cssAnimation,
                filter: !isGDevelopIcon
                  ? undefined
                  : disabled
                  ? 'grayscale(100%)'
                  : muiTheme.gdevelopIconsCSSFilter,
              }}
            />
          </div>
        )}
      </ThemeConsumer>
    );
  }
}
