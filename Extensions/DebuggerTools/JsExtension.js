/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */
module.exports = {
    createExtension: function(_, gd) {
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
      .setFunctionName('gdjs.evtTools.debugger.pause');

      return extension;
    },
    runExtensionSanityTests: function(gd, extension) {
        return [];
    },
}