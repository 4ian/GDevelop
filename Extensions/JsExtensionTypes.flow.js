// @flow

/**
 * @file This file contains the (Flow) types that are used in the JavaScript
 * extensions declaration (i.e: JsExtension.js files).
 * Extension runtime files are in TypeScript (ts files) and not using Flow.
 *
 * If you do changes here, run `node import-GDJS-Runtime.js` (in newIDE/app/scripts),
 * and be sure that the types declared here are reflecting the types exposed by the editor.
 *
 * Note that Flow comments are used to avoid having to preprocess this file and the
 * JsExtension.js files through Babel. This allows to keep plain JS files, while allowing
 * Flow static type checking to be run on them when integrated in the editor.
 */

/*::
export type ObjectsRenderingService = {
  gd: libGDevelop,
  PIXI: any,
  RenderedInstance: any,
  registerInstanceRenderer: (objectType: string, renderer: any) => void,
  requireModule: (dirname: string, moduleName: string) => any,
  getThumbnail: (project: gdProject, object: gdObject) => string,
};
export type ObjectsEditorService = {
  registerEditorConfiguration: (objectType: string, editorConfiguration: any) => void,
  getDefaultObjectJsImplementationPropertiesEditor: ({| helpPagePath: string |}) => any,
};
*/
