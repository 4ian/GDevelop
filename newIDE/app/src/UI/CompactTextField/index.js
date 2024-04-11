// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactTextField.module.css';
import { tooltipEnterDelay } from '../Tooltip';
import useClickDragAsControl from './UseClickDragAsControl';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { toFixedWithoutTrailingZeros } from '../../Utils/Mathematics';

type ValueProps =
  | {|
      type?: 'text',
      value: string,
      onChange: (newValue: string, reason: 'keyInput') => void,
    |}
  | {|
      type: 'number',
      value: ?number, // null value corresponds to an empty input.
      onChange: (newValue: number, reason: 'keyInput' | 'iconControl') => void,
    |};

type OtherProps = {|
  onBlur?: ({
    currentTarget: {
      value: string,
    },
  }) => void,
  onFocus?: ({
    currentTarget: {
      value: string,
    },
    preventDefault: () => void,
  }) => void,
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
  renderEndAdornmentOnHover?: (className: string) => React.Node,
  onClickEndAdornment?: () => void,
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
  renderEndAdornmentOnHover,
  onClickEndAdornment,
  onBlur,
  onFocus,
}: CompactTextFieldProps) => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());
  const controlProps = useClickDragAsControl({
    // $FlowExpectedError - Click drag controls should not be used if value type is not number.
    onChange: value => onChange(value, 'iconControl'),
    // $FlowExpectedError
    onGetInitialValue: () => value,
  });

  const onBlurInput = React.useCallback(
    event => {
      if (onBlur) onBlur(event);
    },
    [onBlur]
  );
  const onFocusInput = React.useCallback(
    event => {
      if (onFocus) onFocus(event);
    },
    [onFocus]
  );

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
      })}
    >
      {renderLeftIcon && leftIconTooltip && (
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
          [classes.withEndAdornment]: !!renderEndAdornmentOnHover,
        })}
      >
        <input
          id={idToUse.current}
          type={type || 'text'}
          disabled={disabled}
          value={
            value === null
              ? ''
              : typeof value === 'number'
              ? toFixedWithoutTrailingZeros(value, 2)
              : value
          }
          onChange={e => onChange(e.currentTarget.value, 'keyInput')}
          placeholder={placeholder}
          onBlur={onBlurInput}
          onFocus={onFocusInput}
        />
        {renderEndAdornmentOnHover && (
          <button
            onClick={onClickEndAdornment}
            className={classes.endAdornmentButton}
          >
            {renderEndAdornmentOnHover(classes.endAdornmentIcon)}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompactTextField;
