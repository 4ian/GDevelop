// @flow
/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Changes in this file are watched and automatically imported if the editor
 * is running. You can also manually run `node import-GDJS-Runtime.js` (in newIDE/app/scripts).
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

/*::
// Import types to allow Flow to do static type checking on this file.
// Extensions declaration are typed using Flow (like the editor), but the files
// for the game engine are checked with TypeScript annotations.
import { type ObjectsRenderingService, type ObjectsEditorService } from '../JsExtensionTypes.flow.js'
*/

module.exports = {
    createExtension: function(_/*: (string) => string */, gd/*: libGDevelop */) {
      const extension = new gd.PlatformExtension();
      extension.setExtensionInformation(
        'DebuggerTools',
        _('Debugger Tools'),
        _(
          'Allow to interact with the editor debugger from the game.'
        ),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      );

      extension
      .addAction(
        'Pause',
        _('Pause game execution'),
        _(
          'This pauses the game, useful for inspecting the game state through the debugger. ' +
          'Note that events will be still executed until the end before the game is paused.'
        ),
        _('Pause game execution'),
        _('Debugger Tools'),
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter("currentScene", "")
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.pause');

      return extension;
    },
    runExtensionSanityTests: function(gd /*: libGDevelop */, extension /*: gdPlatformExtension*/) {
        return [];
    },
}
