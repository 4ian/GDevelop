// @flow
import * as React from 'react';
import classNames from 'classnames';
import DiffSign from './DiffSign';
import classes from './Diff.module.css';

type Props = {|
  oldValue: string,
  newValue: string,
  /** Text shown for an empty value. */
  emptyValueLabel?: React.Node,
  /**
   * `inline` shows short values on a line (`1.0.0 → 1.1.0`).
   * `stacked` shows the old value above the new one, for longer texts.
   */
  layout?: 'inline' | 'stacked',
|};

/** The old and the new value of something that changed. */
const ValueDiff = ({
  oldValue,
  newValue,
  emptyValueLabel,
  layout,
}: Props): React.Node => {
  const isInline = layout === 'inline';
  const renderValue = (value: string, change: 'removed' | 'added') => (
    <div className={classNames(classes.value, classes[change])}>
      {!isInline && <DiffSign change={change} />}
      <span
        className={classNames({
          [classes.valueText]: true,
          [classes.emptyValue]: !value,
        })}
      >
        {value || emptyValueLabel || '—'}
      </span>
    </div>
  );
  return (
    <div
      className={classNames({
        [classes.valueDiff]: true,
        [classes.valueDiffInline]: isInline,
      })}
    >
      {renderValue(oldValue, 'removed')}
      {isInline && <span className={classes.arrow}>→</span>}
      {renderValue(newValue, 'added')}
    </div>
  );
};

export default ValueDiff;
