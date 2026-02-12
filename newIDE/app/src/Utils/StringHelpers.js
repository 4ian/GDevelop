// @flow

export const shortenString = (str: string, maxLength: number) => {
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

export const toKebabCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .toLowerCase(); // convert to lower case
};
