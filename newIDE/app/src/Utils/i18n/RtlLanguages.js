// @flow

const rtlLanguages = new Set([
  // Hebrew scripts:
  'he_IL' /* Hebrew */,

  // Arabic scripts:
  'ar_SA' /* Arabic */,
  'az_AZ' /* Azerbaijani */,
  'ms_MY' /* Malay */,
  'fa_IR' /* Persian */,
  'ur_PK' /* Urdu */,
]);

export function isLtr(name: string): boolean {
  return !rtlLanguages.has(name);
}

// TODO: Implement full support of RTL languages by adding dir="ltr"
// to the `body` element. Doing so will revert most layouts in the app,
// which is fine. There are a few things to take care of:
// - ImagePreview (already fixed),
// - TextFieldWithButtonLayout (margins on the button),
// - ColorField (margins/positioning off the button),
// - EditorMosaic (i.e: react-mosaic) has issues with the positioning of the resize handles,
// - and anything else using absolute positioning.
