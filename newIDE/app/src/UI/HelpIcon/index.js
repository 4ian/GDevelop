// @flow
import React from 'react';
import IconButton from '../IconButton';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import Help from '../CustomSvgIcons/Help';

type PropsType = {|
  helpPagePath: ?string,
  disabled?: boolean,
  style?: {|
    padding?: number | string,
    width?: number,
    height?: number,
    transform?: string,
    transition?: string,
    opacity?: number,
    cursor?: 'pointer',
    margin?: number,
    marginRight?: number,
    marginLeft?: number,
    marginTop?: number,
    marginBottom?: number,
    visibility?: 'visible' | 'hidden',
  |},
  size?: 'small',
|};

/**
 * The icon that can be used in any dialog to open a help page
 */
const HelpIcon = (props: PropsType) => {
  const { helpPagePath } = props;
  if (!helpPagePath) return null;

  return (
    <IconButton
      onClick={() => Window.openExternalURL(getHelpLink(helpPagePath))}
      disabled={props.disabled}
      style={props.style}
      size={props.size}
    >
      <Help />
    </IconButton>
  );
};

export default HelpIcon;
