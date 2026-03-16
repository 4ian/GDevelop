const fs = require('fs');
const path = require('path');

const examplesRoot = path.join(__dirname, '../public/examples');
const outputFile = path.join(examplesRoot, 'examples.json');
const excludedIds = new Set(['3d-first-person', 'first-person']);

const readJson = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
};

const toVersionString = gdVersion => {
  if (!gdVersion || typeof gdVersion !== 'object') return '0.0.0';
  const major = gdVersion.major || 0;
  const minor = gdVersion.minor || 0;
  const revision = gdVersion.revision || 0;
  return `${major}.${minor}.${revision}`;
};

const hasPreview = folderPath =>
  fs.existsSync(path.join(folderPath, 'preview.jpg')) ||
  fs.existsSync(path.join(folderPath, 'preview.png'));

const buildExampleEntry = folderName => {
  const folderPath = path.join(examplesRoot, folderName);
  const gamePath = path.join(folderPath, 'game.json');
  if (!fs.existsSync(gamePath)) return null;

  const game = readJson(gamePath);
  const props = game.properties || {};
  const gdVersion = toVersionString(game.gdVersion);

  const id = props.templateSlug || folderName;
  if (excludedIds.has(id)) return null;

  const name = props.name || folderName;
  const description = props.description || '';
  const shortDescription = description || 'Local example template.';

  const previewFile = fs.existsSync(path.join(folderPath, 'preview.jpg'))
    ? 'preview.jpg'
    : fs.existsSync(path.join(folderPath, 'preview.png'))
    ? 'preview.png'
    : null;

  const previewImageUrls = previewFile
    ? [`examples/${folderName}/${previewFile}`]
    : [];

  const tags = props.tags || ['Template'];

  return {
    id,
    slug: id,
    name,
    shortDescription,
    description,
    license: 'MIT',
    tags,
    authorIds: [],
    previewImageUrls,
    gdevelopVersion: gdVersion,
    codeSizeLevel: 'medium',
    difficultyLevel: 'intermediate',
    projectFileUrl: `examples/${folderName}/game.json`,
    authors: [],
  };
};

const folders = fs
  .readdirSync(examplesRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .filter(name => !name.startsWith('_'));

const examples = folders
  .map(buildExampleEntry)
  .filter(Boolean);

const exampleShortHeaders = examples.map(({ projectFileUrl, authors, ...rest }) => rest);

const allTags = Array.from(
  new Set(
    examples.reduce((acc, example) => acc.concat(example.tags || []), [])
  )
);

const output = {
  exampleShortHeaders,
  filters: {
    allTags,
    defaultTags: allTags,
    tagsTree: [],
  },
  examplesById: examples.reduce((acc, example) => {
    acc[example.id] = example;
    return acc;
  }, {}),
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2) + '\n', 'utf8');
console.log(`Wrote ${examples.length} examples to ${outputFile}`);
