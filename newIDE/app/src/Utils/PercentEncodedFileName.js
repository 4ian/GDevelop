// @flow

// Characters that would make a decoded file name unsafe to use as a file
// stored on disk (or that would not "round-trip" when the file is requested
// as a URL by the game engine, like "#", "?" or "%").
// eslint-disable-next-line no-control-regex
const unsafeDecodedCharacters = /[/\\?#%*:"<>|]|[\x00-\x1f]/;

/**
 * Decode a percent-encoded file name, as extracted from a URL (like
 * "Green%20Button.png", becoming "Green Button.png").
 *
 * This is notably necessary for files bundled in a mobile app:
 * the WebView asset loader percent-decodes the requested URL path before looking up
 * the file - so a file literally stored with "%20" in its name would never be found.
 * Decoded file names, on the contrary, work everywhere (web hosting, Android, iOS,
 * desktop), because the game engine requests them percent-encoded and the server
 * or asset loader decodes them back to the stored name.
 *
 * If the decoded name contains characters that are risky for a file name or
 * a URL (like "#", "?", "%" or path separators), the original name is kept.
 */
export const decodePercentEncodedFileName = (fileName: string): string => {
  let decodedFileName;
  try {
    decodedFileName = decodeURIComponent(fileName);
  } catch (error) {
    // Not a valid percent-encoded name (like a lone "%") - keep it as is.
    return fileName;
  }

  if (unsafeDecodedCharacters.test(decodedFileName)) {
    return fileName;
  }

  return decodedFileName;
};
