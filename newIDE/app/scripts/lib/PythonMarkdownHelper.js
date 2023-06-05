// Check if a line starts with a Markdown list item.
const isListItem = line => (/^[ \t]*([*+-]|\d+\.)[ \t]+/).test(line);

// Calculate indentation level based on leading whitespaces (spaces or tabs).
const getIndentationLevel = line => line.match(/^( |\t)*/)[0].length;

// Check if a line is empty or contains only whitespaces.
const isEmptyLine = line => line.trim() === '';

// Add a blank line to result if the next or previous Line line is not an empty line.
const addBlankLine = (line, nextOrPreviousLine, result) => {
  if (!isEmptyLine(nextOrPreviousLine)) {
    result.push('');
  }
}

// Function to handle non-list item lines after a list.
const handleNonListItem = (lines, index, line, nextLine, result, currentIndentation, nextIndentation) => {
  if (isEmptyLine(nextLine)) {
    // If the next line is empty, we need to check the line after to see if it's a list item. (Could be an nested lists)
    return isListItem(lines[index + 2] || '');
  } else if (currentIndentation >= nextIndentation) {
    // Add a blank line after a list if the next line is not a list item and at the same or less indentation level.
    addBlankLine(line, nextLine, result);
    return isListItem(lines[index + 2] || '');
  }
  return false;
};

const convertCommonMarkdownToPythonMarkdown = content => {
  const lines = content.split('\n');
  const result = [];
  let startList = false;

  lines.forEach((line, index) => {
    const currentIndentation = getIndentationLevel(line);
    const isCurrentListItem = isListItem(line);

    if (isCurrentListItem) {
      const previousLine = lines[index - 1] || '';

      // Add blank line before the list starts.
      if (!startList) {
        addBlankLine(line, previousLine, result);
        startList = true;
      } else if (getIndentationLevel(previousLine) < currentIndentation) {
        // Add blank line before a nested list starts.
        addBlankLine(line, previousLine, result);
      }
    }

    result.push(line);

    if (startList) {
      const nextLine = lines[index + 1] || '';
      const nextIndentation = getIndentationLevel(nextLine);
      const isNextListItem = isListItem(nextLine);

      // Handling non-list item lines after a list.
      if (!isNextListItem) {
        startList = handleNonListItem(lines, index, line, nextLine, result, currentIndentation, nextIndentation);
      } else if (currentIndentation > nextIndentation) {
        // Add blank line after a nested list ends.
        addBlankLine(line, nextLine, result);
      }
    }
  });

  // Remove last line if it is blank.
  if (isEmptyLine(result[result.length - 1])) {
    result.pop();
  }

  // Join lines into a single string to form the converted content.
  return result.map(line => {
    // If a line is not a header, list item, or empty, and does not end with two spaces, add spaces until it does.
    if (!line.startsWith('#') && !isListItem(line) && !isEmptyLine(line)) {
      while (!line.endsWith('  ')) {
        line += ' ';
      }
    }
    return line;
  }).join('\n');
};

module.exports = { convertCommonMarkdownToPythonMarkdown };
