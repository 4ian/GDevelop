// @ts-check
/**
 * Launch this script to generate a list (in markdown format) of all custom extensions.
 */

const fs = require('fs').promises;
const { default: axios } = require('axios');
const path = require('path');

const extensionsRegistoryURL =
  'https://raw.githubusercontent.com/4ian/GDevelop-extensions/master/extensions-registry.json';
const gdRootPath = path.join(__dirname, '..', '..', '..');
const outputRootPath = path.join(gdRootPath, 'docs-wiki');
const outputFilePath = path.join(outputRootPath, 'extensions.txt');

(async () => {
  try {
    const response = await axios.get(extensionsRegistoryURL);
    let texts = `# Extensions

GDevelop is built in a flexible way. In addition to [[gdevelop5:all-features|core features]], new capabilities are provided by extensions. Extensions can contain objects, behaviors, actions, conditions, expressions or events.

[[gdevelop5:extensions:search|Directly from GDevelop]], you have access to a collection of community created extensions, listed here. You can also [[gdevelop5:extensions:create|create]], directly in your project, new behaviors, actions, conditions or expressions for your game.

`;

    response.data.extensionShortHeaders.forEach(element => {
      // TODO: link to help
      texts +=
        '## ' +
        element.fullName +
        '\n' +
        // Use the `&.png?` syntax to force Dokuwiki to display the image.
        // See https://www.dokuwiki.org/images.
        `{{${element.previewIconUrl}?&.png?nolink&48x48 |}}` +
        '\n' +
        element.shortDescription +
        '\n\n';
    });

    texts += `
## Make your own extension

It's easy to create, directly in your project, new behaviors, actions, conditions or expressions for your game.

Read more about this:

* [[gdevelop5:extensions:create|Create your own extensions]]
* [[gdevelop5:extensions:share|Share extensions with the community]]
* [[gdevelop5:extensions:extend-gdevelop|Extend GDevelop with JavaScript or C++]]`

    try {
      await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
      await fs.writeFile(outputFilePath, texts);
      console.info(`✅ Done. File generated: ${outputFilePath}`);
    } catch (err) {
      console.error('❌ Error while writing output', err);
    }
  } catch (err) {
    console.error('❌ Error while fetching data', err);
  }
})();
