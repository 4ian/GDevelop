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

const findProjectFile = (folderPath, folderName) => {
  const gamePath = path.join(folderPath, 'game.json');
  if (fs.existsSync(gamePath)) {
    return { fileName: 'game.json', filePath: gamePath };
  }

  const jsonFiles = fs
    .readdirSync(folderPath)
    .filter(name => name.toLowerCase().endsWith('.json'));
  if (!jsonFiles.length) return null;

  const folderJson = `${folderName}.json`.toLowerCase();
  const match =
    jsonFiles.find(name => name.toLowerCase() === folderJson) || jsonFiles[0];

  return {
    fileName: match,
    filePath: path.join(folderPath, match),
  };
};

const findPreviewFile = folderPath => {
  const candidates = [
    'preview.jpg',
    'preview.png',
    'thumbnail.jpg',
    'thumbnail.png',
  ];
  return candidates.find(fileName =>
    fs.existsSync(path.join(folderPath, fileName))
  );
};

const buildExampleEntry = folderName => {
  const folderPath = path.join(examplesRoot, folderName);
  const projectFile = findProjectFile(folderPath, folderName);
  if (!projectFile) return null;

  const game = readJson(projectFile.filePath);
  const props = game.properties || {};
  const gdVersion = toVersionString(game.gdVersion);

  const id = folderName;
  if (excludedIds.has(id)) return null;

  const name = props.name || folderName;
  const description = props.description || '';
  const shortDescription = description || 'Local example template.';

  const previewFile = findPreviewFile(folderPath);

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
    projectFileUrl: `examples/${folderName}/${projectFile.fileName}`,
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
