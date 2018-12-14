// @flow

export const shortenString = (str: string, maxLength: number) => {
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

export const makeNonBreakable = (str: string) => {
  return str.replace(/\s/g, '\xa0'); // Non-breakable space is char 0xa0 (160 dec)
};
