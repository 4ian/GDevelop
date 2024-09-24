// @flow
import * as React from 'react';
import classes from './CompactToggleField.module.css';
import classNames from 'classnames';

type Props = {|
  id?: string,
  checked: boolean,
  onCheck: (newValue: boolean) => void,
  disabled?: boolean,
  fullWidth?: boolean,
|};

export const CompactToggleField = (props: Props) => {
  return (
    <label
      className={classNames({
        [classes.container]: true,
        [classes.fullWidth]: props.fullWidth,
      })}
      id={props.id}
    >
      <div
        className={classNames({
          [classes.toggleSwitch]: true,
        })}
      >
        <input
          type="checkbox"
          className={classNames({
            [classes.checkbox]: true,
          })}
          onChange={() => props.onCheck(!props.checked)}
          disabled={props.disabled}
        />
        <span
          className={classNames({
            [classes.slider]: true,
            [classes.checked]: props.checked,
            [classes.disabled]: props.disabled,
          })}
        >
          <span
            className={classNames({
              [classes.handleContainer]: true,
              [classes.checked]: props.checked,
              [classes.disabled]: props.disabled,
            })}
          >
            <span
              className={classNames({
                [classes.handle]: true,
                [classes.checked]: props.checked,
                [classes.disabled]: props.disabled,
              })}
            />
          </span>
        </span>
      </div>
    </label>
  );
};
