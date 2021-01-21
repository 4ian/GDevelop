// @flow
import * as React from 'react';
import IconButton from './IconButton';
import ThemeConsumer from './Theme/ThemeConsumer';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { bool } from 'prop-types';

type Props = {|
  src: string,
  tooltip?: MessageDescriptor,
  acceleratorString?: string,
  disabled?: boolean,
  onClick?: () => void,
  onContextMenu?: () => void,
  showComponent?: boolean,
|};

/**
 * An icon that can be used in a ToolbarGroup of a Toolbar.
 */
const ToolbarIcon = React.forwardRef<Props, IconButton>((props: Props, ref) => {
  const {
    src,
    tooltip,
    acceleratorString,
    disabled,
    onClick,
    onContextMenu,
  } = props;

  //We can use here (showComponent) value from props to set the UI texture of the button to ON/OFF state
  //Following example shows how to use this in simple manner
  // let buttonStyle = {};
  // if (showComponent !== undefined) {
  //   buttonStyle = showComponent
  //     ? {
  //         border: '5px solid #80BE1F',
  //         backgroundColor: '#80BE1F',
  //         marginRight: '5px',
  //       }
  //     : {
  //         border: '5px solid #FF3232',
  //         backgroundColor: '#FF3232',
  //         marginRight: '5px',
  //       };
  // }

  return (
    <ThemeConsumer>
      {muiTheme => (
        <IconButton
          onClick={onClick}
          onContextMenu={onContextMenu}
          size="small"
          disabled={disabled}
          tooltip={tooltip}
          acceleratorString={acceleratorString}
          ref={ref}
        >
          <img
            alt={tooltip}
            src={src}
            width={32}
            height={32}
            style={{
              filter: disabled
                ? 'grayscale(100%)'
                : muiTheme.gdevelopIconsCSSFilter,
            }}
          />
        </IconButton>
      )}
    </ThemeConsumer>
  );
});

export default ToolbarIcon;
