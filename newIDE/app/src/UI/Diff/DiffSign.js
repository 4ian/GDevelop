// @flow
import * as React from 'react';
import classNames from 'classnames';
import { type ItemChange } from './ItemChange';
import classes from './Diff.module.css';

const signs: { [ItemChange]: string } = {
  added: '+',
  removed: '−',
  modified: '~',
};

/** A small square with `+`, `−` or `~`, colored according to the change. */
const DiffSign = ({ change }: {| change: ItemChange |}): React.Node => (
  <span
    className={classNames(classes.sign, classes[change])}
    aria-hidden="true"
  >
    {signs[change]}
  </span>
);

export default DiffSign;
