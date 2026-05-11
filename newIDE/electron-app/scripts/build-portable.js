/**
 * Build a portable (self-contained) zip bundle suitable for CI/headless usage.
 *
 * Sets GD_PORTABLE_BUILD=true so electron-builder-config.js skips
 * code-signing / notarization, then delegates to the regular build.js
 * with `--publish never` and any extra argv flags the caller passed.
 */
const shell = require('shelljs');

process.env.GD_PORTABLE_BUILD = 'true';

const extra = process.argv.slice(2).join(' ');
const cmd = 'node scripts/build.js --publish never' + (extra ? ' ' + extra : '');
const result = shell.exec(cmd);
shell.exit(result.code);
