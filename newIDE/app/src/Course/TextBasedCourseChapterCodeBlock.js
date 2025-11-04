// @flow

import * as React from 'react';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import Copy from '../UI/CustomSvgIcons/Copy';
import IconButton from '../UI/IconButton';
import InfoBar from '../UI/Messages/InfoBar';
import { Trans } from '@lingui/macro';

const KEYWORDS = [
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'await',
  'async',
  'static',
  'get',
  'set',
  'of',
  'from',
];

const KEYWORD_SET = new Set(KEYWORDS);

const BOOLEAN_LITERALS = new Set(['true', 'false', 'null', 'undefined']);

type TokenType =
  | 'keyword'
  | 'boolean'
  | 'string'
  | 'comment'
  | 'number'
  | 'operator'
  | 'punctuation'
  | 'identifier'
  | 'whitespace'
  | 'plain';

type Token = {| type: TokenType, text: string |};

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

const darkTokenStyles: {
  [TokenType]: {| color?: string, fontStyle?: 'italic' |},
} = {
  keyword: { color: '#c792ea' },
  boolean: { color: '#c792ea' },
  string: { color: '#ecc48d' },
  comment: { color: '#637777', fontStyle: 'italic' },
  number: { color: '#f78c6c' },
  operator: { color: '#89ddff' },
  punctuation: { color: '#89ddff' },
  identifier: { color: '#82aaff' },
  plain: { color: '#d6deeb' },
};

const lightTokenStyles: {
  [TokenType]: {| color?: string, fontStyle?: 'italic' |},
} = {
  keyword: { color: '#7c3aed' },
  boolean: { color: '#7c3aed' },
  string: { color: '#b45309' },
  comment: { color: '#64748b', fontStyle: 'italic' },
  number: { color: '#b91c1c' },
  operator: { color: '#0f766e' },
  punctuation: { color: '#0f766e' },
  identifier: { color: '#1d4ed8' },
  plain: { color: '#0f172a' },
};

const WHITESPACE_REGEX = /^\s+/;
const NUMBER_REGEX = /^(0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/;
const IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*/;
const OPERATOR_REGEX = /^((===|!==|>>>|<<=|>>=|==|!=|<=|>=|=>|\+\+|--|\+=|-=|\*=|\/=|%=|&&|\|\||\^=|&=|\|=)|[+\-*/%&|^!~<>?:=])/;
const PUNCTUATION_REGEX = /^[{}()[\].,;]/;

const tokenizeLine = ({
  line,
  isInBlockComment,
  isInTemplateString,
}: {|
  line: string,
  isInBlockComment: boolean,
  isInTemplateString: boolean,
|}): {|
  tokens: Token[],
  isInBlockComment: boolean,
  isInTemplateString: boolean,
|} => {
  const tokens: Token[] = [];
  let index = 0;
  let blockComment = isInBlockComment;
  let templateString = isInTemplateString;

  while (index < line.length) {
    if (templateString) {
      const closingIndex = findTemplateStringEnd(line, index);
      if (closingIndex === -1) {
        tokens.push({ type: 'string', text: line.slice(index) });
        return {
          tokens,
          isInBlockComment: blockComment,
          isInTemplateString: true,
        };
      }

      tokens.push({
        type: 'string',
        text: line.slice(index, closingIndex + 1),
      });
      index = closingIndex + 1;
      templateString = false;
      continue;
    }

    if (blockComment) {
      const closingIndex = line.indexOf('*/', index);
      if (closingIndex === -1) {
        tokens.push({ type: 'comment', text: line.slice(index) });
        return { tokens, isInBlockComment: true, isInTemplateString: false };
      }

      tokens.push({
        type: 'comment',
        text: line.slice(index, closingIndex + 2),
      });
      index = closingIndex + 2;
      blockComment = false;
      continue;
    }

    if (line.startsWith('//', index)) {
      tokens.push({ type: 'comment', text: line.slice(index) });
      break;
    }

    if (line.startsWith('/*', index)) {
      const closingIndex = line.indexOf('*/', index + 2);
      if (closingIndex === -1) {
        tokens.push({ type: 'comment', text: line.slice(index) });
        return { tokens, isInBlockComment: true, isInTemplateString: false };
      }

      tokens.push({
        type: 'comment',
        text: line.slice(index, closingIndex + 2),
      });
      index = closingIndex + 2;
      continue;
    }

    const char = line[index];
    if (char === '"' || char === "'") {
      const closingIndex = findStringEnd(line, index, char);
      tokens.push({
        type: 'string',
        text: line.slice(index, closingIndex),
      });
      index = closingIndex;
      continue;
    }

    if (char === '`') {
      const closingIndex = findTemplateStringEnd(line, index + 1);
      if (closingIndex === -1) {
        tokens.push({ type: 'string', text: line.slice(index) });
        return { tokens, isInBlockComment: false, isInTemplateString: true };
      }

      tokens.push({
        type: 'string',
        text: line.slice(index, closingIndex + 1),
      });
      index = closingIndex + 1;
      continue;
    }

    const whitespace = matchRegex(WHITESPACE_REGEX, line, index);
    if (whitespace) {
      tokens.push({ type: 'whitespace', text: whitespace });
      index += whitespace.length;
      continue;
    }

    const number = matchRegex(NUMBER_REGEX, line, index);
    if (number) {
      tokens.push({ type: 'number', text: number });
      index += number.length;
      continue;
    }

    const identifier = matchRegex(IDENTIFIER_REGEX, line, index);
    if (identifier) {
      if (BOOLEAN_LITERALS.has(identifier)) {
        tokens.push({ type: 'boolean', text: identifier });
      } else if (KEYWORD_SET.has(identifier)) {
        tokens.push({ type: 'keyword', text: identifier });
      } else {
        tokens.push({ type: 'identifier', text: identifier });
      }
      index += identifier.length;
      continue;
    }

    const operator = matchRegex(OPERATOR_REGEX, line, index);
    if (operator) {
      tokens.push({ type: 'operator', text: operator });
      index += operator.length;
      continue;
    }

    const punctuation = matchRegex(PUNCTUATION_REGEX, line, index);
    if (punctuation) {
      tokens.push({ type: 'punctuation', text: punctuation });
      index += punctuation.length;
      continue;
    }

    tokens.push({ type: 'plain', text: char });
    index += 1;
  }

  return {
    tokens,
    isInBlockComment: blockComment,
    isInTemplateString: templateString,
  };
};

const matchRegex = (
  regex: RegExp,
  text: string,
  startIndex: number
): string | null => {
  const match = text.slice(startIndex).match(regex);
  return match ? match[0] : null;
};

const findStringEnd = (
  line: string,
  startIndex: number,
  quote: string
): number => {
  let index = startIndex + 1;
  while (index < line.length) {
    if (line[index] === '\\') {
      index += 2;
      continue;
    }
    if (line[index] === quote) {
      return index + 1;
    }
    index += 1;
  }
  return line.length;
};

const findTemplateStringEnd = (line: string, startIndex: number): number => {
  let index = startIndex;
  while (index < line.length) {
    if (line[index] === '\\') {
      index += 2;
      continue;
    }
    if (line[index] === '`') {
      return index;
    }
    index += 1;
  }
  return -1;
};

const computeTokensByLine = (code: string): Token[][] => {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const tokensByLine: Token[][] = [];
  let isInBlockComment = false;
  let isInTemplateString = false;

  for (const line of lines) {
    const {
      tokens,
      isInBlockComment: blockCommentState,
      isInTemplateString: templateStringState,
    } = tokenizeLine({
      line,
      isInBlockComment,
      isInTemplateString,
    });
    tokensByLine.push(tokens);
    isInBlockComment = blockCommentState;
    isInTemplateString = templateStringState;
  }

  if (tokensByLine.length === 0) return [[]];
  return tokensByLine;
};

const TextBasedCourseChapterCodeBlock = ({ code, language }: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const normalizedCode = React.useMemo(() => code.replace(/\t/g, '  '), [code]);
  const tokensByLine = React.useMemo(
    () => {
      if (
        language &&
        language.toLowerCase() !== 'javascript' &&
        language.toLowerCase() !== 'js'
      ) {
        return normalizedCode
          .replace(/\r\n/g, '\n')
          .split('\n')
          .map(line => [{ type: 'plain', text: line }]);
      }

      return computeTokensByLine(normalizedCode);
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
    () => (isDarkMode ? darkTokenStyles : lightTokenStyles),
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
                      (tokenStyleMap[token.type] || {}).color ||
                      tokenStyleMap.plain.color,
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
