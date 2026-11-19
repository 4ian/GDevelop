// @flow
import * as React from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import { tooltipEnterDelay } from '../Tooltip';
import DiffSign from './DiffSign';
import { type ItemChange } from './ItemChange';
import classes from './Diff.module.css';

export type NamedItemChange = {|
  name: string,
  change: ItemChange,
|};

type Props = {|
  items: Array<NamedItemChange>,
  /** Explanation of each kind of change, shown when hovering an item. */
  changeDescriptions?: { [ItemChange]: React.Node },
|};

const changeOrder: Array<ItemChange> = ['added', 'modified', 'removed'];

/**
 * The names of the items of a list (parameters, properties, children...)
 * that are added, removed or modified, like in a changelog.
 */
const NamedItemsDiff = ({ items, changeDescriptions }: Props): React.Node => (
  <ul className={classes.itemList}>
    {changeOrder.map(change =>
      items
        .filter(item => item.change === change)
        .map(item => {
          const itemElement = (
            <li
              key={`${change}-${item.name}`}
              className={classNames(classes.item, classes[change])}
            >
              <DiffSign change={change} />
              <span className={classes.itemName}>{item.name}</span>
            </li>
          );
          const changeDescription =
            changeDescriptions && changeDescriptions[change];
          return changeDescription ? (
            <Tooltip
              key={`${change}-${item.name}`}
              title={changeDescription}
              enterDelay={tooltipEnterDelay}
              placement="top"
            >
              {itemElement}
            </Tooltip>
          ) : (
            itemElement
          );
        })
    )}
  </ul>
);

export default NamedItemsDiff;
