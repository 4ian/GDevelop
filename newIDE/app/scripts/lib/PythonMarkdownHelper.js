// Checks if a line is empty.
const isEmptyLine = line => line.trim() === '';

// Checks if a line is a header.
// A header starts with 1-6 '#' characters at the beginning of the line.
const isHeader = line => (/^ {0,3}#{1,6}/).test(line);

// Checks if a line is a table.
// A table starts and ends with '|'
const isTable = line => (/^ {0,3}\|/ && /\|[ \t]*$/).test(line);

// Checks if a line is a code block.
// A code block starts with three '`' characters at the beginning of the line.
const isCodeBlock = line => (/^ {0,3}```[a-z]*/).test(line);

// Checks if a line is a list item.
// A list item starts with '*', '+', '-' or number followed by '.' at the beginning of the line.
const isListItem = line => (/^[ \t]*([*+-]|\d+\.)[ \t]+/).test(line);

// Checks if a line is a blockquote.
// A blockquote starts with '>' at the beginning of the line.
const isBlockquoteItem = line => (/^ {0,3}>/).test(line);

// Determines the type of a markdown element.
const getElementType = (line) => {
  if (isEmptyLine(line)) {
    return 'empty';
  }

  if (isHeader(line)) {
    return 'header';
  }

  if (isTable(line)) {
    return 'table';
  }

  if (isCodeBlock(line)) {
    return 'codeBlock';
  }

  if (isListItem(line)) {
    return 'list';
  }
  
  if (isBlockquoteItem(line)) {
    return 'blockquote';
  }

  return 'paragraph';
};

// Defines the types of markdown elements that do not require an extra line break between them.
const typesNoNeedExtraLineBreak = [ 'paragraph', 'list', 'blockquote', 'table' ];

// Checks if an additional line break is needed between two markdown elements.
// An additional line break is not needed if the two elements are of the same type and do not require an extra line break.
// Also, an additional line break is not needed if either of the elements is empty.
const needAdditionalLineBreakBetweenElements = (line, otherLine) => {
  const elementType1 = getElementType(line);
  if (elementType1 === 'empty') {
    return false;
  }

  const elementType2 = getElementType(otherLine);
  if (elementType2 === 'empty') {
    return false;
  }

  return elementType1 !== elementType2 || !typesNoNeedExtraLineBreak.includes(elementType1);
};

const convertCommonMarkdownToPythonMarkdown = content => {
  const lines = content.split('\n');
  const result = [];

  let isInCodeBlock = false;
  let previousLineWasEmpty = false;
  lines.forEach((line, index) => {
    const previousLine = lines[index - 1] || '';
    if (!isInCodeBlock && !previousLineWasEmpty && needAdditionalLineBreakBetweenElements(previousLine, line)) {
      result.push('');
    }

    // Check if the current line starts or ends a code block.
    if (isCodeBlock(line)) {
      isInCodeBlock = !isInCodeBlock;
    }

    result.push(line);

    const nextLine = lines[index + 1] || '';
    if (!isInCodeBlock && !previousLineWasEmpty && needAdditionalLineBreakBetweenElements(line, nextLine)) {
      result.push('');
      previousLineWasEmpty = true;
    } else {
      previousLineWasEmpty = false;
    }
  });

  if (isEmptyLine(result[result.length - 1])) {
    result.pop();
  }

  return result.join('\n');
};

module.exports = { convertCommonMarkdownToPythonMarkdown };
