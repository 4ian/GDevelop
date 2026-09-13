// @flow

export const isRelativePathToDocumentationRoot = (path: string): boolean => {
  return path.startsWith('/');
};

export const isDocumentationAbsoluteUrl = (path: string): boolean => {
  return path.startsWith('http://') || path.startsWith('https://');
};

export const getHelpLink = (path: string, anchor: string = ''): string => {
  if (isRelativePathToDocumentationRoot(path)) {
    // The path can contain an anchor (like `/behaviors/tween#easing-functions`),
    // which must be kept after the query string.
    const [pathWithoutAnchor, anchorInPath] = path.split('#');
    const finalAnchor = anchor || anchorInPath || '';
    return `https://wiki.gdevelop.io/gdevelop5${pathWithoutAnchor}?utm_source=gdevelop&utm_medium=help-link${
      finalAnchor ? `#${finalAnchor}` : ''
    }`;
  }

  if (isDocumentationAbsoluteUrl(path)) return path;

  return '';
};
