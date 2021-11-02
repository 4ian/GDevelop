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
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'DebuggerTools',
      _('Debugger Tools'),
      _('Allow to interact with the editor debugger from the game.'),
      'Arthur Pacaud (arthuro555), Aurélien Vivet (Bouh)',
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
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.pause');

    extension
      .addAction(
        'EnableDebugDraw',
        _('Draw collisions hitboxes and points'),
        _(
          'This activates the display of rectangles and information on screen showing the objects bounding boxes (blue), the hitboxes (red) and some points of objects.'
        ),
        _(
          'Enable debugging view of bounding boxes/collision masks: _PARAM1_ (include invisible objects: _PARAM2_, point names: _PARAM3_, custom points: _PARAM4_)'
        ),
        _('Debugger Tools'),
        'res/actions/planicon24.png',
        'res/actions/planicon.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('yesorno', _('Enable debug draw'), '', true)
      .setDefaultValue('yes')
      .addParameter(
        'yesorno',
        _('Show collisions for hidden objects'),
        '',
        true
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Show points names'), '', true)
      .setDefaultValue('yes')
      .addParameter('yesorno', _('Show custom points'), '', true)
      .setDefaultValue('yes')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.enableDebugDraw');

    extension
      .addAction(
        'ConsoleLog',
        _('Log a message to the console'),
        _("Logs a message to the debugger's console."),
        _(
          'Log message _PARAM0_ of type _PARAM1_ to the console in group _PARAM2_'
        ),
        _('Debugger Tools'),
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addParameter('string', 'Message to log', '', false)
      .addParameter(
        'stringWithSelector',
        'Message type',
        '["info", "warning", "error"]',
        true
      )
      .addParameter('string', 'Group of messages', '', true)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.log');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
