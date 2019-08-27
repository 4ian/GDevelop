// @flow
import React, { PureComponent } from 'react';
import ThemeConsumer from './Theme/ThemeConsumer';
// No i18n in this file

type Props = {|
  src: string,
  tooltip?: string,
  disabled?: boolean,
  isGDevelopIcon?: boolean,
  iconSize: number,
|};

/**
 * An icon that can be used as the leftIcon of a ListItem.
 * See also ToolbarIcon.
 */
export default class ListIcon extends PureComponent<Props> {
  render() {
    const { src, tooltip, disabled, isGDevelopIcon, iconSize } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <div
            style={{
              width: iconSize,
              height: iconSize,
              lineHeight: `${iconSize}px`, // Vertical centering
              textAlign: 'center', // Horizontal centering
            }}
          >
            <img
              title={tooltip}
              alt={tooltip}
              src={src}
              crossOrigin="anonymous"
              style={{
                maxWidth: iconSize,
                maxHeight: iconSize,
                verticalAlign: 'middle', // Vertical centering
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
