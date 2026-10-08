// @flow
import * as React from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from './Paper';
import Text from './Text';
import SmallCircledInfo from './CustomSvgIcons/SmallCircledInfo';
import { tooltipEnterDelay } from './Tooltip';
import classes from './StatCard.module.css';

const paperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  boxSizing: 'border-box',
  height: '100%',
  padding: '10px 12px',
  borderRadius: 8,
};

type Props = {|
  label: React.Node,
  value: React.Node,
  /** The lines shown under the value (the empty ones are skipped). */
  notes?: Array<?React.Node>,
  /** What the number means and what to do about it, shown by an info icon. */
  help?: React.Node,
  /** Makes the card a button (clicked, or Enter/Space when focused). */
  onClick?: ?() => void,
|};

/**
 * A number and what it is about, as a card: a label, the value in large, and
 * a few lines of notes. Meant to be laid out in a grid of cards.
 */
const StatCard = ({
  label,
  value,
  notes,
  help,
  onClick,
}: Props): React.Node => {
  const onKeyDown = onClick
    ? (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }
    : undefined;

  return (
    <div
      className={classNames(classes.statCard, {
        [classes.clickable]: !!onClick,
      })}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick || undefined}
      onKeyDown={onKeyDown}
    >
      <Paper background="medium" style={paperStyle}>
        <div className={classes.header}>
          <Text noMargin size="body-small" color="secondary">
            {label}
          </Text>
          {help && (
            <Tooltip
              title={help}
              placement="bottom"
              enterDelay={tooltipEnterDelay}
            >
              <span className={classes.help}>
                <SmallCircledInfo fontSize="small" />
              </span>
            </Tooltip>
          )}
        </div>
        <Text
          noMargin
          size="block-title"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Text>
        {notes &&
          notes.map((note, index) =>
            note ? (
              <Text key={index} noMargin size="body-small" color="secondary">
                {note}
              </Text>
            ) : null
          )}
      </Paper>
    </div>
  );
};

export default StatCard;
