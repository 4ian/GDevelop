// @flow
import * as React from 'react';
import IconButton from './IconButton';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import GDevelopThemeContext from './Theme/ThemeContext';

type Props = {|
  id?: string,
  src: string,
  tooltip?: MessageDescriptor,
  acceleratorString?: string,
  disabled?: boolean,
  onClick?: () => void,
  onContextMenu?: () => void,
|};

/**
 * An icon that can be used in a ToolbarGroup of a Toolbar.
 */
const ToolbarIcon = React.forwardRef<Props, IconButton>((props: Props, ref) => {
  const {
    id,
    src,
    tooltip,
    acceleratorString,
    disabled,
    onClick,
    onContextMenu,
  } = props;
  const theme = React.useContext(GDevelopThemeContext);

  return (
    <IconButton
      id={id}
      onClick={onClick}
      onContextMenu={onContextMenu}
      size="small"
      style={{ borderRadius: 5 }}
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
          filter: disabled ? 'grayscale(100%)' : theme.gdevelopIconsCSSFilter,
        }}
      />
    </IconButton>
  );
});

export default ToolbarIcon;
