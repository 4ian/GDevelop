const parseArgs = require('minimist');
const {
  normalizeFileIdentifier,
  readOpenProjectFileIdentifiers,
  getWindowFileIdentifier,
} = require('./OpenProjectsRegistry');

const argsParserOptions = {
  boolean: ['dev-tools', 'disable-update-check', 'keep-open'],
  string: ['_', 'run-command', 'cmd-args'],
};

// Drop switches Chromium may inject into argv (e.g. --allow-file-access-from-files)
// so they can't steal the value of our own -- flags during parsing.
const knownCliFlagNames = new Set(
  [...argsParserOptions.boolean, ...argsParserOptions.string].filter(
    name => name !== '_'
  )
);
const parseGDevelopArgs = argv =>
  parseArgs(
    argv.filter(
      arg =>
        !arg.startsWith('--') ||
        knownCliFlagNames.has(arg.slice(2).split('=')[0])
    ),
    argsParserOptions
  );

// Electron reorders commandLine (switches first, values last) before forwarding
// to 'second-instance', breaking flag-to-value pairing on reparse. Prefer
// additionalData.args (parsed by the second instance itself) instead.
const parseSecondInstanceArgs = ({ commandLine, additionalData, isDev }) =>
  additionalData && additionalData.args
    ? additionalData.args
    // In dev, electron is launched with an extra argument, so skip one more.
    : parseGDevelopArgs(commandLine.slice(isDev ? 2 : 1));

const isCliProjectAlreadyOpenElsewhere = parsedArgs => {
  const fileIdentifier = normalizeFileIdentifier(parsedArgs._[0]);
  return (
    !!fileIdentifier &&
    readOpenProjectFileIdentifiers().includes(fileIdentifier)
  );
};

// Redirects the command to an already open editor instead of spawning a new window.
const routeCliCommandToLiveEditor = ({ parsedArgs, mainWindows }) => {
  const commandName = parsedArgs['run-command'];
  if (!commandName) return false;

  const fileIdentifier = normalizeFileIdentifier(parsedArgs._[0]);
  const targetWindow = Array.from(mainWindows).find(
    window => getWindowFileIdentifier(window.id) === fileIdentifier
  );
  if (!targetWindow) return false;

  targetWindow.webContents.send('run-cli-command', {
    commandName,
    commandArgs: parsedArgs['cmd-args'],
    fileIdentifier,
  });
  targetWindow.focus();
  return true;
};

module.exports = {
  argsParserOptions,
  parseGDevelopArgs,
  parseSecondInstanceArgs,
  isCliProjectAlreadyOpenElsewhere,
  routeCliCommandToLiveEditor,
};
