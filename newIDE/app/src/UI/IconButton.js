// @flow
import * as React from 'react';
import MUIIconButton from 'material-ui/IconButton';

type IconProps =
  | {|
      children: React.Node,
    |}
  // Support a few specific icons from iconmoon-font.css
  | {|
      iconClassName: 'icon-twitter' | 'icon-facebook',
    |};

// We support a subset of the props supported by Material-UI v0.x IconButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  ...IconProps,
  onClick?: () => void,
  disabled?: boolean,

  style?: {|
    padding?: number,
    width?: number,
    height?: number,
    transform?: string,
    transition?: string,
    opacity?: number,
    marginRight?: number,
  |},
  iconStyle?: {|
    marginLeft: number,
    marginTop: number,
    maxWidth: number,
    maxHeight: number,
    filter: ?string,
  |},

  tooltip?: React.Node,
  tooltipPosition?: 'bottom-left' | 'bottom-right',
|};

/**
 * A button showing just an icon, based on Material-UI icon button.
 */
export default class IconButton extends React.Component<Props, {||}> {
  render() {
    return <MUIIconButton {...this.props} />;
  }
}
