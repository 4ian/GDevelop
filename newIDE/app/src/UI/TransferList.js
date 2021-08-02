//@flow
import React from 'react';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Button from './FlatButton';
import Divider from '@material-ui/core/Divider';

function not(a: Array<number>, b: Array<number>) {
  return a.filter(value => b.indexOf(value) === -1);
}

function intersection(a: Array<number>, b: Array<number>) {
  return a.filter(value => b.indexOf(value) !== -1);
}

function union(a: Array<number>, b: Array<number>) {
  return [...a, ...not(b, a)];
}

type Props<Right, Left> = {|
  left: Left,
  right: Right,
  onChangeLeft: (newLeft: Left) => void,
  onChangeRight: (newRight: Right) => void,
  leftLabel: React.Node,
  rightLabel: React.Node,
|};

/**
 * A MaterialUI TransferList component based off of the example at https://material-ui.com/components/transfer-list/.
 */
export const TransferList = <Right: Array, Left: Array>({
  left,
  right,
  onChangeLeft,
  onChangeRight,
  leftLabel,
  rightLabel,
}: Props<Right, Left>) => {
  const [checked, setChecked] = React.useState([]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: Array<number>) =>
    intersection(checked, items).length;

  const handleToggleAll = (items: Array<number>) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    onChangeRight(right.concat(leftChecked));
    onChangeLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    onChangeLeft(left.concat(rightChecked));
    onChangeRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.Node, items: Array<any>) => (
    <Card style={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={
              numberOfChecked(items) === items.length && items.length !== 0
            }
            indeterminate={
              numberOfChecked(items) !== items.length &&
              numberOfChecked(items) !== 0
            }
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List dense component="div" role="list">
        {items.map((value: number) => {
          const labelId = `transfer-list-all-item-${value}-label`;

          return (
            <ListItem
              key={value}
              role="listitem"
              button
              onClick={handleToggle(value)}
            >
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>{customList(leftLabel, left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            label="&gt;"
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          />
          <Button
            label="&lt;"
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          />
        </Grid>
      </Grid>
      <Grid item>{customList(rightLabel, right)}</Grid>
    </Grid>
  );
};
