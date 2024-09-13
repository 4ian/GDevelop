// @flow

import * as React from 'react';
import classNames from 'classnames';
import classes from './CompactTextAreaField.module.css';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../../UI/Text';
import { MarkdownText } from '../../UI/MarkdownText';
import { tooltipEnterDelay } from '../../UI/Tooltip';

const styles = {
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '17px',
    maxHeight: 34, // 2 * lineHeight to limit to 2 lines.
    opacity: 0.7,
  },
};

export type CompactTextAreaFieldProps = {|
  label: string,
  markdownDescription?: ?string,
  value: string,
  onChange: (newValue: string) => void,
  onBlur?: ({
    currentTarget: {
      value: string,
    },
  }) => void,
  onFocus?: ({
    currentTarget: {
      value: string,
    },
    preventDefault: () => void,
  }) => void,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
|};

export const CompactTextAreaField = ({
  label,
  markdownDescription,
  value,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
}: CompactTextAreaFieldProps) => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());

  const title = !markdownDescription
    ? label
    : [label, ' - ', <MarkdownText source={markdownDescription} />];

  return (
    <label
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
      })}
    >
      {label && (
        <Tooltip
          title={title}
          enterDelay={tooltipEnterDelay}
          placement="bottom"
          PopperProps={{
            modifiers: {
              offset: {
                enabled: true,
                /**
                 * It does not seem possible to get the tooltip closer to the anchor
                 * when positioned on top. So it is positioned on bottom with a negative offset.
                 */
                offset: '0,-20',
              },
            },
          }}
        >
          <Text noMargin style={styles.label}>
            {label}
          </Text>
        </Tooltip>
      )}
      <div
        className={classNames({
          [classes.compactTextAreaField]: true,
        })}
      >
        <textarea
          id={idToUse.current}
          disabled={disabled}
          value={value === null ? '' : value}
          onChange={e => onChange(e.currentTarget.value)}
          placeholder={placeholder}
          rows={3}
        />
      </div>
    </label>
  );
};
