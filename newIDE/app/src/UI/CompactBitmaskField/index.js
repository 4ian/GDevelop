// @flow

import * as React from 'react';
import classNames from 'classnames';
import Tooltip from '@material-ui/core/Tooltip';
import classes from './CompactBitmaskField.module.css';
import Text from '../Text';
import { MarkdownText } from '../MarkdownText';
import { tooltipEnterDelay } from '../Tooltip';

const styles = {
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '17px',
    maxHeight: 34, // 2 * lineHeight to limit to 2 lines.
  },
};

export const isBitEnabled = (bitsValue: number, pos: number): boolean =>
  !!(bitsValue & (1 << pos));

export const enableBit = (
  bitsValue: number,
  pos: number,
  enable: boolean
): number => (enable ? bitsValue | (1 << pos) : bitsValue & ~(1 << pos));

export type CompactBitmaskFieldProps = {|
  label?: string,
  markdownDescription?: ?string,
  /** The whole bitmask value. Bits outside of the edited ones are kept as is. */
  value: number,
  onChange: (newValue: number) => void,
  /** Index of the first edited bit (0 by default). */
  firstBit?: number,
  /** Number of bits to edit, starting at `firstBit`. */
  bitCount: number,
  id?: string,
  disabled?: boolean,
  labelColor?: 'primary' | 'secondary',
|};

/**
 * Edit the bits of a number, displayed as a grid of numbered toggles.
 * Bits are labelled from 1, so that they match the layer numbers used
 * in events.
 */
export const CompactBitmaskField = ({
  label,
  markdownDescription,
  value,
  onChange,
  firstBit = 0,
  bitCount,
  id,
  disabled,
  labelColor,
}: CompactBitmaskFieldProps): React.Node => {
  const title = !markdownDescription
    ? label
    : [
        label,
        ' - ',
        <MarkdownText key="markdown-desc" source={markdownDescription} />,
      ];

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
      })}
    >
      {label && (
        <Tooltip
          title={title}
          enterDelay={tooltipEnterDelay}
          placement="bottom"
        >
          <Text
            noMargin
            // $FlowFixMe[incompatible-type]
            style={styles.label}
            color={labelColor === 'primary' ? 'primary' : 'secondary'}
          >
            {label}
          </Text>
        </Tooltip>
      )}
      <div
        className={classes.bits}
        id={id}
        style={{
          gridTemplateColumns: `repeat(${Math.min(
            bitCount,
            8
          )}, minmax(0, 24px))`,
        }}
      >
        {Array.from({ length: bitCount }, (_, index) => {
          const bit = firstBit + index;
          const enabled = isBitEnabled(value, bit);
          return (
            <button
              key={bit}
              type="button"
              className={classNames({
                [classes.bit]: true,
                [classes.enabled]: enabled,
              })}
              aria-pressed={enabled}
              disabled={disabled}
              onClick={() => onChange(enableBit(value, bit, !enabled))}
            >
              {bit + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CompactBitmaskField;
