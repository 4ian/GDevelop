//@flow
import { findGDJS } from '../Export/LocalExporters/LocalGDJSFinder';
import optionalRequire from '../Utils/OptionalRequire';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

export const setupAutocompletions = (monaco: any) => {
  const importAllJsFilesFromFolder = (folderPath: string) =>
    fs.readdir(folderPath, (error: ?Error, filenames: Array<string>) => {
      if (error) {
        console.error(
          'Unable to read GDJS files for setting up autocompletions:',
          error
        );
        return;
      }

      filenames.forEach(filename => {
        if (filename.endsWith('.js')) {
          const fullPath = path.join(folderPath, filename);
          fs.readFile(fullPath, 'utf8', (fileError, content) => {
            if (fileError) {
              console.error(
                `Unable to read ${fullPath} for setting up autocompletions:`,
                fileError
              );
              return;
            }

            monaco.languages.typescript.javascriptDefaults.addExtraLib(
              content,
              fullPath
            );
          });
        }
      });
    });

  findGDJS(gdjsRoot => {
    const runtimePath = path.join(gdjsRoot, 'Runtime');
    importAllJsFilesFromFolder(runtimePath);
    importAllJsFilesFromFolder(path.join(runtimePath, 'events-tools'));

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
/** Represents the scene being played. */
var runtimeScene = new gdjs.RuntimeScene();

/** The objects that are passed to your JavaScript function.
 * @type {gdjs.RuntimeObject[]}
 */
var objects = new gdjs.RuntimeScene();
`,
      'this-mock-the-context-of-events.js'
    );
  });
};
