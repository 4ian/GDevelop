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

module.exports = {
  createExtension: function (
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension.setExtensionInformation(
      'AdvancedWindow',
      _('Advanced window management'),
      _('Allows advanced control of the game window'),
      'Arthur Pacaud (arthuro555)',
      'MIT'
    );

    extension
      .addAction(
        'Focus',
        _('Change focus of the window'),
        _('Make the window gain or lose focus.'),
        _('Focus the window: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Focus the window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.focus');
    
    extension
      .addCondition(
        'IsFocused',
        _('Window focused'),
        _('Checks if the window is focused.'),
        _('The window is focused'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isFocused');

    extension
      .addAction(
        'Show',
        _('Change visibility of the window'),
        _('Make the window visible or invisible.'),
        _('Window visible: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Show window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.show');
    
    extension
      .addCondition(
        'IsVisible',
        _('Window visibile'),
        _('Checks if the window is visible.'),
        _('The window is visible'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isVisible');

    extension
      .addAction(
        'Maximize',
        _('Maximize the window'),
        _('Maximize or unmaximize the window.'),
        _('Maximize window: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Maximize window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.maximize');
    
    extension
      .addCondition(
        'IsMaximized',
        _('Window maximized'),
        _('Checks if the window is maximized.'),
        _('The window is maximized'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isMaximized');

    extension
      .addAction(
        'Minimize',
        _('Minimize the window'),
        _('Minimize or unminimize the window.'),
        _('Minimize window: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Minimize window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.minimize');
    
    extension
      .addCondition(
        'IsMinimized',
        _('Window minimized'),
        _('Checks if the window is minimized.'),
        _('The window is minimized'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isMinimized');

    extension
      .addAction(
        'EnableWindow',
        _('Enable the window'),
        _('Enables or disables the window.'),
        _('Enable window: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.enable');
    
    extension
      .addCondition(
        'IsWindowEnabled',
        _('Window enabled'),
        _('Checks if the window is enabled.'),
        _('The window is enabled'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isEnabled');

    extension
      .addAction(
        'SetResizable',
        _('Allow resizing'),
        _('Enables or disables resizing of the window by the user.'),
        _('Enable window resizing: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow resizing?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setResizable');
    
    extension
      .addCondition(
        'IsResizable',
        _('Window resizable'),
        _('Checks if the window can be resized.'),
        _('The window can be resized'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isResizable');

    extension
      .addAction(
        'SetMovable',
        _('Allow moving'),
        _('Enables or disables moving of the window by the user.'),
        _('Enable window moving: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow moving?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setMovable');
    
    extension
      .addCondition(
        'IsMovable',
        _('Window movable'),
        _('Checks if the window can be moved.'),
        _('The window can be moved'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isMovable');

    extension
      .addAction(
        'SetMaximizable',
        _('Allow maximizing'),
        _('Enables or disables maximizing of the window by the user.'),
        _('Enable window maximizing: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow maximizing?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setMaximizable');
    
    extension
      .addCondition(
        'IsMaximizable',
        _('Window maximizable'),
        _('Checks if the window can be maximized.'),
        _('The window can be maximized'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isMaximizable');

    extension
      .addAction(
        'SetMinimizable',
        _('Allow mimizing'),
        _('Enables or disables minimizing of the window by the user.'),
        _('Enable window minimizing: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow minimizing?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setMinimizable');
    
    extension
      .addCondition(
        'IsMinimizable',
        _('Window minimizable'),
        _('Checks if the window can be minimized.'),
        _('The window can be minimized'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isMinimizable');

    extension
      .addAction(
        'SetFullScreenable',
        _('Allow full-screening'),
        _('Enables or disables full-screening of the window by the user.'),
        _('Enable window full-screening: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow full-screening?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setFullScreenable');
    
    extension
      .addCondition(
        'IsFullScreenable',
        _('Window full-screenable'),
        _('Checks if the window can be full-screened.'),
        _('The window can be full-screened'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isFullScreenable');

    extension
      .addAction(
        'SetClosable',
        _('Allow closing'),
        _('Enables or disables closing of the window by the user.'),
        _('Enable window closing: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow closing?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setClosable');
    
    extension
      .addCondition(
        'IsClosable',
        _('Window closable'),
        _('Checks if the window can be closed.'),
        _('The window can be closed'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isClosable');

    const levelChoices = JSON.stringify([
      "normal",
      "floating",
      "torn-off-menu",
      "modal-panel",
      "main-menu",
      "status",
      "pop-up-menu",
      "screen-saver"
    ]);

    extension
      .addAction(
        'SetAlwaysOnTop',
        _('Make the windows always on top'),
        _('Puts the window constantly above all other windows.'),
        _('Make window always on top: _PARAM0_, level: _PARAM1_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable always on top?'), '', false)
      .setDefaultValue('true')
      .addParameter("stringWithSelector", _("Level"), levelChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setAlwaysOnTop');
    
    extension
      .addCondition(
        'IsAlwaysOnTop',
        _('Window always on top'),
        _('Checks if the window is always on top.'),
        _('The window is always on top'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isAlwaysOnTop');

    extension
      .addAction(
        'SetKiosk',
        _('Enable kiosk mode'),
        _('Puts the window in kiosk mode.'),
        _('Enable kiosk mode: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable kiosk mode?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setKiosk');
    
    extension
      .addCondition(
        'IsKiosk',
        _('Kiosk mode'),
        _('Checks if the window is currently in kiosk mode.'),
        _('The window is in kiosk mode'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.isKiosk');

    extension
      .addAction(
        'SetHasShadow',
        _('Enable window shadow'),
        _('Enables or disables the window shadow.'),
        _('Enable window shadow: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable shadow?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setHasShadow');
    
    extension
      .addCondition(
        'HasShadow',
        _('Shadow enabled'),
        _('Checks if the window currently has it\'s shadow enabled.'),
        _('The window has a shadow'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.hasShadow');
    
    extension
      .addAction(
        'EnableContentProtection',
        _('Enable content protection'),
        _(
          'Enables or disables the content protection mode.' + 
          'This should prevent screenshots of the game from being taken.'
        ),
        _('Enable content protection: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable content protection?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setContentProtection');

    extension
      .addAction(
        'SetFocusable',
        _('Allow focusing'),
        _('Allow or disallow the user to focus the window.'),
        _('Allow window focus: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow focus?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setFocusable');

    extension
      .addAction(
        'Flash',
        _('Flash the window'),
        _('Make the window flash or end flashing.'),
        _('Make the window flash: _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Flash the window?'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.flash');

    extension
      .addAction(
        'SetOpacity',
        _('Set window opacity'),
        _('Changes the window opacity. The new opacity should be between 0 and 1.'),
        _('Set the window opacity to _PARAM0_'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('number', _('New opacity'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setOpacity');

    extension
      .addAction(
        'Center',
        _('Center window'),
        _('Centers the current window.'),
        _('Center window'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.center');

    extension
      .addAction(
        'SetWindowPosition',
        _('Set window position'),
        _('Changes the window position.'),
        _('Set the window position to _PARAM0_X and _PARAM0_Y'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('number', _('X position'), '', false)
      .addParameter('number', _('Y position'), '', false)
      .setDefaultValue('true')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.setPosition');

    extension
      .addExpression(
        'WindowX',
        _('Window X position'),
        _('Returns the current window X position.'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.getPositionX');

    extension
      .addExpression(
        'WindowY',
        _('Window Y position'),
        _('Returns the current window Y position.'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.getPositionY');
    
    extension
      .addExpression(
        'WindowOpacity',
        _('Window opacity'),
        _('Returns the current window opacity (a number from 0 to 1).'),
        _('Advanced window tools/Windows, Linux, MacOS'),
        'res/actions/window.png'
      )
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/Electron/electron-advancedwindowtools.js')
      .setFunctionName('gdjs.evtTools.electron.getOpacity');

    return extension;
  },
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
