// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Copy from '../UI/CustomSvgIcons/Copy';
import IconButton from '../UI/IconButton';
import InfoBar from '../UI/Messages/InfoBar';
import { Trans } from '@lingui/macro';
import {
  computeJavaScriptTokensByLine,
  getJavaScriptTokenStyles,
} from '../Utils/JavaScriptTokenizer';

type Props = {|
  code: string,
  language?: string,
|};

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    borderRadius: 8,
    overflow: 'hidden',
    border: '1px solid transparent',
    fontSize: 14,
  },
  lineNumbersColumn: {
    padding: '12px 8px',
    textAlign: 'right',
    userSelect: 'none',
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
  },
  lineNumber: {
    paddingRight: 12,
    lineHeight: 1.6,
  },
  codeColumn: {
    padding: '12px 16px',
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    overflowX: 'auto',
    userSelect: 'text',
    cursor: 'text',
  },
  codeLine: {
    display: 'block',
    whiteSpace: 'pre',
    lineHeight: 1.6,
    userSelect: 'text',
    cursor: 'text',
  },
  token: {
    whiteSpace: 'pre',
    userSelect: 'text',
    cursor: 'text',
  },
};

const TextBasedCourseChapterCodeBlock = ({
  code,
  language,
}: Props): React.MixedElement => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const normalizedCode = React.useMemo(() => code.replace(/\t/g, '  '), [code]);
  const tokensByLine = React.useMemo(
    () => {
      if (
        language &&
        language.toLowerCase() !== 'javascript' &&
        language.toLowerCase() !== 'js'
      ) {
        // $FlowFixMe[incompatible-type]
        return normalizedCode
          .replace(/\r\n/g, '\n')
          .split('\n')
          .map(line => [{ type: 'plain', text: line }]);
      }

      return computeJavaScriptTokensByLine(normalizedCode);
    },
    [normalizedCode, language]
  );

  const isDarkMode = gdevelopTheme.palette.type === 'dark';
  const backgroundColor = isDarkMode ? '#0f172a' : '#f3f4f6';
  const borderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(15, 23, 42, 0.15)';
  const lineNumberColor = isDarkMode
    ? 'rgba(148, 163, 184, 0.85)'
    : 'rgba(139, 100, 118, 0.85)';
  const tokenStyleMap = React.useMemo(
    () => getJavaScriptTokenStyles({ isDarkMode }),
    [isDarkMode]
  );

  const [showCopiedInfoBar, setShowCopiedInfoBar] = React.useState(false);

  const handleCopy = () => {
    if (!normalizedCode) return;
    navigator.clipboard.writeText(normalizedCode);
    setShowCopiedInfoBar(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <IconButton
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor,
        }}
      >
        <Copy />
      </IconButton>
      <div
        style={{
          ...styles.wrapper,
          backgroundColor,
          color: lineNumberColor,
          borderColor,
        }}
      >
        <div
          style={{
            ...styles.lineNumbersColumn,
            color: gdevelopTheme.text.secondary,
          }}
        >
          {tokensByLine.map((_, lineIndex) => (
            <div key={`line-number-${lineIndex}`} style={styles.lineNumber}>
              {lineIndex + 1}
            </div>
          ))}
        </div>
        <div
          style={{
            ...styles.codeColumn,
            backgroundColor,
          }}
        >
          {tokensByLine.map((tokens, lineIndex) => (
            <div key={`code-line-${lineIndex}`} style={styles.codeLine}>
              {tokens.map((token, tokenIndex) => (
                <span
                  key={`token-${lineIndex}-${tokenIndex}`}
                  style={{
                    color:
                      // $FlowFixMe[incompatible-type]
                      (tokenStyleMap[token.type] || {}).color ||
                      tokenStyleMap.plain.color,
                    // $FlowFixMe[incompatible-type]
                    fontStyle: (tokenStyleMap[token.type] || {}).fontStyle,
                    ...styles.token,
                  }}
                >
                  {token.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <InfoBar
        message={<Trans>Copied to clipboard!</Trans>}
        visible={showCopiedInfoBar}
        hide={() => setShowCopiedInfoBar(false)}
      />
    </div>
  );
};

export default TextBasedCourseChapterCodeBlock;
