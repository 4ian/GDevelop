// @ts-check

/**
 * Convert the markdown text into markdown supported by DokuWiki, converting
 * the links and image references.
 * @param {string} markdownText
 * @returns {string}
 */
const convertMarkdownToDokuWikiMarkdown = markdownText => {
  const markdown = markdownText
    // Replace images (`![label](image url)`)
    .replace(/\!\[(.*?)\]\((.*?)\)/g, (match, linkText, linkUrl) => {
      const url = linkUrl.replace(/^\/+/, '');
      const title = linkText.replace(/^\[(.*?)\]/, '$1');
      return `{{ ${url}?nolink |}}`;
    })
    // Replace links (`[text](url)`)
    .replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, linkUrl) => {
      const url = linkUrl.replace(/^\/+/, '');
      const title = linkText.replace(/^\[(.*?)\]/, '$1');
      return `[[${url}|${title}]]`;
    })
    // Add a new line before each list, to make sure DokuWiki renders it correctly.
    .replace(/((\n[-\*].*)+)/gm, '\n$1')
  return markdown;
};

module.exports = {
  convertMarkdownToDokuWikiMarkdown,
};
