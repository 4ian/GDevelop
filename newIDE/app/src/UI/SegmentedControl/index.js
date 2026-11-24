// @flow
import * as React from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../Tooltip';
import classes from './SegmentedControl.module.css';

export type SegmentedControlOption<T> = {|
  value: T,
  label: React.Node,
  tooltip?: React.Node,
|};

type Props<T> = {|
  options: Array<SegmentedControlOption<T>>,
  value: T,
  onChange: (value: T) => void,
  size?: 'small' | 'default',
  /** Take all the available width, with segments of the same width. */
  fullWidth?: boolean,
  disabled?: boolean,
  id?: string,
|};

/**
 * A choice between a few exclusive options, shown as segments of a pill where
 * the chosen one is highlighted.
 */
const SegmentedControl = <T>({
  options,
  value,
  onChange,
  size,
  fullWidth,
  disabled,
  id,
}: Props<T>): React.Node => (
  <div
    id={id}
    role="radiogroup"
    className={classNames({
      [classes.container]: true,
      [classes.small]: size === 'small',
      [classes.fullWidth]: fullWidth,
    })}
  >
    {options.map((option, index) => {
      const isSelected = option.value === value;
      const segment = (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={isSelected}
          disabled={disabled}
          className={classNames({
            [classes.segment]: true,
            [classes.selected]: isSelected,
          })}
          onClick={event => {
            // Avoid triggering the click of a parent (a clickable row).
            event.stopPropagation();
            if (!isSelected) onChange(option.value);
          }}
        >
          {option.label}
        </button>
      );
      return option.tooltip ? (
        <Tooltip
          key={index}
          title={option.tooltip}
          enterDelay={tooltipEnterDelay}
          placement="top"
        >
          {segment}
        </Tooltip>
      ) : (
        segment
      );
    })}
  </div>
);

export default SegmentedControl;
