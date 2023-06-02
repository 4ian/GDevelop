const requireSpaceLength = 4; // The number of spaces required for a line to be considered a Markdown list item. (python-markdown requires 4 spaces)

// Check if a line starts with a Markdown list item.
const isListItem = line => (/^[ \t]*([*-]|\d+\.)[ \t]+/).test(line);

// Calculate indentation level based on leading whitespaces (spaces or tabs).
const getIndentationLevel = line => line.match(/^( |\t)*/)[0].length;

// Calculate indentation level based on leading spaces only.
const getSpaceIndentationLevel = line => line.match(/^ */)[0].length;

// Check if a line is empty or contains only whitespaces.
const isEmptyLine = line => line.trim() === '';

const convertCommonMarkdownToPythonMarkdown = content => {
  const lines = content.split('\n');
  const result = [];
  let isInList = false;
  let sublistLevel = 0;

  lines.forEach((line, index) => {
    const currentIndentation = getIndentationLevel(line);
    const isCurrentListItem = isListItem(line);

    if (isCurrentListItem) {
      const previousLine = lines[index - 1] || '';
      const previousIndentation = getIndentationLevel(previousLine);

      if (!isInList) {
        if (!isEmptyLine(previousLine)) {
          result.push(''); // Add a blank line before starting a list, unless the previous line is already a blank line.
        }
        isInList = true;
      } else if (previousIndentation < currentIndentation) {
        if (!isEmptyLine(previousLine)) {
          result.push(''); // Add a blank line before starting a sublist, unless the previous line is already a blank line.
        }
        sublistLevel += 1;
      }

      if (sublistLevel > 0) {
        // Adjust indentation level for sublist items.
        const spaceIndentationLevel = getSpaceIndentationLevel(line);
        if (spaceIndentationLevel % requireSpaceLength !== 0) {
          const spaceLength = spaceIndentationLevel - (spaceIndentationLevel % requireSpaceLength);
          line = line.replace(/^ */, ' '.repeat(spaceLength + requireSpaceLength)); // Replace leading spaces with spaces of the correct indentation level.
        }
      }
    }

    result.push(line); // Push the current line into result before checking if the list ends

    if (isInList) {
      const nextLine = lines[index + 1] || '';
      const nextIndentation = getIndentationLevel(nextLine);
      const isNextListItem = isListItem(nextLine);

      if (!isNextListItem) {
        if (isEmptyLine(nextLine)) {
          isInList = false;
        } else if (currentIndentation >= nextIndentation) {
          result.push(''); // Add a blank line after ending a list or a sublist, unless the next line is already a blank line.
          isInList = false;
          if (sublistLevel > 0) {
            sublistLevel -= 1;
          }
        }
      } else if (currentIndentation > nextIndentation) {
        if (!isEmptyLine(nextLine)) {
          result.push(''); // Add a blank line after ending a sublist, unless the next line is already a blank line.
        }
        sublistLevel -= 1;
      }
    }
  });

  // If the last line of the result is a blank line, remove it.
  if (isEmptyLine(result[result.length - 1])) {
    result.pop();
  }

  return result.join('\n');
};

module.exports = { convertCommonMarkdownToPythonMarkdown };
