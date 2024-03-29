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
  renderLeftIcon?: (className: string) => React.Node,
|};

const CompactTextField = ({
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
  renderLeftIcon,
}: Props) => {
  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
      })}
    >
      {renderLeftIcon && renderLeftIcon(classes.leftIcon)}
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
