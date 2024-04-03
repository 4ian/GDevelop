// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactTextField.module.css';
import { tooltipEnterDelay } from '../Tooltip';
import useClickDragAsControl from './UseClickDragAsControl';
import { makeTimestampedId } from '../../Utils/TimestampedId';

type ValueProps =
  | {|
      type?: 'text',
      value: string,
      onChange: string => void,
    |}
  | {|
      type: 'number',
      value: number,
      onChange: number => void,
    |};

type OtherProps = {|
  onBlur?: (number | string) => void,
|};

export type CompactTextFieldProps = {|
  ...ValueProps,
  ...OtherProps,
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
  onBlur,
}: CompactTextFieldProps) => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());
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
            <label htmlFor={idToUse.current} className={classes.label}>
              {renderLeftIcon(classes.leftIcon)}
            </label>
          </div>
        </Tooltip>
      )}
      <div
        className={classNames({
          [classes.compactTextField]: true,
        })}
      >
        <input
          id={idToUse.current}
          type={type || 'text'}
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          onBlur={onBlur}
        />
      </div>
    </div>
  );
};

export default CompactTextField;
