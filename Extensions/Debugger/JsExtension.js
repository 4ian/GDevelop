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
        'Debugger',
        _('Debugger'),
        _(
          'Adds Interractions possibilities with the debugger'
        ),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      );

      extension
      .addAction(
        'Breakpoint',
        _('Break execution (break point)'),
        _('This pauses the game for inspecting the game state through the debugger at a specific time.'),
        _('Break game execution'),
        _('Debugger'),
        'res/ribbon_default/bug32.png',
        'res/ribbon_default/bug32.png'
      )
      .addCodeOnlyParameter("currentScene", "")
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Debugger/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debugger.break');

      return extension;
    },
    runExtensionSanityTests: function(gd, extension) {
        return [];
    },
}