import React, { PureComponent } from 'react';
import IconButton from 'material-ui/IconButton';
import ThemeConsumer from './Theme/ThemeConsumer';

/**
 * An icon that can be used as the leftIcon of a material-ui ListItem.
 * See also ToolbarIcon.
 */
export default class ListIcon extends PureComponent {
  render() {
    const {
      src,
      tooltip,
      disabled,
      isGDevelopIcon,
      ...otherProps
    } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <IconButton
            {...otherProps}
            iconStyle={{
              //Properly align icons with the rest of the list
              marginLeft: -16,
              marginTop: -16,
              maxWidth: 32,
              maxHeight: 32,
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
