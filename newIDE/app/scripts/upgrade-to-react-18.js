/**
 * Idempotent codemod script to upgrade newIDE/app from React 16 to React 18.
 *
 * What it does:
 * 1. Updates package.json: react, react-dom, react-test-renderer to 18.2.0
 *    and adds npm overrides so third-party packages accept React 18
 * 2. Updates src/index.js: ReactDOM.render() -> createRoot().render()
 * 3. Adds Flow type declaration for react-dom/client in flow-libs/react-dom.js
 *
 * Re-running this script on an already-upgraded codebase is a no-op.
 */
const fs = require('fs');
const path = require('path');

const appRoot = path.resolve(__dirname, '..');

function readFile(relativePath) {
  return fs.readFileSync(path.join(appRoot, relativePath), 'utf8');
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(appRoot, relativePath), content, 'utf8');
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. Update package.json versions
// ──────────────────────────────────────────────────────────────────────────────
function updatePackageJson() {
  const filePath = 'package.json';
  const pkg = JSON.parse(readFile(filePath));
  let changed = false;

  const depUpdates = {
    react: '18.2.0',
    'react-dom': '18.2.0',
    'react-test-renderer': '18.2.0',
  };

  for (const [dep, version] of Object.entries(depUpdates)) {
    if (pkg.dependencies && pkg.dependencies[dep] && pkg.dependencies[dep] !== version) {
      pkg.dependencies[dep] = version;
      changed = true;
    }
  }

  // Add overrides so that all third-party packages use our React 18,
  // even if their peerDependencies only declare React 16/17 support.
  // The "$react" / "$react-dom" syntax means "use the version from
  // this package.json's own dependencies".
  if (!pkg.overrides) pkg.overrides = {};
  const requiredOverrides = {
    react: '$react',
    'react-dom': '$react-dom',
  };
  for (const [key, value] of Object.entries(requiredOverrides)) {
    if (pkg.overrides[key] !== value) {
      pkg.overrides[key] = value;
      changed = true;
    }
  }

  // @material-ui/styles is a dependency of @material-ui/core but its
  // peerDependencies only declare React ^16 || ^17. This causes npm to
  // nest it inside @material-ui/core/node_modules instead of hoisting it.
  // Since the app code imports directly from '@material-ui/styles', we
  // need it hoisted. Adding it as a direct dependency forces hoisting.
  if (!pkg.dependencies['@material-ui/styles']) {
    pkg.dependencies['@material-ui/styles'] = '4.11.5';
    changed = true;
  }

  if (changed) {
    writeFile(filePath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('[package.json] Updated react, react-dom, react-test-renderer to 18.2.0 with overrides');
  } else {
    console.log('[package.json] Already up to date.');
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. Update src/index.js to use createRoot from react-dom/client
// ──────────────────────────────────────────────────────────────────────────────
function updateIndexJs() {
  const filePath = 'src/index.js';
  let content = readFile(filePath);

  // Already upgraded?
  if (content.includes('react-dom/client')) {
    console.log('[src/index.js] Already upgraded to createRoot.');
    return;
  }

  // Replace import
  content = content.replace(
    "import ReactDOM from 'react-dom';",
    "// $FlowFixMe[cannot-resolve-module] - react-dom/client is available in React 18\nimport { createRoot } from 'react-dom/client';"
  );

  // Replace ReactDOM.render(<Bootstrapper />, rootElement) with createRoot(rootElement).render(<Bootstrapper />)
  content = content.replace(
    /ReactDOM\.render\(<Bootstrapper \/>, rootElement\)/,
    'createRoot(rootElement).render(<Bootstrapper />)'
  );

  writeFile(filePath, content);
  console.log('[src/index.js] Upgraded to createRoot.');
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. Add Flow type declaration for react-dom/client
// ──────────────────────────────────────────────────────────────────────────────
function updateFlowTypes() {
  const filePath = 'flow-libs/react-dom.js';
  let content = readFile(filePath);

  if (content.includes('react-dom/client')) {
    console.log('[flow-libs/react-dom.js] Already has react-dom/client declaration.');
    return;
  }

  const declaration = `
// React 18 createRoot API
declare module 'react-dom/client' {
  declare type RootOptions = {
    onRecoverableError?: (error: mixed) => void,
    identifierPrefix?: string,
    ...
  };
  declare type Root = {
    render(children: React$Node): void,
    unmount(): void,
    ...
  };
  declare function createRoot(
    container: Element | Document | DocumentFragment,
    options?: RootOptions
  ): Root;
  declare function hydrateRoot(
    container: Document | Element,
    initialChildren: React$Node,
    options?: RootOptions
  ): Root;
}
`;

  content = content.trimEnd() + '\n' + declaration;
  writeFile(filePath, content);
  console.log('[flow-libs/react-dom.js] Added react-dom/client declaration.');
}

// ──────────────────────────────────────────────────────────────────────────────
// Run all steps
// ──────────────────────────────────────────────────────────────────────────────
console.log('Upgrading newIDE/app to React 18...\n');
updatePackageJson();
updateIndexJs();
updateFlowTypes();
console.log('\nDone. Run `npm install` to apply dependency changes.');
