// Portable zip build for CI — skips code-signing/notarization.
const shell = require('shelljs');

process.env.GD_PORTABLE_BUILD = 'true';

const extra = process.argv.slice(2).join(' ');
const cmd = 'node scripts/build.js --publish never' + (extra ? ' ' + extra : '');
const result = shell.exec(cmd);
shell.exit(result.code);
