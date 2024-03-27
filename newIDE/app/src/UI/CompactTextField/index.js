// @flow

import * as React from 'react';
import classNames from 'classnames';
import classes from './CompactTextField.module.css';

type Props = {|
  onChange: string => void,
  value: string,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
|};

const CompactTextField = ({
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
}: Props) => {
  return (
    <div
      className={classNames({
        [classes.compactTextField]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
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
  );
};

export default CompactTextField;
