import React, { Component } from 'react';
import IconButton from './IconButton';
import ThemeConsumer from './Theme/ThemeConsumer';

/**
 * An icon that can be used in a ToolbarGroup of material-ui Toolbar.
 * See also ListIcon.
 */
export default class ToolbarIcon extends Component {
  render() {
    const { src, tooltip, disabled, ...otherProps } = this.props;

    return (
      <ThemeConsumer>
        {muiTheme => (
          <IconButton
            {...otherProps}
            iconStyle={{
              //Properly align icons with the rest of the toolbar
              marginLeft: -4,
              marginTop: -4,
              filter: disabled
                ? 'grayscale(100%)'
                : muiTheme.gdevelopIconsCSSFilter,
            }}
          >
            <img
              title={tooltip}
              alt={tooltip}
              src={src}
              width={32}
              height={32}
            />
          </IconButton>
        )}
      </ThemeConsumer>
    );
  }
}
