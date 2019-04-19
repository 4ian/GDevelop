// @flow
import React, { PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import ThemeConsumer from './Theme/ThemeConsumer';
// No i18n in this file

type Props = {
  src: string,
  tooltip?: string,
  disabled?: boolean,
  isGDevelopIcon?: boolean,
  iconSize: number,
};

/**
 * An icon that can be used as the leftIcon of a material-ui ListItem.
 * See also ToolbarIcon.
 */
export default class ListIcon extends PureComponent<Props> {
  render() {
    const {
      src,
      tooltip,
      disabled,
      isGDevelopIcon,
      iconSize,
      ...otherProps
    } = this.props;

    const margin = -iconSize / 2;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <IconButton
            {...otherProps}
            iconStyle={{
              //Properly align icons with the rest of the list
              marginLeft: margin,
              marginTop: margin,
              maxWidth: iconSize,
              maxHeight: iconSize,
              filter: !isGDevelopIcon
                ? undefined
                : disabled
                ? 'grayscale(100%)'
                : muiTheme.gdevelopIconsCSSFilter,
            }}
          >
            <img
              title={tooltip}
              alt={tooltip}
              src={src}
              crossOrigin="anonymous"
            />
          </IconButton>
        )}
      </ThemeConsumer>
    );
  }
}
