// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import Copy from '../UI/CustomSvgIcons/Copy';
import { copyTextToClipboard } from '../Utils/Clipboard';
import classes from './GameplayTestOutputPanel.module.css';

export type GameplayTestOutputLine = {|
  level: 'log' | 'info' | 'warn' | 'error',
  message: string,
  /** A prefix shown before the message, in a dimmed color (frame number...). */
  prefix?: ?string,
|};

const levelClasses = {
  log: classes.log,
  info: classes.info,
  warn: classes.warn,
  error: classes.error,
};

type Props = {|
  lines: Array<GameplayTestOutputLine>,
  /** Shown instead of the output when there is nothing to display. */
  placeholder: React.Node,
  /** Show a button to copy the whole output to the clipboard. */
  canCopy?: boolean,
  maxHeight?: number,
|};

/**
 * A terminal-like panel displaying the output of a gameplay test run:
 * errors of the test or console logs of the game.
 */
export const GameplayTestOutputPanel = ({
  lines,
  placeholder,
  canCopy,
  maxHeight,
}: Props): React.Node => {
  if (!lines.length) {
    return (
      <div className={classes.placeholder}>
        <Text noMargin size="body-small" color="secondary" align="center">
          {placeholder}
        </Text>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      {canCopy && (
        <div className={classes.copyButtonContainer}>
          <IconButton
            size="small"
            tooltip={t`Copy the output`}
            onClick={() => {
              copyTextToClipboard(
                lines
                  .map(
                    line =>
                      (line.prefix ? line.prefix + ' ' : '') + line.message
                  )
                  .join('\n')
              );
            }}
          >
            <Copy className={classes.copyIcon} />
          </IconButton>
        </div>
      )}
      <div
        className={classes.output}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {lines.map((line, index) => (
          <div
            key={index}
            className={classNames({
              [classes.line]: true,
              [levelClasses[line.level] || classes.log]: true,
            })}
          >
            {!!line.prefix && (
              <span className={classes.linePrefix}>
                <Text
                  noMargin
                  displayInlineAsSpan
                  color="inherit"
                  size="body-small"
                  style={{
                    fontFamily: '"Lucida Console", Monaco, monospace',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {line.prefix}
                </Text>
              </span>
            )}
            <Text
              noMargin
              color="inherit"
              size="body-small"
              allowSelection
              style={{
                fontFamily: '"Lucida Console", Monaco, monospace',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {line.message}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};
