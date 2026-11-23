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
        'AnimationStateMachine',
        _('Animation State Machine'),
        _(
          'Drive the animations of an object with a state machine: states are linked to animations and transitions between them are triggered by parameters.'
        ),
        'GDevelop',
        'MIT'
      )
      .setShortDescription(
        _('Play animations with states and transitions between them.')
      )
      .setCategory('Visual effect')
      .setTags('animation, state machine, character, mecanim');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Animation State Machine'))
      .setIcon('JsPlatform/Extensions/skeletonanimationicon24.png');

    const animationStateMachineBehavior = new gd.BehaviorJsImplementation();
    animationStateMachineBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'stateMachineData') {
        behaviorContent.setStringAttribute('stateMachineData', newValue);
        return true;
      }
      return false;
    };
    animationStateMachineBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();
      behaviorProperties
        .getOrCreate('stateMachineData')
        .setValue(behaviorContent.getStringAttribute('stateMachineData'))
        .setType('string')
        .setLabel(_('Animation state machine data'))
        .setDescription(
          _(
            'The state machine definition is edited in the "State Machine" tab of the object.'
          )
        )
        .setHidden(true);
      return behaviorProperties;
    };
    animationStateMachineBehavior.initializeContent = function (
      behaviorContent
    ) {
      behaviorContent.setStringAttribute('stateMachineData', '');
    };

    const behavior = extension
      .addBehavior(
        'AnimationStateMachineBehavior',
        _('Animation State Machine'),
        'StateMachine',
        _(
          'Drive the animations of the object with a state machine: play the animation of the current state and switch states with transitions triggered by parameters.'
        ),
        '',
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'AnimationStateMachineBehavior',
        // @ts-ignore The class hierarchy is incorrect leading to a type error, but this is valid.
        animationStateMachineBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/AnimationStateMachine/statemachinelogic.js')
      .addIncludeFile(
        'Extensions/AnimationStateMachine/animationstatemachinebehavior.js'
      );

    behavior
      .addScopedAction(
        'ChangeState',
        _('Change the current state'),
        _('Immediately switch the state machine to the given state.'),
        _('Change the state of the animation state machine of _PARAM0_ to _PARAM2_'),
        _('States'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('State name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('changeState');

    behavior
      .addScopedAction(
        'SetNumberParameter',
        _('Set a number parameter'),
        _('Set the value of a number parameter of the state machine.'),
        _(
          'Set the parameter _PARAM2_ of the animation state machine of _PARAM0_ to _PARAM3_'
        ),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .addParameter('expression', _('Value'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setNumberParameter');

    behavior
      .addScopedAction(
        'SetBooleanParameter',
        _('Set a boolean parameter'),
        _('Set a boolean parameter of the state machine to true or false.'),
        _(
          'Set the parameter _PARAM2_ of the animation state machine of _PARAM0_ to _PARAM3_'
        ),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .addParameter('yesorno', _('New value'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setBooleanParameter');

    behavior
      .addScopedAction(
        'ToggleBooleanParameter',
        _('Toggle a boolean parameter'),
        _(
          'Invert the value of a boolean parameter of the state machine (true becomes false and false becomes true).'
        ),
        _('Toggle the parameter _PARAM2_ of the animation state machine of _PARAM0_'),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('toggleBooleanParameter');

    behavior
      .addScopedAction(
        'TriggerParameter',
        _('Trigger a parameter'),
        _(
          'Set a trigger parameter of the state machine. Triggers are automatically reset as soon as a transition using them is fired.'
        ),
        _('Trigger the parameter _PARAM2_ of the animation state machine of _PARAM0_'),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('triggerParameter');

    behavior
      .addScopedAction(
        'ResetTriggerParameter',
        _('Reset a trigger parameter'),
        _('Reset a trigger parameter of the state machine without firing it.'),
        _('Reset the trigger _PARAM2_ of the animation state machine of _PARAM0_'),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('resetTriggerParameter');

    behavior
      .addScopedCondition(
        'IsInState',
        _('Is in state'),
        _('Check if the state machine is currently in the given state.'),
        _('The animation state machine of _PARAM0_ is in the state _PARAM2_'),
        _('States'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('State name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isInState');

    behavior
      .addScopedCondition(
        'HasStateChanged',
        _('State has just changed'),
        _(
          'Check if the state machine has just entered a new state (during the frame following the change). Use this to trigger actions on state changes.'
        ),
        _('The animation state machine of _PARAM0_ has just changed state'),
        _('States'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .getCodeExtraInformation()
      .setFunctionName('hasJustChangedState');

    behavior
      .addScopedCondition(
        'JustEnteredState',
        _('State has just been entered'),
        _(
          'Check if the state machine has just entered the given state (during the frame following the change). Use this to trigger actions when a state starts (sound, particles...).'
        ),
        _(
          'The animation state machine of _PARAM0_ has just entered the state _PARAM2_'
        ),
        _('States'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('State name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('hasJustEnteredStateNamed');

    behavior
      .addScopedCondition(
        'JustExitedState',
        _('State has just been left'),
        _(
          'Check if the state machine has just left the given state (during the frame following the change).'
        ),
        _(
          'The animation state machine of _PARAM0_ has just left the state _PARAM2_'
        ),
        _('States'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('State name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('hasJustExitedStateNamed');

    behavior
      .addScopedCondition(
        'IsBooleanParameterSet',
        _('Boolean parameter is true'),
        _('Check if a boolean parameter of the state machine is true.'),
        _('The parameter _PARAM2_ of the animation state machine of _PARAM0_ is true'),
        _('Parameters'),
        'JsPlatform/Extensions/skeletonanimationicon24.png',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('isBooleanParameterSet');

    behavior
      .addExpression(
        'CurrentStateName',
        _('Current state name'),
        _('Name of the current state of the state machine.'),
        '',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .getCodeExtraInformation()
      .setFunctionName('getCurrentStateName');

    behavior
      .addExpression(
        'PreviousStateName',
        _('Previous state name'),
        _('Name of the state before the last state change.'),
        '',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .getCodeExtraInformation()
      .setFunctionName('getPreviousStateName');

    behavior
      .addExpression(
        'NumberParameter',
        _('Number parameter value'),
        _('Value of a number parameter of the state machine.'),
        '',
        'JsPlatform/Extensions/skeletonanimationicon24.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AnimationStateMachineBehavior', false)
      .addParameter('string', _('Parameter name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('getNumberParameter');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
