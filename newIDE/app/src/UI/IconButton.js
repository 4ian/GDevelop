// @flow
import * as React from 'react';
import MUIIconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { I18n } from '@lingui/react';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { adaptAcceleratorString } from '../UI/AcceleratorString';
import { tooltipEnterDelay } from './Tooltip';

type IconProps =
  | {|
      children: React.Node,
    |}
  // Support a few specific icons from icomoon-font.css
  | {|
      className:
        | 'icon-youtube'
        | 'icon-twitter'
        | 'icon-facebook'
        | 'icon-discord'
        | 'icon-reddit',
    |};

// We support a subset of the props supported by Material-UI v0.x IconButton
// They should be self descriptive - refer to Material UI docs otherwise.
type Props = {|
  ...IconProps,
  onClick?: (ev: any) => void | Promise<void>,
  target?: string,
  onContextMenu?: () => void,
  disabled?: boolean,
  edge?: 'start' | 'end' | false,
  id?: string,

  style?: {|
    padding?: number,
    width?: number,
    height?: number,
    transform?: string,
    transition?: string,
    opacity?: number,
    borderRadius?: number,
    margin?: number,
    marginRight?: number,
    marginLeft?: number,
    marginTop?: number,
    marginBottom?: number,
    visibility?: 'visible' | 'hidden',
  |},
  size?: 'small',

  tooltip?: MessageDescriptor,
  acceleratorString?: string,
  'aria-label'?: string,
|};

/**
 * A button showing just an icon, based on Material-UI icon button.
 * Supports displaying a tooltip.
 */
export default class IconButton extends React.Component<Props, {||}> {
  render() {
    const { tooltip, acceleratorString, ...otherProps } = this.props;
    const iconButton = <MUIIconButton {...otherProps} color="secondary" />;

    return tooltip && !this.props.disabled ? (
      <I18n>
        {({ i18n }) => (
          <Tooltip
            title={
              i18n._(tooltip) +
              (acceleratorString
                ? ' ' + adaptAcceleratorString(acceleratorString)
                : '')
            }
            placement="bottom"
            enterDelay={tooltipEnterDelay}
          >
            {iconButton}
          </Tooltip>
        )}
      </I18n>
    ) : (
      iconButton
    );
  }
}
