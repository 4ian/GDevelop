// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactTextField.module.css';
import { tooltipEnterDelay } from '../Tooltip';
import useClickDragAsControl from './UseClickDragAsControl';

type ValueProps =
  | {|
      type?: 'text',
      onChange: string => void,
      value: string,
    |}
  | {|
      type: 'number',
      onChange: number => void,
      value: number,
    |};

type Props = {|
  ...ValueProps,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
  useLeftIconAsNumberControl?: boolean,
|};

const CompactTextField = ({
  type,
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
  renderLeftIcon,
  leftIconTooltip,
  useLeftIconAsNumberControl,
}: Props) => {
  const controlProps = useClickDragAsControl({
    // $FlowExpectedError - Click drag controls should not be used if value type is not number.
    onChange,
    // $FlowExpectedError
    onGetInitialValue: () => value,
  });

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
      })}
    >
      {renderLeftIcon && (
        <Tooltip
          title={leftIconTooltip}
          enterDelay={tooltipEnterDelay}
          placement="bottom"
          PopperProps={{
            modifiers: {
              offset: {
                enabled: true,
                /**
                 * It does not seem possible to get the tooltip closer to the anchor
                 * when positioned on top. So it is positioned on bottom with a negative offset.
                 */
                offset: '0,-20',
              },
            },
          }}
        >
          <div
            className={classNames({
              [classes.leftIconContainer]: true,
              [classes.control]: !!useLeftIconAsNumberControl,
            })}
            {...(useLeftIconAsNumberControl ? controlProps : {})}
          >
            {renderLeftIcon(classes.leftIcon)}
          </div>
        </Tooltip>
      )}
      <div
        className={classNames({
          [classes.compactTextField]: true,
        })}
      >
        <input
          id={id}
          type={type || 'text'}
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default CompactTextField;
