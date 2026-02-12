// @flow

const illegalRe = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
const windowsTrailingRe = /[. ]+$/;
const urlReservedRe = /[&$+/=?@#]/g; // We still allow comma, colon and semi-colon.
const urlUnsafeRe = /[|^%]/g;

const replacement = '_';

// Adapt from https://github.com/parshap/node-sanitize-filename.
export function sanitizeFilename(input: string) {
  return input
    .replace(illegalRe, replacement)
    .replace(urlReservedRe, replacement)
    .replace(urlUnsafeRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement)
    .replace(windowsTrailingRe, replacement);
}
