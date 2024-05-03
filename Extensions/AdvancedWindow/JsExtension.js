//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />
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

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'AdvancedWindow',
        _('Advanced window management'),
        _(
          'Provides advanced features related to the game window positioning and interaction with the operating system.'
        ),
        'Arthur Pacaud (arthuro555)',
        'MIT'
      )
      .setCategory('User interface');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Advanced window management'))
      .setIcon('res/actions/window24.png');

    extension
      .addAction(
        'Focus',
        _('Window focus'),
        _('Make the window gain or lose focus.'),
        _('Focus the window: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Focus the window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.focus');

    extension
      .addCondition(
        'IsFocused',
        _('Window focused'),
        _('Checks if the window is focused.'),
        _('The window is focused'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isFocused');

    extension
      .addAction(
        'Show',
        _('Window visibility'),
        _('Make the window visible or invisible.'),
        _('Window visible: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Show window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.show');

    extension
      .addCondition(
        'IsVisible',
        _('Window visible'),
        _('Checks if the window is visible.'),
        _('The window is visible'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isVisible');

    extension
      .addAction(
        'Maximize',
        _('Maximize the window'),
        _('Maximize or unmaximize the window.'),
        _('Maximize window: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Maximize window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.maximize');

    extension
      .addCondition(
        'IsMaximized',
        _('Window maximized'),
        _('Checks if the window is maximized.'),
        _('The window is maximized'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isMaximized');

    extension
      .addAction(
        'Minimize',
        _('Minimize the window'),
        _('Minimize or unminimize the window.'),
        _('Minimize window: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Minimize window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.minimize');

    extension
      .addCondition(
        'IsMinimized',
        _('Window minimized'),
        _('Checks if the window is minimized.'),
        _('The window is minimized'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isMinimized');

    extension
      .addAction(
        'EnableWindow',
        _('Enable the window'),
        _('Enables or disables the window.'),
        _('Enable window: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.enable');

    extension
      .addCondition(
        'IsWindowEnabled',
        _('Window enabled'),
        _('Checks if the window is enabled.'),
        _('The window is enabled'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isEnabled');

    extension
      .addAction(
        'SetResizable',
        _('Allow resizing'),
        _('Enables or disables resizing of the window by the user.'),
        _('Enable window resizing: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow resizing?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setResizable');

    extension
      .addCondition(
        'IsResizable',
        _('Window resizable'),
        _('Checks if the window can be resized.'),
        _('The window can be resized'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isResizable');

    extension
      .addAction(
        'SetMovable',
        _('Allow moving'),
        _('Enables or disables moving of the window by the user.'),
        _('Enable window moving: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow moving?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setMovable');

    extension
      .addCondition(
        'IsMovable',
        _('Window movable'),
        _('Checks if the window can be moved.'),
        _('The window can be moved'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isMovable');

    extension
      .addAction(
        'SetMaximizable',
        _('Allow maximizing'),
        _('Enables or disables maximizing of the window by the user.'),
        _('Enable window maximizing: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow maximizing?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setMaximizable');

    extension
      .addCondition(
        'IsMaximizable',
        _('Window maximizable'),
        _('Checks if the window can be maximized.'),
        _('The window can be maximized'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isMaximizable');

    extension
      .addAction(
        'SetMinimizable',
        _('Allow minimizing'),
        _('Enables or disables minimizing of the window by the user.'),
        _('Enable window minimizing: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow minimizing?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setMinimizable');

    extension
      .addCondition(
        'IsMinimizable',
        _('Window minimizable'),
        _('Checks if the window can be minimized.'),
        _('The window can be minimized'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isMinimizable');

    extension
      .addAction(
        'SetFullScreenable',
        _('Allow full-screening'),
        _('Enables or disables full-screening of the window by the user.'),
        _('Enable window full-screening: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow full-screening?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setFullScreenable');

    extension
      .addCondition(
        'IsFullScreenable',
        _('Window full-screenable'),
        _('Checks if the window can be full-screened.'),
        _('The window can be set in fullscreen'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isFullScreenable');

    extension
      .addAction(
        'SetClosable',
        _('Allow closing'),
        _('Enables or disables closing of the window by the user.'),
        _('Enable window closing: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow closing?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setClosable');

    extension
      .addCondition(
        'IsClosable',
        _('Window closable'),
        _('Checks if the window can be closed.'),
        _('The window can be closed'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isClosable');

    const levelChoices = JSON.stringify([
      'normal',
      'floating',
      'torn-off-menu',
      'modal-panel',
      'main-menu',
      'status',
      'pop-up-menu',
      'screen-saver',
    ]);

    extension
      .addAction(
        'SetAlwaysOnTop',
        _('Make the window always on top'),
        _('Puts the window constantly above all other windows.'),
        _('Make window always on top: _PARAM0_, level: _PARAM1_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable always on top?'), '', false)
      .setDefaultValue('true')
      .addParameter('stringWithSelector', _('Level'), levelChoices, false)
      .setDefaultValue('floating')
      .setParameterLongDescription(
        'The level is like a layer in GDevelop but for the OS. ' +
          'The further down the list, the higher it will be. ' +
          'When disabling always on top, the level will be set to normal. ' +
          'From "floating" to "status" included, ' +
          'the window is placed below the Dock on macOS and below the taskbar on Windows. ' +
          'Starting from "pop-up-menu", it is shown above the Dock on macOS and ' +
          'above the taskbar on Windows. ' +
          'This parameter is ignored on linux.'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setAlwaysOnTop');

    extension
      .addCondition(
        'IsAlwaysOnTop',
        _('Window always on top'),
        _('Checks if the window is always on top.'),
        _('The window is always on top'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isAlwaysOnTop');

    extension
      .addAction(
        'SetKiosk',
        _('Enable kiosk mode'),
        _(
          'Puts the window in kiosk mode. This prevents the user from exiting fullscreen.'
        ),
        _('Enable kiosk mode: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable kiosk mode?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setKiosk');

    extension
      .addCondition(
        'IsKiosk',
        _('Kiosk mode'),
        _('Checks if the window is currently in kiosk mode.'),
        _('The window is in kiosk mode'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.isKiosk');

    extension
      .addAction(
        'SetHasShadow',
        _('Enable window shadow'),
        _('Enables or disables the window shadow.'),
        _('Enable window shadow: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable shadow?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setHasShadow');

    extension
      .addCondition(
        'HasShadow',
        _('Shadow enabled'),
        _("Checks if the window currently has it's shadow enabled."),
        _('The window has a shadow'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.hasShadow');

    extension
      .addAction(
        'EnableContentProtection',
        _('Enable content protection'),
        _(
          'Enables or disables the content protection mode. This should prevent screenshots of the game from being taken.'
        ),
        _('Enable content protection: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Enable content protection?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setContentProtection');

    extension
      .addAction(
        'SetFocusable',
        _('Allow focusing'),
        _('Allow or disallow the user to focus the window.'),
        _('Allow to focus the window: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Allow focus?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setFocusable');

    extension
      .addAction(
        'Flash',
        _('Flash the window'),
        _('Make the window flash or end flashing.'),
        _('Make the window flash: _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('yesorno', _('Flash the window?'), '', false)
      .setDefaultValue('true')
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.flash');

    extension
      .addAction(
        'SetOpacity',
        _('Window opacity'),
        _('Changes the window opacity.'),
        _('Set the window opacity to _PARAM0_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('expression', _('New opacity'), '', false)
      .setParameterLongDescription(
        'A number between 0 (fully transparent) and 1 (fully opaque).'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setOpacity');

    extension
      .addAction(
        'SetWindowPosition',
        _('Window position'),
        _('Changes the window position.'),
        _('Set the window position to _PARAM0_;_PARAM1_'),
        _('Windows, Linux, macOS'),
        'res/actions/window24.png',
        'res/actions/window.png'
      )
      .addParameter('expression', _('X position'), '', false)
      .addParameter('expression', _('Y position'), '', false)
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.setPosition');

    extension
      .addExpression(
        'WindowX',
        _('Window X position'),
        _('Returns the current window X position.'),
        _('Windows, Linux, macOS'),
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.getPositionX');

    extension
      .addExpression(
        'WindowY',
        _('Window Y position'),
        _('Returns the current window Y position.'),
        _('Windows, Linux, macOS'),
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.getPositionY');

    extension
      .addExpression(
        'WindowOpacity',
        _('Window opacity'),
        _(
          'Returns the current window opacity (a number from 0 to 1, 1 being fully opaque).'
        ),
        _('Windows, Linux, macOS'),
        'res/actions/window.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile(
        'Extensions/AdvancedWindow/electron-advancedwindowtools.js'
      )
      .setFunctionName('gdjs.evtTools.advancedWindow.getOpacity');

    return extension;
  },
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
