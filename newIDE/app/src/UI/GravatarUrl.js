// @flow
import md5 from 'blueimp-md5';

export const getGravatarUrl = (
  email: string,
  { size }: { size: number } = { size: 40 }
): string => {
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=retro`;
};
