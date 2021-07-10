// @ts-check

/**
 * Convert the markdown text into markdown supported by DokuWiki, converting
 * the links and image references.
 * @param {string} markdownText
 * @returns {string}
 */
const convertMarkdownToDokuWikiMarkdown = markdownText => {
  const markdown = markdownText
    .replace(/\!\[(.*?)\]\((.*?)\)/g, (match, linkText, linkUrl) => {
      const url = linkUrl.replace(/^\/+/, '');
      const title = linkText.replace(/^\[(.*?)\]/, '$1');
      return `{{${url}?nolink |}}`;
    })
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, linkUrl) => {
      const url = linkUrl.replace(/^\/+/, '');
      const title = linkText.replace(/^\[(.*?)\]/, '$1');
      return `{{${url}|${title}}}`;
    });
  return markdown;
};

module.exports = {
  convertMarkdownToDokuWikiMarkdown,
};
