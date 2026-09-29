// @ts-check

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const AdmZip = require('adm-zip');
const puppeteer = require('puppeteer');
const { downloadFile, formatBytes } = require('./Download');

const electronAppPackageJson = require('../../electron-app/app/package.json');

const EXAMPLES_REPOSITORY =
  'https://github.com/GDevelopApp/GDevelop-examples.git';
const EXAMPLES_BRANCH = 'main';

const wait = durationInMs =>
  new Promise(resolve => setTimeout(resolve, durationInMs));

/**
 * Find the Electron executable of an extracted portable build (named after the
 * `name` field of the package.json by electron-builder).
 */
const findExecutable = root => {
  const candidates = ['gdevelop', 'GDevelop'];
  const stack = [root];
  while (stack.length) {
    const directory = stack.pop();
    if (!directory) continue;
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && candidates.includes(entry.name))
        return fullPath;
    }
  }
  return null;
};

/**
 * The version built by a branch: the one of its electron-app package.json,
 * when the branch is known to git - the version of this checkout otherwise.
 * Downloading the build of another branch (the tests of a branch run against
 * the latest build of `master`) must use the version of that branch: this
 * checkout may have bumped it, to a version not uploaded anywhere yet.
 */
const getVersionOfBranch = branch => {
  const result = spawnSync(
    'git',
    ['show', `origin/${branch}:newIDE/electron-app/app/package.json`],
    { cwd: path.resolve(__dirname, '..', '..', '..'), encoding: 'utf8' }
  );
  try {
    return JSON.parse(result.stdout).version;
  } catch (error) {
    return electronAppPackageJson.version;
  }
};

/**
 * Get the portable Linux build to test: either a local zip (the one a
 * build-linux job just produced) or the latest one uploaded to S3.
 */
const getPortableBuild = async ({ zipPath, branch, workDirectory, log }) => {
  const version = zipPath
    ? electronAppPackageJson.version
    : getVersionOfBranch(branch);
  fs.mkdirSync(workDirectory, { recursive: true });

  let portableZipPath = zipPath;
  if (portableZipPath) {
    if (!fs.existsSync(portableZipPath))
      throw new Error(`The given zip does not exist: ${portableZipPath}`);
    log(`Using the local portable build ${portableZipPath}.`);
  } else {
    const zipName = `gdevelop-${version}.zip`;
    const url = `https://gdevelop-releases.s3.amazonaws.com/${branch}/latest/${zipName}`;
    portableZipPath = path.join(workDirectory, zipName);
    if (fs.existsSync(portableZipPath)) {
      log(`Using the already downloaded ${portableZipPath}.`);
    } else {
      log(`Downloading ${url}...`);
      await downloadFile(url, portableZipPath);
      log(
        `Downloaded ${zipName} (${formatBytes(
          fs.statSync(portableZipPath).size
        )}).`
      );
    }
  }

  const extractedDirectory = path.join(workDirectory, `gdevelop-${version}`);
  if (!findExecutable(extractedDirectory)) {
    log(`Extracting the portable build to ${extractedDirectory}...`);
    fs.mkdirSync(extractedDirectory, { recursive: true });
    new AdmZip(portableZipPath).extractAllTo(extractedDirectory, true);
  }

  const binaryPath = findExecutable(extractedDirectory);
  if (!binaryPath)
    throw new Error(
      `No GDevelop executable found in ${extractedDirectory}. Contents: ` +
        fs.readdirSync(extractedDirectory).join(', ')
    );
  fs.chmodSync(binaryPath, 0o755);
  log(`GDevelop ${version}: ${binaryPath}`);
  return { binaryPath, version };
};

/**
 * Sparse-clone one example of the GDevelop-examples repository (the whole
 * repository is far too big) and return the path of its project file.
 */
const getExampleProject = ({ slug, workDirectory, log }) => {
  const exampleParentDirectory = path.join(workDirectory, 'examples', slug);
  const projectPath = path.join(
    exampleParentDirectory,
    'examples',
    slug,
    `${slug}.json`
  );
  if (fs.existsSync(projectPath)) {
    log(`Using the already cloned example ${slug}.`);
    return projectPath;
  }

  log(`Cloning the example "${slug}" from GDevelop-examples...`);
  fs.mkdirSync(exampleParentDirectory, { recursive: true });
  const run = command => {
    const result = spawnSync(command[0], command.slice(1), {
      cwd: exampleParentDirectory,
      stdio: 'inherit',
    });
    if (result.status !== 0)
      throw new Error(`Command failed: ${command.join(' ')}`);
  };
  run(['git', 'init', '-q']);
  run(['git', 'remote', 'add', 'origin', EXAMPLES_REPOSITORY]);
  run(['git', 'sparse-checkout', 'init', '--cone']);
  run(['git', 'sparse-checkout', 'set', `examples/${slug}`]);
  run(['git', 'fetch', '--depth=1', 'origin', EXAMPLES_BRANCH]);
  run(['git', 'checkout', '-q', 'FETCH_HEAD']);

  if (!fs.existsSync(projectPath))
    throw new Error(`No project file at ${projectPath} after the clone.`);
  return projectPath;
};

/**
 * Start the real editor on a project and connect to its window, so that it can
 * be driven exactly like a page of the Storybook.
 */
const launchEditor = async ({
  binaryPath,
  projectPath,
  debuggingPort,
  log,
}) => {
  const userDataDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'gdevelop-visual-tests-')
  );
  const args = [
    '--no-sandbox',
    '--disable-update-check',
    '--disable-gpu',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${userDataDirectory}`,
  ];
  if (projectPath) args.push(projectPath);

  log(`Starting the editor: ${path.basename(binaryPath)} ${args.join(' ')}`);
  const child = spawn(binaryPath, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });
  const output = [];
  const collect = data => {
    output.push(data.toString());
    if (output.length > 200) output.shift();
  };
  if (child.stdout) child.stdout.on('data', collect);
  if (child.stderr) child.stderr.on('data', collect);

  let browser = null;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 120000) {
    if (child.exitCode !== null)
      throw new Error(
        `The editor exited with ${child.exitCode}:\n${output.join('')}`
      );
    try {
      browser = await puppeteer.connect({
        browserURL: `http://127.0.0.1:${debuggingPort}`,
        defaultViewport: null,
      });
      break;
    } catch (error) {
      await wait(1000);
    }
  }
  if (!browser)
    throw new Error(
      `Could not connect to the editor on port ${debuggingPort}:\n` +
        output.join('')
    );

  // Find the window of the editor itself (there can be other targets).
  let page = null;
  const foundAt = Date.now();
  while (Date.now() - foundAt < 60000) {
    const pages = await browser.pages();
    page = pages.find(onePage => !onePage.url().startsWith('devtools://'));
    if (page) break;
    await wait(500);
  }
  if (!page) throw new Error('No page found in the editor.');
  log(`Connected to the editor window (${page.url()}).`);

  // Without a window manager (like on the CI), the window stays at its small
  // default size: give the editor the same room as the Storybook tests.
  await page.setViewport({ width: 1500, height: 1000 });

  const stop = async () => {
    try {
      await browser.disconnect();
    } catch (error) {
      // Ignore: the editor may already be gone.
    }
    child.kill('SIGKILL');
  };

  return { browser, page, stop, getOutput: () => output.join('') };
};

module.exports = {
  getPortableBuild,
  getExampleProject,
  launchEditor,
  findExecutable,
};
