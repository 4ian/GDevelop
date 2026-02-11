// @flow

export const isRelativePathToDocumentationRoot = (path: string) => {
  return path.startsWith('/');
};

export const isDocumentationAbsoluteUrl = (path: string) => {
  return path.startsWith('http://') || path.startsWith('https://');
};

export const getHelpLink = (path: string, anchor: string = ''): string => {
  if (isRelativePathToDocumentationRoot(path))
    return `https://wiki.gdevelop.io/gdevelop5${path}?utm_source=gdevelop&utm_medium=help-link${
      anchor ? `#${anchor}` : ''
    }`;

  if (isDocumentationAbsoluteUrl(path)) return path;

  return '';
};
