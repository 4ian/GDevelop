const convertCommonMarkdownToPythonMarkdown = content => {
  return content.replace(/((\n[-*].*)+)/gm, '\n$1');
};

module.exports = { convertCommonMarkdownToPythonMarkdown };
