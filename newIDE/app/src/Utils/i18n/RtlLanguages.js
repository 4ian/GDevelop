// @flow

const rtlLanguages = new Set([
  /******* Hebrew scripts *******/
  'he_IL'/* Hebrew */,
  
  /******* Arabic scripts *******/
  'ar_SA'/* Arabic */,
  'az_AZ'/* Azerbaijani */,
  'ms_MY'/* Malay */,
  'fa_IR'/* Persian */,
  'ur_PK'/* Urdu */,
]);

export function isLtr(name: string) {
  return !rtlLanguages.has(name);
}

