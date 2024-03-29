// @flow

import * as React from 'react';
import classNames from 'classnames';
import classes from './CompactSelectField.module.css';

type Props = {|
  onChange: string => void,
  value: string,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  children: React.Node,
  renderLeftIcon?: (className: string) => React.Node,
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
