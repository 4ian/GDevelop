// @ts-check

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const serveHandler = require('serve-handler');

const newIdeAppDirectory = path.resolve(__dirname, '..', '..', 'app');
const defaultBuildDirectory = path.join(newIdeAppDirectory, 'build-storybook');

const runCommand = (command, args, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} ${args.join(' ')} exited with ${code}`))
    );
  });

/**
 * Serve a Storybook to run the tests against: either an already running one
 * (`--storybook-url`), or the static build - built if it is not there yet.
 */
const startStorybook = async ({ storybookUrl, port, rebuild, log }) => {
  if (storybookUrl) {
    log(`Using the Storybook already running on ${storybookUrl}.`);
    return { url: storybookUrl, stop: async () => {} };
  }

  const buildDirectory = defaultBuildDirectory;
  if (rebuild || !fs.existsSync(path.join(buildDirectory, 'iframe.html'))) {
    log('Building Storybook (this takes a few minutes)...');
    await runCommand('npm', ['run', 'build-storybook'], newIdeAppDirectory);
  } else {
    log(`Using the Storybook already built in ${buildDirectory}.`);
  }

  const server = http.createServer((request, response) =>
    serveHandler(request, response, {
      public: buildDirectory,
      etag: true,
      // Without this, `/iframe.html?id=...` is redirected to `/iframe` and the
      // story to show is lost on the way.
      cleanUrls: false,
    })
  );
  await new Promise(resolve => server.listen(port, resolve));
  const url = `http://localhost:${port}`;
  log(`Storybook served on ${url}.`);

  return {
    url,
    stop: () => new Promise(resolve => server.close(() => resolve())),
  };
};

module.exports = { startStorybook, defaultBuildDirectory };
