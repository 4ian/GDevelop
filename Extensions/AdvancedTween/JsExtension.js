//@ts-check
/// <reference path="../JsExtensionTypes.d.ts" />

/**
 * Built-in AdvancedTween animation player behavior.
 */

/** @type {ExtensionModule} */
module.exports = {
  createExtension: function (_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'AdvancedTween',
        _('AdvancedTween'),
        _(
          'Play animations created with the AdvancedTween Editor on 2D objects.'
        ),
        '',
        'Open source'
      )
      .setShortDescription(
        _('Play animations created with the AdvancedTween Editor.')
      )
      .setCategory('Visual effect')
      .setTags('animation, tween, movement')
      .setExtensionHelpPath('https://pandako.itch.io/ate');

    extension
      .addInstructionOrExpressionGroupMetadata(_('AdvancedTween'))
      .setIcon('JsPlatform/Extensions/tween_behavior32.png');

    const advancedTweenBehavior = new gd.BehaviorJsImplementation();
    advancedTweenBehavior.updateProperty = function (
      behaviorContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'InitialJson') {
        behaviorContent.setStringAttribute('InitialJson', newValue);
        return true;
      }
      if (propertyName === 'NoInitialValue') {
        behaviorContent.setBoolAttribute('NoInitialValue', newValue === 'true');
        return true;
      }
      if (propertyName === 'Delete') {
        behaviorContent.setBoolAttribute('Delete', newValue === 'true');
        return true;
      }
      return false;
    };
    advancedTweenBehavior.getProperties = function (behaviorContent) {
      const behaviorProperties = new gd.MapStringPropertyDescriptor();

      behaviorProperties
        .getOrCreate('Delete')
        .setValue(
          behaviorContent.getBoolAttribute('Delete') ? 'true' : 'false'
        )
        .setType('Boolean')
        .setLabel(_('Deletes the object once the animation has finished.'))
        .setDescription(
          _(
            'In the case of a looping animation, it will be deleted after the first playback.'
          )
        );

      behaviorProperties
        .getOrCreate('InitialJson')
        .setValue(behaviorContent.getStringAttribute('InitialJson'))
        .setType('Resource')
        .addExtraInfo('json')
        .setLabel(_('Initial animation JSON file'))
        .setDescription(_('If this value is empty, nothing will play.'));

      return behaviorProperties;
    };
    advancedTweenBehavior.initializeContent = function (behaviorContent) {
      behaviorContent.setStringAttribute('InitialJson', '');
      behaviorContent.setBoolAttribute('NoInitialValue', true);
      behaviorContent.setBoolAttribute('Delete', false);
    };

    const behavior = extension
      .addBehavior(
        'AdvancedTween',
        _('AdvancedTween'),
        'AdvancedTween',
        _(
          'Play the animation created in the AdvancedTween Editor.'
        ),
        '',
        'JsPlatform/Extensions/tween_behavior32.png',
        'AdvancedTween',
        // @ts-ignore - TODO: Fix BehaviorJsImplementation typing.
        advancedTweenBehavior,
        new gd.BehaviorsSharedData()
      )
      .setIncludeFile('Extensions/AdvancedTween/advancedtweenruntimebehavior.js');

    behavior
      .addAction(
        'onCreated',
        _('onCreated'),
        _('Run the AdvancedTween creation lifecycle step.'),
        _('Run AdvancedTween onCreated on _PARAM0_'),
        _('AdvancedTween lifecycle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('onCreated');

    behavior
      .addAction(
        'doStepPreEvents',
        _('doStepPreEvents'),
        _('Run the AdvancedTween pre-events lifecycle step.'),
        _('Run AdvancedTween doStepPreEvents on _PARAM0_'),
        _('AdvancedTween lifecycle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('doStepPreEvents');

    behavior
      .addAction(
        'doStepPostEvents',
        _('doStepPostEvents'),
        _('Run the AdvancedTween post-events lifecycle step.'),
        _('Run AdvancedTween doStepPostEvents on _PARAM0_'),
        _('AdvancedTween lifecycle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('doStepPostEvents');

    behavior
      .addAction(
        'onDestroy',
        _('onDestroy'),
        _('Run the AdvancedTween destroy lifecycle step.'),
        _('Run AdvancedTween onDestroy on _PARAM0_'),
        _('AdvancedTween lifecycle'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .setHidden()
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('onDestroy');

    behavior
      .addAction(
        'SetJson',
        _('Set animation JSON'),
        _('Set the animation JSON file.'),
        _('Set animation JSON _PARAM2_ on _PARAM0_'),
        _('AdvancedTween configuration'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .addParameter('jsonResource', _('Json file'), '', false)
      .addParameter(
        'yesorno',
        _('Delete object when the animation has finished'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setJson');

    behavior
      .addExpressionAndCondition(
        'number',
        'Duration',
        _('Duration'),
        _('the animation duration'),
        _('the animation duration'),
        _('AdvancedTween state'),
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getDuration');

    behavior
      .addExpressionAndCondition(
        'number',
        'CurrentTime',
        _('Current time'),
        _('the current animation time'),
        _('the current animation time'),
        _('AdvancedTween state'),
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getCurrentTime');

    behavior
      .addAction(
        'SetCurrentTime',
        _('Current time'),
        _('Set the current animation time.'),
        _('the current time'),
        _('AdvancedTween state'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Current time')
        )
      )
      .getCodeExtraInformation()
      .setFunctionName('setCurrentTime')
      .setGetter('getCurrentTime');

    behavior
      .addAction(
        'Play',
        _('Play from the beginning'),
        _('Play the animation from the beginning.'),
        _('Play AdvancedTween from the beginning on _PARAM0_'),
        _('AdvancedTween playback'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('play');

    behavior
      .addAction(
        'Pause',
        _('Pause'),
        _('Pause the animation.'),
        _('Pause AdvancedTween on _PARAM0_'),
        _('AdvancedTween playback'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('pause');

    behavior
      .addAction(
        'Resume',
        _('Resume'),
        _('Resume the animation.'),
        _('Resume AdvancedTween on _PARAM0_'),
        _('AdvancedTween playback'),
        'JsPlatform/Extensions/tween_behavior24.png',
        'JsPlatform/Extensions/tween_behavior32.png'
      )
      .addParameter('object', _('Object'), '', false)
      .addParameter('behavior', _('Behavior'), 'AdvancedTween', false)
      .getCodeExtraInformation()
      .setFunctionName('resume');

    return extension;
  },

  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
};
