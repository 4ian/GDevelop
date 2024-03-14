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

const easingChoices = JSON.stringify([
  'linear',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInQuart',
  'easeOutQuart',
  'easeInOutQuart',
  'easeInQuint',
  'easeOutQuint',
  'easeInOutQuint',
  'easeInSine',
  'easeOutSine',
  'easeInOutSine',
  'easeInExpo',
  'easeOutExpo',
  'easeInOutExpo',
  'easeInCirc',
  'easeOutCirc',
  'easeInOutCirc',
  'easeOutBounce',
  'easeInBack',
  'easeOutBack',
  'easeInOutBack',
  'elastic',
  'swingFromTo',
  'swingFrom',
  'swingTo',
  'bounce',
  'bouncePast',
  'easeFromTo',
  'easeFrom',
  'easeTo',
]);

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'Tween',
        _('Tweening'),
        _(
          'Animate object properties over time. This allows smooth transitions, animations or movement of objects to specified positions.'
        ),
        'Matthias Meike, Florian Rival',
        'Open source (MIT License)'
      )
      .setCategory('Visual effect')
      .setTags('tween, interpolation, smooth')
      .setExtensionHelpPath('/behaviors/tween');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Tweening'))
      .setIcon('JsPlatform/Extensions/tween_behavior32.png');

    extension
      .addExpression(
        'Ease',
        _('Ease'),
        _('Tween between 2 values according to an easing function.'),
        '',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('From value'))
      .addParameter('expression', _('To value'))
      .addParameter('expression', _('Weighting'))
      .setParameterLongDescription(_('From 0 to 1.'))
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .setFunctionName('gdjs.evtTools.tween.ease');

    // Deprecated
    extension
      .addAction(
        'TweenSceneVariableNumber',
        _('Tween a number in a scene variable'),
        _(
          "Tweens a scene variable's numeric value from one number to another."
        ),
        _(
          'Tween variable _PARAM2_ from _PARAM3_ to _PARAM4_ over _PARAM5_ms with easing _PARAM6_ as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('scenevar', _('The variable to tween'), '', false)
      .addParameter('expression', _('Initial value'), '', false)
      .addParameter('expression', _('Final value'), '', false)
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenVariableNumber');

    // Deprecated
    extension
      .addAction(
        'TweenSceneVariableNumber2',
        _('Tween a number in a scene variable'),
        _(
          "Tweens a scene variable's numeric value from its current value to a new one."
        ),
        _(
          'Tween variable _PARAM2_ to _PARAM3_ over _PARAM4_ms with easing _PARAM5_ as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('scenevar', _('The variable to tween'), '', false)
      .addParameter('expression', _('Final value'), '', false)
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenVariableNumber2');

    extension
      .addAction(
        'TweenSceneVariableNumber3',
        _('Tween a number in a scene variable'),
        _(
          "Tweens a scene variable's numeric value from its current value to a new one."
        ),
        _(
          'Tween variable _PARAM2_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('scenevar', _('The variable to tween'), '', false)
      .addParameter('expression', _('Final value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenVariableNumber3');

    extension
      .addAction(
        'AddLayoutValueTween',
        _('Tween a scene value'),
        _(
          'Tweens a scene value that can be use with the expression Tween::Value.'
        ),
        _(
          'Tween the value from _PARAM2_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('From value'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter('yesorno', _('Exponential interpolation'), '', false)
      .setDefaultValue('no')
      .markAsAdvanced()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.addLayoutValueTween');

    extension
      .addAction(
        'AddLayerValueTween',
        _('Tween a layer value'),
        _(
          'Tweens a layer value that can be use with the expression Tween::Value.'
        ),
        _(
          'Tween the value of _PARAM7_ from _PARAM2_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('From value'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter('yesorno', _('Exponential interpolation'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('no')
      .markAsAdvanced()
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.addLayerValueTween');

    // deprecated
    extension
      .addAction(
        'TweenCameraPosition',
        _('Tween the camera position'),
        _('Tweens the camera position from the current one to a new one.'),
        _(
          'Tween camera on layer _PARAM4_ to _PARAM2_;_PARAM3_ over _PARAM5_ms with easing _PARAM6_ as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target X position'), '', false)
      .addParameter('expression', _('Target Y position'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCamera');

    extension
      .addAction(
        'TweenCameraPosition2',
        _('Tween the camera position'),
        _('Tweens the camera position from the current one to a new one.'),
        _(
          'Tween camera on layer _PARAM4_ to _PARAM2_;_PARAM3_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target X position'), '', false)
      .addParameter('expression', _('Target Y position'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCamera2');

    // deprecated
    extension
      .addAction(
        'TweenCameraZoom',
        _('Tween the camera zoom'),
        _('Tweens the camera zoom from the current zoom factor to a new one.'),
        _(
          'Tween the zoom of camera on layer _PARAM3_ to _PARAM2_ over _PARAM4_ms with easing _PARAM5_ as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target zoom'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCameraZoom');

    extension
      .addAction(
        'TweenCameraZoom2',
        _('Tween the camera zoom'),
        _('Tweens the camera zoom from the current zoom factor to a new one.'),
        _(
          'Tween the zoom of camera on layer _PARAM3_ to _PARAM2_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target zoom'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCameraZoom2');

    // deprecated
    extension
      .addAction(
        'TweenCameraRotation',
        _('Tween the camera rotation'),
        _('Tweens the camera rotation from the current angle to a new one.'),
        _(
          'Tween the rotation of camera on layer _PARAM3_ to _PARAM2_ over _PARAM4_ms with easing _PARAM5_ as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target rotation (in degrees)'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCameraRotation');

    extension
      .addAction(
        'TweenCameraRotation2',
        _('Tween the camera rotation'),
        _('Tweens the camera rotation from the current angle to a new one.'),
        _(
          'Tween the rotation of camera on layer _PARAM3_ to _PARAM2_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('Target rotation (in degrees)'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenCameraRotation2');

    extension
      .addAction(
        'TweenNumberEffectPropertyTween',
        _('Tween number effect property'),
        _(
          'Tweens a number effect property from its current value to a new one.'
        ),
        _(
          'Tween the property _PARAM5_ for effect _PARAM4_ of _PARAM3_ to _PARAM2_ with easing _PARAM6_ over _PARAM7_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('expression', _('To value'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('layerEffectName', _('Effect name'))
      .addParameter('layerEffectParameterName', _('Property name'))
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenNumberEffectPropertyTween');

    extension
      .addAction(
        'TweenColorEffectPropertyTween',
        _('Tween color effect property'),
        _(
          'Tweens a color effect property from its current value to a new one.'
        ),
        _(
          'Tween the color property _PARAM5_ for effect _PARAM4_ of _PARAM3_ to _PARAM2_ with easing _PARAM6_ over _PARAM7_ seconds as _PARAM1_'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('color', _('To color'), '', false)
      .addParameter('layer', _('Layer'), '', true)
      .addParameter('layerEffectName', _('Effect name'))
      .addParameter('layerEffectParameterName', _('Property name'))
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.tweenColorEffectPropertyTween');

    extension
      .addCondition(
        'SceneTweenExists',
        _('Scene tween exists'),
        _('Check if the scene tween exists.'),
        _('Scene tween _PARAM1_ exists'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.sceneTweenExists');

    extension
      .addCondition(
        'SceneTweenIsPlaying',
        _('Scene tween is playing'),
        _('Check if the scene tween is currently playing.'),
        _('Scene tween _PARAM1_ is playing'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.sceneTweenIsPlaying');

    extension
      .addCondition(
        'SceneTweenHasFinished',
        _('Scene tween finished playing'),
        _('Check if the scene tween has finished playing.'),
        _('Scene tween _PARAM1_ has finished playing'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.sceneTweenHasFinished');

    extension
      .addAction(
        'PauseSceneTween',
        _('Pause a scene tween'),
        _('Pause the running scene tween.'),
        _('Pause the scene tween _PARAM1_'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.pauseSceneTween');

    extension
      .addAction(
        'StopSceneTween',
        _('Stop a scene tween'),
        _('Stop the running scene tween.'),
        _('Stop the scene tween _PARAM1_ (jump to the end: _PARAM2_)'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .addParameter('yesorno', _('Jump to the end'), '', false)
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.stopSceneTween');

    extension
      .addAction(
        'ResumeSceneTween',
        _('Resume a scene tween'),
        _('Resume the scene tween.'),
        _('Resume the scene tween _PARAM1_'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.resumeSceneTween');

    extension
      .addAction(
        'RemoveSceneTween',
        _('Remove a scene tween'),
        _(
          'Remove the scene tween. Call this when the tween is no longer needed to free memory.'
        ),
        _('Remove the scene tween _PARAM1_'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.removeSceneTween');

    extension
      .addExpressionAndCondition(
        'number',
        'Progress',
        _('Tween progress'),
        _('the progress of a tween (between 0.0 and 1.0)'),
        _('the progress of the scene tween _PARAM1_'),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.getProgress');

    extension
      .addExpression(
        'Value',
        _('Tween value'),
        _(
          'Return the value of a tween. It is always 0 for tweens with several values.'
        ),
        _('Scene Tweens'),
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('identifier', _('Tween Identifier'), 'sceneTween')
      .getCodeExtraInformation()
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.getValue');

    const tweenBehavior = new gd.BehaviorJsImplementation();

    tweenBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };

    tweenBehavior.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();
      return behaviorProperties;
    };

    tweenBehavior.initializeContent = function (behaviorContent) {};

    const behavior = extension
      .addBehavior(
        'TweenBehavior',
        _('Tween'),
        'Tween',
        _(
          'Smoothly animate position, angle, scale and other properties of objects.'
        ),
        '',
        'JsPlatform/Extensions/tween_behavior32.png',
        'TweenBehavior',
        // @ts-ignore - TODO: Fix tweenBehavior being an BehaviorJsImplementation instead of an Behavior
        tweenBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/TweenBehavior/TweenManager.js')
      .addIncludeFile('Extensions/TweenBehavior/tweenruntimebehavior.js');

    // Behavior related

    // Deprecated
    behavior
      .addAction(
        'AddObjectVariableTween',
        _('Add object variable tween'),
        _('Add a tween animation for an object variable.'),
        _(
          'Tween the variable _PARAM3_ of _PARAM0_ from _PARAM4_ to _PARAM5_ with easing _PARAM6_ over _PARAM7_ms as _PARAM2_'
        ),
        _('Variables'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('objectvar', _('Object variable'), '', false)
      .addParameter('expression', _('From value'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addVariableTween');

    // Deprecated
    behavior
      .addAction(
        'AddObjectVariableTween2',
        _('Tween a number in an object variable'),
        _(
          "Tweens an object variable's numeric value from its current value to a new one."
        ),
        _(
          'Tween the variable _PARAM3_ of _PARAM0_ to _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_'
        ),
        _('Variables'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('objectvar', _('Object variable'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addVariableTween2');

    behavior
      .addScopedAction(
        'AddObjectVariableTween3',
        _('Tween a number in an object variable'),
        _(
          "Tweens an object variable's numeric value from its current value to a new one."
        ),
        _(
          'Tween the variable _PARAM3_ of _PARAM0_ to _PARAM4_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM2_'
        ),
        _('Variables'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('objectvar', _('Object variable'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addVariableTween3');

    behavior
      .addScopedAction(
        'AddObjectValueTween',
        _('Tween an object value'),
        _(
          'Tweens an object value that can be use with the object expression Tween::Value.'
        ),
        _(
          'Tween the value of _PARAM0_ from _PARAM3_ to _PARAM4_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM2_'
        ),
        _('Variables'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('From value'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter('yesorno', _('Exponential interpolation'), '', false)
      .setDefaultValue('no')
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addValueTween');

    // deprecated
    behavior
      .addAction(
        'AddObjectPositionTween',
        _('Tween object position'),
        _('Tweens an object position from its current position to a new one.'),
        _(
          'Tween the position of _PARAM0_ to x: _PARAM3_, y: _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To X'), '', false)
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionTween');

    behavior
      .addScopedAction(
        'AddObjectPositionTween2',
        _('Tween object position'),
        _('Tweens an object position from its current position to a new one.'),
        _(
          'Tween the position of _PARAM0_ to x: _PARAM3_, y: _PARAM4_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To X'), '', false)
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectPositionXTween',
        _('Tween object X position'),
        _(
          'Tweens an object X position from its current X position to a new one.'
        ),
        _(
          'Tween the X position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionXTween');

    behavior
      .addScopedAction(
        'AddObjectPositionXTween2',
        _('Tween object X position'),
        _(
          'Tweens an object X position from its current X position to a new one.'
        ),
        _(
          'Tween the X position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionXTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectPositionZTween',
        _('Tween object Z position'),
        _(
          'Tweens an object Z position (3D objects only) from its current Z position to a new one.'
        ),
        _(
          'Tween the Z position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Z'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionZTween');

    behavior
      .addAction(
        'AddObjectPositionZTween2',
        _('Tween object Z position'),
        _(
          'Tweens an object Z position (3D objects only) from its current Z position to a new one.'
        ),
        _(
          'Tween the Z position of _PARAM0_ to _PARAM4_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM3_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('behavior', _('3D capability'), 'Scene3D::Base3DBehavior')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Z'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionZTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectWidthTween',
        _('Tween object width'),
        _('Tweens an object width from its current width to a new one.'),
        _(
          'Tween the width of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To width'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectWidthTween');

    behavior
      .addScopedAction(
        'AddObjectWidthTween2',
        _('Tween object width'),
        _('Tweens an object width from its current width to a new one.'),
        _(
          'Tween the width of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To width'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectWidthTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectHeightTween',
        _('Tween object height'),
        _('Tweens an object height from its current height to a new one.'),
        _(
          'Tween the height of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To height'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectHeightTween');

    behavior
      .addScopedAction(
        'AddObjectHeightTween2',
        _('Tween object height'),
        _('Tweens an object height from its current height to a new one.'),
        _(
          'Tween the height of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To height'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectHeightTween2');

    // deprecated use the 3D Tween extension
    behavior
      .addAction(
        'AddObjectDepthTween',
        _('Tween object depth'),
        _(
          'Tweens an object depth (suitable 3D objects only) from its current depth to a new one.'
        ),
        _(
          'Tween the depth of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To depth'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectDepthTween');

    behavior
      .addAction(
        'AddObjectDepthTween2',
        _('Tween object depth'),
        _(
          'Tweens an object depth (suitable 3D objects only) from its current depth to a new one.'
        ),
        _(
          'Tween the depth of _PARAM0_ to _PARAM4_ with easing _PARAM5_ over _PARAM6_ seconds as _PARAM3_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('behavior', _('3D capability'), 'Scene3D::Base3DBehavior')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To depth'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectDepthTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectPositionYTween',
        _('Tween object Y position'),
        _(
          'Tweens an object Y position from its current Y position to a new one.'
        ),
        _(
          'Tween the Y position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionYTween');

    behavior
      .addScopedAction(
        'AddObjectPositionYTween2',
        _('Tween object Y position'),
        _(
          'Tweens an object Y position from its current Y position to a new one.'
        ),
        _(
          'Tween the Y position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectPositionYTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectAngleTween',
        _('Tween object angle'),
        _('Tweens an object angle from its current angle to a new one.'),
        _(
          'Tween the angle of _PARAM0_ to _PARAM3_° with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Angle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To angle (in degrees)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectAngleTween');

    behavior
      .addScopedAction(
        'AddObjectAngleTween2',
        _('Tween object angle'),
        _('Tweens an object angle from its current angle to a new one.'),
        _(
          'Tween the angle of _PARAM0_ to _PARAM3_° with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Angle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To angle (in degrees)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectAngleTween2');

    behavior
      .addScopedAction(
        'AddObjectRotationXTween',
        _('Tween object rotation on X axis'),
        _(
          'Tweens an object rotation on X axis from its current angle to a new one.'
        ),
        _(
          'Tween the rotation on X axis of _PARAM0_ to _PARAM4_° with easing _PARAM5_ over _PARAM6_ seconds as _PARAM3_'
        ),
        _('Angle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('behavior', _('3D capability'), 'Scene3D::Base3DBehavior')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To angle (in degrees)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectRotationXTween');

    behavior
      .addScopedAction(
        'AddObjectRotationYTween',
        _('Tween object rotation on Y axis'),
        _(
          'Tweens an object rotation on Y axis from its current angle to a new one.'
        ),
        _(
          'Tween the rotation on Y axis of _PARAM0_ to _PARAM4_° with easing _PARAM5_ over _PARAM6_ seconds as _PARAM3_'
        ),
        _('Angle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('behavior', _('3D capability'), 'Scene3D::Base3DBehavior')
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To angle (in degrees)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectRotationYTween');

    // deprecated
    behavior
      .addAction(
        'AddObjectScaleTween',
        _('Tween object scale'),
        _(
          'Tweens an object scale from its current scale to a new one (note: the scale can never be less than 0).'
        ),
        _(
          'Tween the scale of _PARAM0_ to X-scale: _PARAM3_, Y-scale: _PARAM4_ (from center: _PARAM8_) with easing _PARAM5_ over _PARAM6_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleTween');

    // deprecated
    behavior
      .addScopedAction(
        'AddObjectScaleTween2',
        _('Tween object scale'),
        _(
          'Tweens an object scale from its current scale to a new one (note: the scale can never be 0 or less).'
        ),
        _(
          'Tween the scale of _PARAM0_ to X-scale: _PARAM3_, Y-scale: _PARAM4_ (from center: _PARAM8_) with easing _PARAM5_ over _PARAM6_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleTween2');

    behavior
      .addScopedAction(
        'AddObjectScaleTween3',
        _('Tween object scale'),
        _(
          'Tweens an object scale from its current value to a new one (note: the scale can never be 0 or less).'
        ),
        _(
          'Tween the scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleTween3');

    // deprecated
    behavior
      .addAction(
        'AddObjectScaleXTween',
        _('Tween object X-scale'),
        _(
          'Tweens an object X-scale from its current value to a new one (note: the scale can never be less than 0).'
        ),
        _(
          'Tween the X-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleXTween');

    behavior
      .addScopedAction(
        'AddObjectScaleXTween2',
        _('Tween object X-scale'),
        _(
          'Tweens an object X-scale from its current value to a new one (note: the scale can never be 0 or less).'
        ),
        _(
          'Tween the X-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleXTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectScaleYTween',
        _('Tween object Y-scale'),
        _(
          'Tweens an object Y-scale from its current value to a new one (note: the scale can never be less than 0).'
        ),
        _(
          'Tween the Y-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleYTween');

    behavior
      .addScopedAction(
        'AddObjectScaleYTween2',
        _('Tween object Y-scale'),
        _(
          'Tweens an object Y-scale from its current value to a new one (note: the scale can never be 0 or less).'
        ),
        _(
          'Tween the Y-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter('yesorno', _('Scale from center of object'), '', false)
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectScaleYTween2');

    // deprecated
    behavior
      .addAction(
        'AddTextObjectCharacterSizeTween',
        _('Tween text size'),
        _(
          'Tweens the text object character size from its current value to a new one (note: the size can never be less than 1).'
        ),
        _(
          'Tween the character size of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Text'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Text object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To character size'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addTextObjectCharacterSizeTween');

    behavior
      .addScopedAction(
        'AddTextObjectCharacterSizeTween2',
        _('Tween text size'),
        _(
          'Tweens the text object character size from its current value to a new one (note: the size can never be less than 1).'
        ),
        _(
          'Tween the character size of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Text'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Text object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To character size'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addTextObjectCharacterSizeTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectOpacityTween',
        _('Tween object opacity'),
        _(
          'Tweens the object opacity from its current value to a new one (note: the value shall stay between 0 and 255).'
        ),
        _(
          'Tween the opacity of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Visibility'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To opacity'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectOpacityTween');

    behavior
      .addScopedAction(
        'AddObjectOpacityTween2',
        _('Tween object opacity'),
        _(
          'Tweens the object opacity from its current value to a new one (note: the value shall stay between 0 and 255).'
        ),
        _(
          'Tween the opacity of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Visibility'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To opacity'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectOpacityTween2');

    behavior
      .addScopedAction(
        'AddNumberEffectPropertyTween',
        _('Tween number effect property'),
        _(
          'Tweens a number effect property from its current value to a new one.'
        ),
        _(
          'Tween the property _PARAM6_ for effect _PARAM5_ of _PARAM0_ to _PARAM4_ with easing _PARAM7_ over _PARAM8_ seconds as _PARAM3_'
        ),
        _('Effects'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter(
        'behavior',
        _('Effect capability'),
        'EffectCapability::EffectBehavior'
      )
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To value'), '', false)
      .addParameter('objectEffectName', _('Effect name'))
      .addParameter('objectEffectParameterName', _('Property name'))
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addNumberEffectPropertyTween');

    behavior
      .addScopedAction(
        'AddColorEffectPropertyTween',
        _('Tween color effect property'),
        _(
          'Tweens a color effect property from its current value to a new one.'
        ),
        _(
          'Tween the color property _PARAM6_ for effect _PARAM5_ of _PARAM0_ to _PARAM4_ with easing _PARAM7_ over _PARAM8_ seconds as _PARAM3_'
        ),
        _('Effects'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter(
        'behavior',
        _('Effect capability'),
        'EffectCapability::EffectBehavior'
      )
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('color', _('To color'), '', false)
      .addParameter('objectEffectName', _('Effect name'))
      .addParameter('objectEffectParameterName', _('Property name'))
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addColorEffectPropertyTween');

    // deprecated
    behavior
      .addAction(
        'AddObjectColorTween',
        _('Tween object color'),
        _(
          'Tweens the object color from its current value to a new one. Format: "128;200;255" with values between 0 and 255 for red, green and blue'
        ),
        _(
          'Tween the color of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('color', _('To color'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter(
        'yesorno',
        _('Tween on the Hue/Saturation/Lightness (HSL)'),
        '',
        false
      )
      .setParameterLongDescription(
        _('Useful to have a more natural change between colors.')
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectColorTween');

    behavior
      .addScopedAction(
        'AddObjectColorTween2',
        _('Tween object color'),
        _(
          'Tweens the object color from its current value to a new one. Format: "128;200;255" with values between 0 and 255 for red, green and blue'
        ),
        _(
          'Tween the color of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ seconds as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('color', _('To color'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .addParameter(
        'yesorno',
        _('Tween on the Hue/Saturation/Lightness (HSL)'),
        '',
        false
      )
      .setParameterLongDescription(
        _('Useful to have a more natural change between colors.')
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectColorTween2');

    // deprecated
    behavior
      .addAction(
        'AddObjectColorHSLTween',
        _('Tween object HSL color'),
        _(
          'Tweens the object color using Hue/Saturation/Lightness. Hue is in degrees, Saturation and Lightness are between 0 and 100. Use -1 for Saturation and Lightness to let them unchanged.'
        ),
        _(
          'Tween the color of _PARAM0_ using HSL to H: _PARAM3_ (_PARAM4_), S: _PARAM5_, L: _PARAM6_ with easing _PARAM7_ over _PARAM8_ms as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Hue (in degrees)'), '', false)
      .addParameter('yesorno', _('Animate Hue'), '', false)
      .setDefaultValue('yes')
      .addParameter(
        'expression',
        _('To Saturation (0 to 100, -1 to ignore)'),
        '',
        false
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        _('To Lightness (0 to 100, -1 to ignore)'),
        '',
        false
      )
      .setDefaultValue('-1')
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in milliseconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectColorHSLTween');

    behavior
      .addScopedAction(
        'AddObjectColorHSLTween2',
        _('Tween object HSL color'),
        _(
          'Tweens the object color using Hue/Saturation/Lightness. Hue is in degrees, Saturation and Lightness are between 0 and 100. Use -1 for Saturation and Lightness to let them unchanged.'
        ),
        _(
          'Tween the color of _PARAM0_ using HSL to H: _PARAM3_ (_PARAM4_), S: _PARAM5_, L: _PARAM6_ with easing _PARAM7_ over _PARAM8_ seconds as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('expression', _('To Hue (in degrees)'), '', false)
      .addParameter('yesorno', _('Animate Hue'), '', false)
      .setDefaultValue('yes')
      .addParameter(
        'expression',
        _('To Saturation (0 to 100, -1 to ignore)'),
        '',
        false
      )
      .setDefaultValue('-1')
      .addParameter(
        'expression',
        _('To Lightness (0 to 100, -1 to ignore)'),
        '',
        false
      )
      .setDefaultValue('-1')
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration (in seconds)'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addObjectColorHSLTween2');

    behavior
      .addCondition(
        'Exists',
        _('Tween exists'),
        _('Check if the tween animation exists.'),
        _('Tween _PARAM2_ on _PARAM0_ exists'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('exists');

    behavior
      .addCondition(
        'IsPlaying',
        _('Tween is playing'),
        _('Check if the tween animation is currently playing.'),
        _('Tween _PARAM2_ on _PARAM0_ is playing'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('isPlaying');

    behavior
      .addCondition(
        'HasFinished',
        _('Tween finished playing'),
        _('Check if the tween animation has finished playing.'),
        _('Tween _PARAM2_ on _PARAM0_ has finished playing'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('hasFinished');

    behavior
      .addAction(
        'PauseTween',
        _('Pause a tween'),
        _('Pause the running tween animation.'),
        _('Pause the tween _PARAM2_ on _PARAM0_'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('pauseTween');

    behavior
      .addAction(
        'StopTween',
        _('Stop a tween'),
        _('Stop the running tween animation.'),
        _('Stop the tween _PARAM2_ on _PARAM0_'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .addParameter('yesorno', _('Jump to end'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('stopTween');

    behavior
      .addAction(
        'ResumeTween',
        _('Resume a tween'),
        _('Resume the tween animation.'),
        _('Resume the tween _PARAM2_ on _PARAM0_'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('resumeTween');

    behavior
      .addAction(
        'RemoveTween',
        _('Remove a tween'),
        _('Remove the tween animation from the object.'),
        _('Remove the tween _PARAM2_ from _PARAM0_'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('removeTween');

    behavior
      .addExpressionAndCondition(
        'number',
        'Progress',
        _('Tween progress'),
        _('the progress of a tween (between 0.0 and 1.0)'),
        _('the progress of the tween _PARAM2_'),
        '',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getProgress');

    behavior
      .addExpression(
        'Value',
        _('Tween value'),
        _(
          'Return the value of a tween. It is always 0 for tweens with several values.'
        ),
        '',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('identifier', _('Tween Identifier'), 'objectTween')
      .getCodeExtraInformation()
      .setFunctionName('getValue');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
