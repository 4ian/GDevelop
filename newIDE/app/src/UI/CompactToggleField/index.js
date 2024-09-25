// @flow
import * as React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Text from '../../UI/Text';
import { MarkdownText } from '../../UI/MarkdownText';
import { tooltipEnterDelay } from '../../UI/Tooltip';
import classes from './CompactToggleField.module.css';
import classNames from 'classnames';

const styles = {
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '17px',
    maxHeight: 34, // 2 * lineHeight to limit to 2 lines.
    opacity: 0.7,
  },
};
type Props = {|
  label: string,
  markdownDescription?: ?string,
  id?: string,
  checked: boolean,
  onCheck: (newValue: boolean) => void,
  disabled?: boolean,
  fullWidth?: boolean,
|};

export const CompactToggleField = (props: Props) => {
  const title = !props.markdownDescription
    ? props.label
    : [props.label, ' - ', <MarkdownText source={props.markdownDescription} />];
  return (
    <label
      className={classNames({
        [classes.container]: true,
        [classes.fullWidth]: props.fullWidth,
      })}
      id={props.id}
    >
      <div className={classes.toggleSwitch}>
        <input
          type="checkbox"
          className={classes.checkbox}
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
          {props.label}
        </Text>
      </Tooltip>
    </label>
  );
};
