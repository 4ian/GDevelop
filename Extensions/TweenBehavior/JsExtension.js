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
      .setExtensionHelpPath('/behaviors/tween');

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
      .setIncludeFile('Extensions/TweenBehavior/shifty.js')
      .addIncludeFile('Extensions/TweenBehavior/tweentools.js')
      .setFunctionName('gdjs.evtTools.tween.ease');

    var tweenBehavior = new gd.BehaviorJsImplementation();

    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    tweenBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      return false;
    };

    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
    tweenBehavior.getProperties = function (behaviorContent) {
      var behaviorProperties = new gd.MapStringPropertyDescriptor();
      return behaviorProperties;
    };

    // $FlowExpectedError - ignore Flow warning as we're creating a behavior
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
        tweenBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/TweenBehavior/shifty.js')
      .addIncludeFile('Extensions/TweenBehavior/tweenruntimebehavior.js');

    // Behavior related
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
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('objectvar', _('Object variable'), '', false)
      .addParameter('expression', _('From value'), '', false)
      .addParameter('expression', _('To value'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
      .addParameter(
        'yesorno',
        _('Destroy this object when tween finishes'),
        '',
        false
      )
      .setDefaultValue('no')
      .getCodeExtraInformation()
      .setFunctionName('addVariableTween');

    behavior
      .addAction(
        'AddObjectPositionTween',
        _('Add object position tween'),
        _('Add a tween animation for the object position.'),
        _(
          'Tween the position of _PARAM0_ to x: _PARAM3_, y: _PARAM4_ with easing _PARAM5_ over _PARAM6_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To X'), '', false)
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectPositionXTween',
        _('Add object position X tween'),
        _('Add a tween animation for the object X position.'),
        _(
          'Tween the X position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectWidthTween',
        _('Add object width tween'),
        _('Add a tween animation for the object width.'),
        _(
          'Tween the width of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To width'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectHeightTween',
        _('Add object height tween'),
        _('Add a tween animation for the object height.'),
        _(
          'Tween the height of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Size'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To height'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectPositionYTween',
        _('Add object position Y tween'),
        _('Add a tween animation for the object Y position.'),
        _(
          'Tween the Y position of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Position'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectAngleTween',
        _('Add object angle tween'),
        _('Add a tween animation for the object angle.'),
        _(
          'Tween the angle of _PARAM0_ to _PARAM3_° with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Angle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To angle (in degrees)'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectScaleTween',
        _('Add object scale tween'),
        _(
          'Add a tween animation for the object scale (Note: the scale can never be less than 0).'
        ),
        _(
          'Tween the scale of _PARAM0_ to X-scale: _PARAM3_, Y-scale: _PARAM4_ (from center: _PARAM8_) with easing _PARAM5_ over _PARAM6_ms as _PARAM2_'
        ),
        _('Scale'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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

    behavior
      .addAction(
        'AddObjectScaleXTween',
        _('Add object X-scale tween'),
        _(
          'Add a tween animation for the object X-scale (Note: the scale can never be less than 0).'
        ),
        _(
          'Tween the X-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Scale'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To scale X'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectScaleYTween',
        _('Add object Y-scale tween'),
        _(
          'Add a tween animation for the object Y-scale (Note: the scale can never be less than 0).'
        ),
        _(
          'Tween the Y-scale of _PARAM0_ to _PARAM3_ (from center: _PARAM7_) with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Scale'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To scale Y'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddTextObjectCharacterSizeTween',
        _('Add text size tween'),
        _(
          'Add a tween animation for the text object character size (Note: the size can never be less than 1).'
        ),
        _(
          'Tween the character size of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Text'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Text object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To character size'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectOpacityTween',
        _('Add object opacity tween'),
        _(
          'Add a tween animation for the object opacity (Value between 0 and 255).'
        ),
        _(
          'Tween the opacity of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Opacity'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To opacity'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectColorTween',
        _('Add object color tween'),
        _(
          'Add a tween animation for the object color. Format: "128;200;255" with values between 0 and 255 for red, green and blue'
        ),
        _(
          'Tween the color of _PARAM0_ to _PARAM3_ with easing _PARAM4_ over _PARAM5_ms as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('color', _('To color'), '', false)
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addAction(
        'AddObjectColorHSLTween',
        _('Add object HSL color tween'),
        _(
          'Add a tween animation for the object color using Hue/Saturation/Lightness. Hue can be any number, Saturation and Lightness are between 0 and 100. Use -1 for Saturation and Lightness to let them unchanged.'
        ),
        _(
          'Tween the color of _PARAM0_ using HSL to H: _PARAM3_ (_PARAM4_), S: _PARAM5_, L: _PARAM6_ with easing _PARAM7_ over _PARAM8_ms as _PARAM2_'
        ),
        _('Color'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .addParameter('expression', _('To Hue'), '', false)
      .addParameter('yesorno', _('Animate Hue'), '', false)
      .setDefaultValue('yes')
      .addParameter('expression', _('To Saturation (-1 to ignore)'), '', false)
      .setDefaultValue('-1')
      .addParameter('expression', _('To Lightness (-1 to ignore)'), '', false)
      .setDefaultValue('-1')
      .addParameter('stringWithSelector', _('Easing'), easingChoices, false)
      .setDefaultValue('linear')
      .addParameter('expression', _('Duration'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
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
      .addParameter('string', _('Tween Identifier'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('removeTween');

    behavior
      .addAction(
        'AwaitTween',
        _('Await the end of a tween'),
        _('Waits until a tween has finished before continuing the execution of events.'),
        _('Wait for tween _PARAM2_ of _PARAM0_ to end'),
        '',
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .setAsync()
      .getCodeExtraInformation()
      .setFunctionName('awaitTween');

    behavior
      .addExpression(
        'Progress',
        _('Progress of a tween'),
        _('Progress of a tween (between 0.0 and 1.0)'),
        '',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'TweenBehavior', false)
      .addParameter('string', _('Tween Identifier'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('getProgress');

    return extension;
  },

  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
};
