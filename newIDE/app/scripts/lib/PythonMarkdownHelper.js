const convertCommonMarkdownToPythonMarkdown = content => {
  return content.replace(/((\n[ \t]{0,2}[-*].*)+)/gm, '\n$1');
};

module.exports = { convertCommonMarkdownToPythonMarkdown };
