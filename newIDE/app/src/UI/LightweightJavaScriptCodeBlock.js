// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import classNames from 'classnames';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import IconButton from './IconButton';
import Copy from './CustomSvgIcons/Copy';
import InfoBar from './Messages/InfoBar';
import { copyTextToClipboard } from '../Utils/Clipboard';
import {
  computeJavaScriptTokensByLine,
  getJavaScriptTokenStyles,
} from '../Utils/JavaScriptTokenizer';
import classes from './LightweightJavaScriptCodeBlock.module.css';

const DEFAULT_MAX_HEIGHT = 260;

type Props = {|
  code: string,
  /** Line to highlight, typically the line an error was reported on. */
  highlightedLineNumber?: ?number,
  showLineNumbers?: boolean,
  /** Height after which the code scrolls instead of growing. */
  maxHeight?: number,
|};

/**
 * A read-only, syntax colored and copyable view of a JavaScript snippet, small
 * enough to be displayed inline (in a chat row, a message, a panel...): long
 * lines wrap and a tall snippet scrolls, so it never widens its container.
 *
 * "Lightweight" as in: no editor, no worker, no dependency — just the
 * approximate tokenizer of `Utils/JavaScriptTokenizer`. Use the Monaco based
 * editor when the code must be edited.
 */
const LightweightJavaScriptCodeBlock = ({
  code,
  highlightedLineNumber,
  showLineNumbers = true,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);

  const tokensByLine = React.useMemo(
    () => computeJavaScriptTokensByLine(code.replace(/\t/g, '  ')),
    [code]
  );
  const tokenStyles = React.useMemo(
    () =>
      getJavaScriptTokenStyles({
        isDarkMode: gdevelopTheme.palette.type === 'dark',
      }),
    [gdevelopTheme]
  );

  return (
    <div className={classes.container}>
      <div
        className={classNames({
          [classes.code]: true,
          [classes.codeWithoutLineNumbers]: !showLineNumbers,
        })}
        style={{ maxHeight }}
      >
        {tokensByLine.map((tokens, lineIndex) => {
          const isHighlighted = highlightedLineNumber === lineIndex + 1;
          return (
            <React.Fragment key={lineIndex}>
              {showLineNumbers && (
                <span
                  className={classNames({
                    [classes.lineNumber]: true,
                    [classes.highlightedLineNumber]: isHighlighted,
                  })}
                >
                  {lineIndex + 1}
                </span>
              )}
              <span
                className={classNames({
                  [classes.line]: true,
                  [classes.highlightedLine]: isHighlighted,
                })}
              >
                {tokens.length === 0
                  ? // Keep the height of an empty line, so the code and the
                    // line numbers stay aligned.
                    '\u200B'
                  : tokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        style={{
                          color: (tokenStyles[token.type] || {}).color,
                          fontStyle: (tokenStyles[token.type] || {}).fontStyle,
                        }}
                      >
                        {token.text}
                      </span>
                    ))}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div className={classes.copyButtonContainer}>
        <IconButton
          size="small"
          tooltip={t`Copy the code`}
          onClick={() => {
            copyTextToClipboard(code);
            setShowCopiedInfoBar(true);
          }}
        >
          <Copy fontSize="small" />
        </IconButton>
      </div>
      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </div>
  );
};

export default LightweightJavaScriptCodeBlock;
