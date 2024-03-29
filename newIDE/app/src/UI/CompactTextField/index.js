// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactTextField.module.css';
import { tooltipEnterDelay } from '../Tooltip';

type Props = {|
  onChange: string => void,
  value: string,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
|};

const CompactTextField = ({
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
  renderLeftIcon,
  leftIconTooltip,
}: Props) => {
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
          <div className={classes.leftIconContainer}>
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
