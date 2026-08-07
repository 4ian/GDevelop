// @flow

/**
 * A small, approximate JavaScript tokenizer used to display code with syntax
 * colors (course chapters, AI chat scripts...). It never throws: a
 * mis-tokenized line is only a coloring glitch.
 */

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

export type JavaScriptTokenType =
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

export type JavaScriptToken = {| type: JavaScriptTokenType, text: string |};

export type JavaScriptTokenStyle = {|
  color?: string,
  fontStyle?: 'italic',
|};

const darkTokenStyles: {
  [JavaScriptTokenType]: JavaScriptTokenStyle,
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
  [JavaScriptTokenType]: JavaScriptTokenStyle,
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

export const getJavaScriptTokenStyles = ({
  isDarkMode,
}: {|
  isDarkMode: boolean,
|}): { [JavaScriptTokenType]: JavaScriptTokenStyle } =>
  isDarkMode ? darkTokenStyles : lightTokenStyles;

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
  tokens: JavaScriptToken[],
  isInBlockComment: boolean,
  isInTemplateString: boolean,
|} => {
  const tokens: JavaScriptToken[] = [];
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

/**
 * Split the given code into lines, each tokenized for coloring. Always returns
 * at least one (possibly empty) line.
 */
export const computeJavaScriptTokensByLine = (
  code: string
): JavaScriptToken[][] => {
  const lines = code.replace(/\r\n/g, '\n').split('\n');
  const tokensByLine: JavaScriptToken[][] = [];
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
