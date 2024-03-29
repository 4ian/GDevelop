// @flow

import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import classes from './CompactSelectField.module.css';
import { tooltipEnterDelay } from '../Tooltip';
type Props = {|
  onChange: string => void,
  value: string,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  children: React.Node,
  renderLeftIcon?: (className: string) => React.Node,
  leftIconTooltip?: React.Node,
|};

const CompactSelectField = ({
  onChange,
  value,
  id,
  disabled,
  errored,
  placeholder,
  children,
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
          [classes.compactSelectField]: true,
        })}
      >
        <select
          id={id}
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.currentTarget.value)}
        >
          {children}
        </select>
        <div className={classNames({ [classes.arrowContainer]: true })}>
          <span className={classNames({ [classes.arrow]: true })} />
        </div>
      </div>
    </div>
  );
};

export default CompactSelectField;
