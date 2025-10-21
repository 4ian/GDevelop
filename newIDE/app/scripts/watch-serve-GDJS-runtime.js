#!/usr/bin/env node
// @ts-check

/*
 * This script watches GDJS Runtime and Extensions files for changes
 * and automatically runs import-GDJS-Runtime.js when changes are detected.
 *
 * Usage: node watch-GDJS-runtime.js
 * Stop with Ctrl+C
 */

const chokidar = require('chokidar');
const debounce = require('lodash.debounce');
const child_process = require('child_process');
const path = require('path');
const handler = require('serve-handler');
const http = require('http');

const PORT = 5002;

const gdevelopRootPath = path.join(__dirname, '..', '..', '..');
const gdjsRootPath = path.join(__dirname, '..', 'resources', 'GDJS');

// Serve the built files for GDJS.
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: gdjsRootPath,
    cleanUrls: false,
    headers: [
      {
        source: '**/*',
        headers: [
          // Tell the browser not to cache the files:
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
          // Allow CORS because the web-app is served from a different origin:
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Private-Network',
            value: 'true',
          },
        ],
      },
    ],
  });
});

/**
 * Launch the import-GDJS-Runtime script.
 * Cleaning the GDJS output folder and copying sources are both
 * skipped to speed up the build.
 * @returns {Promise<void>}
 */
const importGDJSRuntime = () => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const scriptPath = path.join(__dirname, 'import-GDJS-Runtime.js');

    console.log('🔄 Running import-GDJS-Runtime.js...');

    child_process.exec(
      `node "${scriptPath}" --skip-clean --skip-sources`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ GDJS Runtime update error: ${error.message}`);
          reject(error);
          return;
        }

        if (stdout) {
          console.log(stdout);
        }

        if (stderr) {
          console.error(`⚠️  GDJS Runtime update warnings: ${stderr}`);
        }

        const duration = (performance.now() - startTime).toFixed(0);
        console.log(`✅ GDJS Runtime updated in ${duration}ms.`);

        resolve();
      }
    );
  });
};

/**
 * Callback for file changes, debounced to avoid running too frequently
 */
const onWatchEvent = debounce(
  (event, filePath) => {
    const eventName = event || 'unknown-event';
    const resolvedFilename =
      path.relative(gdevelopRootPath, filePath) || 'unknown-file';

    console.log(
      `📁 Detected "${eventName}" in ${resolvedFilename}, updating GDJS Runtime...`
    );

    importGDJSRuntime().catch(error => {
      console.error('❌ Failed to update GDJS Runtime:', error.message);
    });
  },
  100 // Avoid running the script too much in case multiple changes are fired at the same time
);

/**
 * Set up file watchers for GDJS and Extensions sources
 */
const setupWatcher = () => {
  const watchPaths = [
    path.join(gdevelopRootPath, 'GDJS', 'Runtime'),
    path.join(gdevelopRootPath, 'Extensions'),
  ];

  const watcher = chokidar.watch(watchPaths, {
    ignored: (filePath, stats) => {
      if (!stats) return false;
      if (!stats.isFile()) return false;

      const ignoredExtensions = [
        '.d.ts',
        '.map',
        '.md',
        '.png',
        '.svg',
        '.svgz',
        '.txt',
        '.DS_Store',
        '.prettierrc',
      ];
      const ignoredFolderNames = ['tests', 'example', 'diagrams'];

      if (ignoredExtensions.some(ext => filePath.endsWith(ext))) return true;
      if (
        ignoredFolderNames.some(
          folder =>
            filePath.includes(folder + '/') || filePath.includes(folder + '\\')
        )
      )
        return true;

      // Uncomment to log all watched files:
      // console.log('Watched file path: ' + filePath);
      return false;
    },
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
    ignoreInitial: true,
  });

  // Set up event handlers:
  const startTime = performance.now();
  watcher
    .on('all', onWatchEvent)
    .on('error', error => {
      console.error(
        '❌ GDJS watcher error. Please try to relaunch it. Full error is:',
        error
      );
    })
    .on('ready', () => {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`✅ GDJS watcher ready in ${duration}ms.`);
      console.log(
        `ℹ️ Watching GDJS engine files for changes in:\n${watchPaths
          .map(path => `- ${path}`)
          .join('\n')}.`
      );
    });
  return watcher;
};

const watcher = setupWatcher();

// Handle graceful shutdown:
const shutdown = () => {
  console.log('\nℹ️ Shutting GDJS Runtime file watcher and server...');

  server.close(() => {
    console.log('✅ GDJS Runtime server closed.');
  });

  watcher
    .close()
    .then(() => {
      console.log('✅ GDJS Runtime watcher closed.');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error closing GDJS Runtime watcher:', error);
      process.exit(1);
    });
};

// Handle Ctrl+C and other termination signals.
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

// Start the server (used to serve the game engine to the web-app).
server.on('error', error => {
  // @ts-ignore
  if (error.code === 'EADDRINUSE') {
    console.error(
      `❌ Error: Port ${PORT} is already in use and can't be used to serve the game engine to the web-app.`
    );
  }
  // @ts-ignore
  else if (error.code === 'EACCES') {
    console.error(
      `❌ Error: Permission denied to bind to port ${PORT} and can't be used to serve the game engine to the web-app.`
    );
  } else {
    console.error('❌ Game engine server error:', error);
  }
  process.exit(1);
});
server.listen(PORT, () => {
  console.log(
    `ℹ️ GDJS Runtime served for the web-app at http://localhost:${PORT}.`
  );
});
