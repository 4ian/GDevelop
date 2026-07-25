// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import classNames from 'classnames';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import IconButton from '../../UI/IconButton';
import Copy from '../../UI/CustomSvgIcons/Copy';
import InfoBar from '../../UI/Messages/InfoBar';
import { copyTextToClipboard } from '../../Utils/Clipboard';
import {
  computeJavaScriptTokensByLine,
  getJavaScriptTokenStyles,
} from '../../Utils/JavaScriptTokenizer';
import classes from './ScriptCodeBlock.module.css';

type Props = {|
  code: string,
  /** Line to highlight, typically the line an error was reported on. */
  highlightedLineNumber?: ?number,
|};

/**
 * A compact, syntax colored and copyable view of a JavaScript snippet, sized to
 * fit inside a chat row (long lines wrap, tall scripts scroll).
 */
export const ScriptCodeBlock = ({
  code,
  highlightedLineNumber,
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
      <div className={classes.code}>
        {tokensByLine.map((tokens, lineIndex) => {
          const isHighlighted = highlightedLineNumber === lineIndex + 1;
          return (
            <React.Fragment key={lineIndex}>
              <span
                className={classNames({
                  [classes.lineNumber]: true,
                  [classes.errorLineNumber]: isHighlighted,
                })}
              >
                {lineIndex + 1}
              </span>
              <span
                className={classNames({
                  [classes.line]: true,
                  [classes.errorLine]: isHighlighted,
                })}
              >
                {tokens.length === 0
                  ? '\u200B'
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
          tooltip={t`Copy the script`}
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
