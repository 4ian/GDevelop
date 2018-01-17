import indexHTML from './GDJSindex.html.js';

const gdjsRoot =
  'https://s3-eu-west-1.amazonaws.com/gdevelop-resources/GDJS-4095';

export const findGDJS = cb => {
  return cb({
    gdjsRoot,
    filesContent: {
      //TODO: Request and read it.
      [gdjsRoot + '/Runtime/index.html']: indexHTML,
    },
  });
};
