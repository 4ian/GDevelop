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
        'DebuggerTools',
        _('Debugger Tools'),
        _(
          'Allow to interact with the editor debugger from the game (notably: enable 2D debug draw, log a message in the debugger console).'
        ),
        'Arthur Pacaud (arthuro555), Aurélien Vivet (Bouh)',
        'MIT'
      )
      .setShortDescription(
        'Enable 2D debug draw, log messages to debugger console, pause execution.'
      )
      .setCategory('Advanced');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Debugger Tools'))
      .setIcon('res/actions/bug32.png');

    extension
      .addAction(
        'Pause',
        _('Pause game execution (breakpoint)'),
        _(
          'This pauses the game, like a breakpoint: useful for inspecting the game state through the debugger. ' +
            'Any recording in progress is stopped, so that the debugger shows the game as it is at this moment. ' +
            'Note that events will be still executed until the end before the game is paused.'
        ),
        _('Pause game execution (breakpoint)'),
        '',
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.pause');

    extension
      .addAction(
        'StartProfiling',
        _('Start recording the game'),
        _(
          'This starts recording the game, like the "Record" button of the debugger: the frames, ' +
            'the performance and the resources are measured from now on. Useful to record exactly ' +
            'what happens at a given moment, instead of trying to click the button at the right time.'
        ),
        _(
          'Start recording the game (for the debugger), named _PARAM1_ (duration: _PARAM2_ seconds, measure rendering: _PARAM3_, if already recording: _PARAM4_)'
        ),
        '',
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Name of the recording'), '', true)
      .setParameterLongDescription(
        _('Shown in the debugger, to find this recording.')
      )
      .addParameter('expression', _('Duration (in seconds)'), '', true)
      .setParameterLongDescription(
        _(
          'The recording stops by itself after this duration. 0 to record until "Stop recording the game" (or the maximum duration of 5 minutes).'
        )
      )
      .setDefaultValue('0')
      .addParameter(
        'yesorno',
        _('Measure the rendering (draw calls and effects)'),
        '',
        true
      )
      .setParameterLongDescription(
        _(
          'Measuring the draw calls and the effects of layers costs the game a bit of time. Disable it to measure only the events and the engine as precisely as possible.'
        )
      )
      .setDefaultValue('yes')
      .addParameter(
        'stringWithSelector',
        _('If a recording is already in progress'),
        '["Keep", "Restart"]',
        true
      )
      .setParameterLongDescription(
        _(
          '"Keep" leaves the recording in progress as it is. "Restart" stops it and starts a new one with these options.'
        )
      )
      .setDefaultValue('"Keep"')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.startProfiling');

    extension
      .addAction(
        'StopProfiling',
        _('Stop recording the game'),
        _(
          'This stops the recording started with "Start recording the game": what was measured ' +
            'stays displayed in the debugger.'
        ),
        _('Stop recording the game (for the debugger)'),
        '',
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.stopProfiling');

    extension
      .addAction(
        'AddProfilingMarker',
        _('Add a marker to the recording'),
        _(
          'This marks the current moment of the recording with a text, shown as a line on the timelines of the debugger: ' +
            'useful to find when something happened (an enemy wave, a level loaded...). Does nothing when the game is not recorded.'
        ),
        _('Add marker _PARAM1_ to the recording'),
        '',
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('string', _('Text of the marker'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.addProfilingMarker');

    extension
      .addCondition(
        'IsProfiling',
        _('Game is being recorded'),
        _(
          'Check if the game is being recorded for the debugger (with the "Record" button or the "Start recording the game" action).'
        ),
        _('Game is being recorded'),
        '',
        'res/actions/bug32.png',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.isProfiling');

    extension
      .addExpression(
        'ProfilingDuration',
        _('Duration of the recording'),
        _(
          'The duration of the recording in progress, in seconds (0 when the game is not recorded).'
        ),
        '',
        'res/actions/bug32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/DebuggerTools/debuggertools.js')
      .setFunctionName('gdjs.evtTools.debuggerTools.getProfilingDuration');

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
        '',
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
        '',
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
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
