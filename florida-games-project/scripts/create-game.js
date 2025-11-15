#!/usr/bin/env node

/**
 * Florida Games - Create New Game Script
 * Creates a new game project from templates with proper structure
 */

const fs = require('fs-extra');
const path = require('path');
const { program } = require('commander');

program
  .name('create-game')
  .description('Create a new Florida-themed game from template')
  .requiredOption('-n, --name <name>', 'Game name (lowercase-with-dashes)')
  .option('-t, --template <template>', 'Template to use', 'platformer')
  .option('-d, --description <desc>', 'Game description', '')
  .parse(process.argv);

const options = program.opts();

const TEMPLATES = {
  platformer: 'Platformer game template',
  runner: 'Endless runner template',
  puzzle: 'Puzzle game template',
  simulation: 'Simulation/management template',
  adventure: 'Adventure/exploration template',
  casual: 'Casual/arcade template'
};

async function createGame() {
  const gameName = options.name;
  const template = options.template;
  const description = options.description || `A Florida-themed ${template} game`;

  console.log(`🌴 Creating Florida game: ${gameName}`);
  console.log(`📋 Using template: ${template}`);

  const projectRoot = path.join(__dirname, '..');
  const gameDir = path.join(projectRoot, 'games', gameName);

  // Check if game already exists
  if (await fs.pathExists(gameDir)) {
    console.error(`❌ Error: Game "${gameName}" already exists!`);
    process.exit(1);
  }

  // Create game directory structure
  console.log('📁 Creating directory structure...');
  await fs.ensureDir(path.join(gameDir, 'assets', 'sprites'));
  await fs.ensureDir(path.join(gameDir, 'assets', 'backgrounds'));
  await fs.ensureDir(path.join(gameDir, 'assets', 'audio', 'music'));
  await fs.ensureDir(path.join(gameDir, 'assets', 'audio', 'sfx'));
  await fs.ensureDir(path.join(gameDir, 'assets', 'fonts'));
  await fs.ensureDir(path.join(gameDir, 'assets', 'ui'));
  await fs.ensureDir(path.join(gameDir, 'custom-extensions'));

  // Create package.json
  console.log('📦 Creating package.json...');
  const packageJson = {
    name: `@florida-games/${gameName}`,
    version: '0.1.0',
    description: description,
    private: true,
    dependencies: {
      '@florida-games/core': '^1.0.0',
      '@florida-games/environment': '^1.0.0'
    },
    scripts: {
      build: 'node ../../scripts/build-game.js',
      'build:prod': 'node ../../scripts/build-game.js --production',
      test: 'node ../../scripts/test-game.js',
      deploy: 'node ../../scripts/deploy-game.js'
    }
  };
  await fs.writeJson(path.join(gameDir, 'package.json'), packageJson, { spaces: 2 });

  // Create game.json (basic template)
  console.log('🎮 Creating game.json...');
  const gameJson = {
    firstLayout: 'MainScene',
    gdVersion: {
      build: 0,
      major: 5,
      minor: 0,
      revision: 0
    },
    properties: {
      name: gameName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      author: '',
      version: '0.1.0',
      description: description,
      packageName: `com.floridagames.${gameName.replace(/-/g, '')}`,
      orientation: 'landscape',
      windowWidth: 1920,
      windowHeight: 1080,
      maxFPS: 60,
      minFPS: 30,
      verticalSync: false,
      extensions: [
        { name: 'BuiltinObject' },
        { name: 'BuiltinAudio' },
        { name: 'BuiltinVariables' },
        { name: 'BuiltinTime' },
        { name: 'BuiltinMouse' },
        { name: 'BuiltinKeyboard' },
        { name: 'BuiltinCamera' },
        { name: 'BuiltinWindow' },
        { name: 'BuiltinScene' },
        { name: 'Sprite' },
        { name: 'FloridaCore' },
        { name: 'FloridaEnvironment' }
      ],
      platformSpecificAssets: {},
      loadingScreen: {
        showGDevelopSplash: true
      },
      authorIds: [],
      authorUsernames: []
    },
    layouts: [
      {
        name: 'MainScene',
        r: 135,
        v: 206,
        b: 250,
        mangledName: 'MainScene',
        standardSortMethod: true,
        stopSoundsOnStartup: true,
        title: '',
        behaviorsSharedData: [],
        instances: [],
        objects: [],
        objectsGroups: [],
        variables: [],
        layers: [
          {
            name: '',
            visibility: true,
            cameras: [
              {
                defaultSize: true,
                defaultViewport: true,
                height: 0,
                viewportBottom: 1,
                viewportLeft: 0,
                viewportRight: 1,
                viewportTop: 0,
                width: 0
              }
            ],
            effects: []
          }
        ],
        behaviorsSharedData: []
      }
    ],
    externalLayouts: [],
    eventsFunctionsExtensions: [],
    externalEvents: [],
    externalSourceFiles: [],
    objects: [],
    objectsGroups: [],
    variables: [],
    resources: {
      resources: []
    }
  };
  await fs.writeJson(path.join(gameDir, 'game.json'), gameJson, { spaces: 2 });

  // Create README.md
  console.log('📝 Creating README.md...');
  const readmeContent = `# ${gameName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')}

## Description
${description}

## Features
- Feature 1
- Feature 2
- Feature 3

## Florida Elements
- [Describe Florida themes incorporated]

## Development Status
- [x] Project initialized
- [ ] Prototype
- [ ] Alpha
- [ ] Beta
- [ ] Release

## Dependencies
- FloridaCore v1.0.0
- FloridaEnvironment v1.0.0

## Version History
See [CHANGELOG.md](CHANGELOG.md)

## Building
\`\`\`bash
npm run build
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`

## License
MIT
`;
  await fs.writeFile(path.join(gameDir, 'README.md'), readmeContent);

  // Create CHANGELOG.md
  console.log('📋 Creating CHANGELOG.md...');
  const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - ${new Date().toISOString().split('T')[0]}
### Added
- Initial project setup
- Basic game structure
- Shared extensions integration
`;
  await fs.writeFile(path.join(gameDir, 'CHANGELOG.md'), changelogContent);

  // Create .gitignore
  const gitignoreContent = `# Build outputs
build/
dist/

# GDevelop
*.autosave
*.backup

# Assets (if using shared assets)
# Uncomment to ignore local asset copies
# assets/shared/
`;
  await fs.writeFile(path.join(gameDir, '.gitignore'), gitignoreContent);

  console.log('✅ Game created successfully!');
  console.log('');
  console.log('Next steps:');
  console.log(`1. cd games/${gameName}`);
  console.log('2. Open game.json in GDevelop');
  console.log('3. Start building your Florida-themed game!');
  console.log('');
  console.log('📚 Check the Playbook for development guidelines:');
  console.log('   ../../FLORIDA_GAMES_PLAYBOOK.md');
}

// Run if called directly
if (require.main === module) {
  createGame().catch(error => {
    console.error('❌ Error creating game:', error);
    process.exit(1);
  });
}

module.exports = { createGame };
