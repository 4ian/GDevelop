//@flow
import { findGDJS } from '../GameEngineFinder/LocalGDJSFinder';
import optionalRequire from '../Utils/OptionalRequire';
const fs = optionalRequire('fs');
const path = optionalRequire('path');

// TODO: Replace the reading into files by an automatic generation of a .d.ts
// using TypeScript from the game engine sources, and have a script integrate the .d.ts
// into newIDE sources
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
        if (filename.endsWith('.js') || filename.endsWith('.ts')) {
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

  findGDJS().then(({ gdjsRoot }) => {
    const runtimePath = path.join(gdjsRoot, 'Runtime');
    const runtimeTypesPath = path.join(gdjsRoot, 'Runtime', 'types');
    const runtimeLibsPath = path.join(gdjsRoot, 'Runtime', 'libs');
    const runtimePixiRenderersPath = path.join(
      gdjsRoot,
      'Runtime',
      'pixi-renderers'
    );
    const runtimeCocosRenderersPath = path.join(
      gdjsRoot,
      'Runtime',
      'cocos-renderers'
    );
    const runtimeHowlerSoundManagerPath = path.join(
      gdjsRoot,
      'Runtime',
      'howler-sound-manager'
    );
    const runtimeCocosSoundManagerPath = path.join(
      gdjsRoot,
      'Runtime',
      'cocos-sound-manager'
    );
    const runtimeFontfaceobserverFontManagerPath = path.join(
      gdjsRoot,
      'Runtime',
      'fontfaceobserver-font-manager'
    );
    const extensionsPath = path.join(runtimePath, 'Extensions');
    const eventToolsPath = path.join(runtimePath, 'events-tools');

    importAllJsFilesFromFolder(runtimePath);
    importAllJsFilesFromFolder(runtimeTypesPath);
    importAllJsFilesFromFolder(runtimeLibsPath);
    importAllJsFilesFromFolder(runtimePixiRenderersPath);
    importAllJsFilesFromFolder(runtimeCocosRenderersPath);
    importAllJsFilesFromFolder(runtimeHowlerSoundManagerPath);
    importAllJsFilesFromFolder(runtimeCocosSoundManagerPath);
    importAllJsFilesFromFolder(runtimeFontfaceobserverFontManagerPath);
    importAllJsFilesFromFolder(eventToolsPath);
    fs.readdir(extensionsPath, (error: ?Error, folderNames: Array<string>) => {
      if (error) {
        console.error(
          'Unable to read Extensions folders for setting up autocompletions:',
          error
        );
        return;
      }

      folderNames
        .filter(
          folderName =>
            !folderName.endsWith('.txt') &&
            !folderName.endsWith('.md') &&
            !folderName.endsWith('.gitignore')
        )
        .forEach(folderName =>
          importAllJsFilesFromFolder(path.join(extensionsPath, folderName))
        );
    });

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
/** Represents the scene being played. */
var runtimeScene = new gdjs.RuntimeScene();

/**
 * The instances of objects that are passed to your JavaScript function.
 * @type {gdjs.RuntimeObject[]}
 */
var objects = [];

/**
 * @type {EventsFunctionContext}
 */
var eventsFunctionContext = {};
`,
      'this-mock-the-context-of-events.js'
    );
  });
};
