throw new Error(
  'This is a fake @blueprintjs/core (or @blueprintjs/icons) package that is just throwing an' +
    " error. It's used by react-mosaic, which will fallback to using something else." +
    'This is useful for avoiding webpack/create-react-app warnings in the development' +
    'console about a missing package - while avoiding to import blueprint.'
);
