// @flow
import * as React from 'react';
import classNames from 'classnames';
import DiffSign from './DiffSign';
import classes from './Diff.module.css';

type Props = {|
  /** The old value: a text, or any element (like an image). */
  oldValue: React.Node,
  /** The new value: a text, or any element (like an image). */
  newValue: React.Node,
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
  const renderValue = (value: React.Node, change: 'removed' | 'added') => {
    const isEmpty = value === '' || value === null || value === undefined;
    const isText = typeof value === 'string' || typeof value === 'number';
    return (
      <div
        className={classNames(classes.value, classes[change], {
          [classes.elementValue]: !isEmpty && !isText,
        })}
      >
        {!isInline && <DiffSign change={change} />}
        <span
          className={classNames({
            [classes.valueText]: true,
            [classes.emptyValue]: isEmpty,
          })}
        >
          {isEmpty ? emptyValueLabel || '—' : value}
        </span>
      </div>
    );
  };
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
