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

/** The instances of objects that are passed to your JavaScript function.
 * @type {gdjs.RuntimeObject[]}
 */
var objects = new gdjs.RuntimeScene();

/**
 * Get the list of instances of the specified object.
 *
 * @callback GetObjectsFunction
 * @param {string} objectName The name of the object for which instances must be returned.
 * @return {gdjs.RuntimeObject[]} Instances of the specified object.
 */

/**
 * Get the Hashtable containing the lists of instances of the specified object.
 *
 * You can alter the list and this will alter the objects picked for the next conditions/actions/events.
 * If you don't need this, prefer using \`getObjects\`.
 *
 * @callback GetObjectsListsFunction
 * @param {string} objectName The name of the object for which instances must be returned.
 * @return {?Hashtable} Hashtable containing the lists of instances (keys are object names in the current context), or \`null\` if not found
 */

/**
 * Create a new object from its name. The object is added to the instances
 * living on the scene.
 *
 * @callback CreateObjectFunction
 * @param {string} objectName The name of the object to be created
 * @return {gdjs.RuntimeObject} The created object
 */

/**
 * Get the "real" behavior name, that can be used with \`getBehavior\`. For example:
 * \`object.getBehavior(eventsFunctionContext.getBehaviorName("MyBehavior"))\`
 *
 * @callback GetBehaviorNameFunction
 * @param {string} behaviorName The name of the behavior, as specified in the parameters of the function.
 * @return {string} The name that can be passed to \`getBehavior\`.
 */

/**
 * Get the value (string or number) of an argument that was passed to the events function.
 * To get objects, use \`getObjects\`.
 *
 * @callback GetArgumentFunction
 * @param {string} argumentName The name of the argument, as specified in the parameters of the function.
 * @return {string|number} The string or number passed for this argument
 */

/** Represents the context of the events function (or the behavior method),
 * if any. If the JS code is running in a scene, this will be undefined (so you can't use this in a scene).
 *
 * @type {?{getObjects: GetObjectsFunction, getObjectsLists: GetObjectsListsFunction, getBehaviorName: GetBehaviorNameFunction, createObject: CreateObjectFunction, getArgument: GetArgumentFunction, returnValue: boolean | number | string}}
 */
var eventsFunctionContext = {};
`,
      'this-mock-the-context-of-events.js'
    );
  });
};
