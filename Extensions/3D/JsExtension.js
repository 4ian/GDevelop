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
        'Scene3D',
        _('3D'),
        _('Support for 3D in GDevelop.'),
        'Florian Rival',
        'MIT'
      )
      .setCategory('General');
    extension
      .addInstructionOrExpressionGroupMetadata(_('3D'))
      .setIcon('res/conditions/3d_box.svg');

    {
      const base3D = extension
        .addBehavior(
          'Base3DBehavior',
          _('3D capability'),
          'Object3D',
          _('Move the object in 3D space.'),
          '',
          'res/conditions/3d_box.svg',
          'Base3DBehavior',
          new gd.Behavior(),
          new gd.BehaviorsSharedData()
        )
        .setHidden()
        .setIncludeFile('Extensions/3D/Base3DBehavior.js');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'Z',
          _('Z (elevation)'),
          _('the Z position (the "elevation")'),
          _('the Z position'),
          _('Position'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setZ')
        .setGetter('getZ');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'CenterZ',
          _('Center Z position'),
          _('the Z position of the center of rotation'),
          _('the Z position of the center'),
          _('Position/Center'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setCenterZInScene')
        .setGetter('getCenterZInScene');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'Depth',
          _('Depth (size on Z axis)'),
          _('the depth (size on Z axis)'),
          _('the depth'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setDepth')
        .setGetter('getDepth');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleZ',
          _('Scale on Z axis'),
          _('the scale on Z axis of an object (default scale is 1)'),
          _('the scale on Z axis scale'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .markAsAdvanced()
        .setFunctionName('setScaleZ')
        .setGetter('getScaleZ');

      base3D
        .addScopedAction(
          'FlipZ',
          _('Flip the object on Z'),
          _('Flip the object on Z axis'),
          _('Flip on Z axis _PARAM0_: _PARAM2_'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setFunctionName('flipZ');

      base3D
        .addScopedCondition(
          'FlippedZ',
          _('Flipped on Z'),
          _('Check if the object is flipped on Z axis'),
          _('_PARAM0_ is flipped on Z axis'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .setFunctionName('isFlippedZ');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'RotationX',
          _('Rotation on X axis'),
          _('the rotation on X axis'),
          _('the rotation on X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setRotationX')
        .setGetter('getRotationX');

      base3D
        .addExpressionAndConditionAndAction(
          'number',
          'RotationY',
          _('Rotation on Y axis'),
          _('the rotation on Y axis'),
          _('the rotation on Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setFunctionName('setRotationY')
        .setGetter('getRotationY');

      base3D
        .addScopedAction(
          'TurnAroundX',
          _('Turn around X axis'),
          _(
            "Turn the object around X axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundX');

      base3D
        .addScopedAction(
          'TurnAroundY',
          _('Turn around Y axis'),
          _(
            "Turn the object around Y axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundY');

      base3D
        .addScopedAction(
          'TurnAroundZ',
          _('Turn around Z axis'),
          _(
            "Turn the object around Z axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM2_° around Z axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D object'), '', false)
        .addParameter('behavior', _('Behavior'), 'Base3DBehavior')
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setFunctionName('turnAroundZ');
    }

    {
      const object = extension
        .addObject(
          'Model3DObject',
          _('3D Model'),
          _('An animated 3D model.'),
          'JsPlatform/Extensions/3d_model.svg',
          new gd.Model3DObjectConfiguration()
        )
        .setCategoryFullName(_('General'))
        // Effects are unsupported because the object is not rendered with PIXI.
        .addDefaultBehavior('ResizableCapability::ResizableBehavior')
        .addDefaultBehavior('ScalableCapability::ScalableBehavior')
        .addDefaultBehavior('FlippableCapability::FlippableBehavior')
        .addDefaultBehavior('AnimatableCapability::AnimatableBehavior')
        .addDefaultBehavior('Scene3D::Base3DBehavior')
        .markAsRenderedIn3D()
        .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
        .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject3DRenderer.js');

      // Properties expressions/conditions/actions:

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Z',
          _('Z (elevation)'),
          _('the Z position (the "elevation")'),
          _('the Z position'),
          _('Position'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setZ')
        .setGetter('getZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Depth',
          _('Depth (size on Z axis)'),
          _('the depth (size on Z axis)'),
          _('the depth'),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setDepth')
        .setGetter('getDepth');

      // Deprecated
      object
        .addScopedAction(
          'SetWidth',
          _('Width'),
          _('Change the width of an object.'),
          _('the width'),
          _('Size'),
          'res/actions/scaleWidth24_black.png',
          'res/actions/scaleWidth_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setWidth')
        .setGetter('getWidth');

      // Deprecated
      object
        .addScopedCondition(
          'Width',
          _('Width'),
          _('Compare the width of an object.'),
          _('the width'),
          _('Size'),
          'res/actions/scaleWidth24_black.png',
          'res/actions/scaleWidth_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardRelationalOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('getWidth');

      // Deprecated
      object
        .addScopedAction(
          'SetHeight',
          _('Height'),
          _('Change the height of an object.'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png',
          'res/actions/scaleHeight_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setHeight')
        .setGetter('getHeight');

      // Deprecated
      object
        .addScopedCondition(
          'Height',
          _('Height'),
          _('Compare the height of an object.'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png',
          'res/actions/scaleHeight_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardRelationalOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions()
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('getHeight');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Height',
          _('Height'),
          _('the height'),
          _('the height'),
          _('Size'),
          'res/actions/scaleHeight24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setHeight')
        .setGetter('getHeight');

      // Deprecated
      object
        .addScopedAction(
          'Scale',
          _('Scale'),
          _('Modify the scale of the specified object.'),
          _('the scale'),
          _('Size'),
          'res/actions/scale24_black.png',
          'res/actions/scale_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardOperatorParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScale')
        .setGetter('getScale');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleX',
          _('Scale on X axis'),
          _("the width's scale of an object"),
          _("the width's scale"),
          _('Size'),
          'res/actions/scaleWidth24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScaleX')
        .setGetter('getScaleX');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleY',
          _('Scale on Y axis'),
          _("the height's scale of an object"),
          _("the height's scale"),
          _('Size'),
          'res/actions/scaleHeight24_black.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .setHidden()
        .markAsAdvanced()
        .setFunctionName('setScaleY')
        .setGetter('getScaleY');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'ScaleZ',
          _('Scale on Z axis'),
          _("the depth's scale of an object"),
          _("the depth's scale"),
          _('Size'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Scale (1 by default)')
          )
        )
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('setScaleZ')
        .setGetter('getScaleZ');

      // Deprecated
      object
        .addScopedAction(
          'FlipX',
          _('Flip the object horizontally'),
          _('Flip the object horizontally'),
          _('Flip horizontally _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/actions/flipX24.png',
          'res/actions/flipX.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .setHidden()
        .markAsSimple()
        .setFunctionName('flipX');

      // Deprecated
      object
        .addScopedAction(
          'FlipY',
          _('Flip the object vertically'),
          _('Flip the object vertically'),
          _('Flip vertically _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/actions/flipY24.png',
          'res/actions/flipY.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .setHidden()
        .markAsSimple()
        .setFunctionName('flipY');

      // Deprecated
      object
        .addScopedAction(
          'FlipZ',
          _('Flip the object on Z'),
          _('Flip the object on Z axis'),
          _('Flip on Z axis _PARAM0_: _PARAM1_'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setHidden()
        .setFunctionName('flipZ');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedX',
          _('Horizontally flipped'),
          _('Check if the object is horizontally flipped'),
          _('_PARAM0_ is horizontally flipped'),
          _('Effects'),
          'res/actions/flipX24.png',
          'res/actions/flipX.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedX');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedY',
          _('Vertically flipped'),
          _('Check if the object is vertically flipped'),
          _('_PARAM0_ is vertically flipped'),
          _('Effects'),
          'res/actions/flipY24.png',
          'res/actions/flipY.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedY');

      // Deprecated
      object
        .addScopedCondition(
          'FlippedZ',
          _('Flipped on Z'),
          _('Check if the object is flipped on Z axis'),
          _('_PARAM0_ is flipped on Z axis'),
          _('Effects'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .setHidden()
        .setFunctionName('isFlippedZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'RotationX',
          _('Rotation on X axis'),
          _('the rotation on X axis'),
          _('the rotation on X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setRotationX')
        .setGetter('getRotationX');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'RotationY',
          _('Rotation on Y axis'),
          _('the rotation on Y axis'),
          _('the rotation on Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .setHidden()
        .setFunctionName('setRotationY')
        .setGetter('getRotationY');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundX',
          _('Turn around X axis'),
          _(
            "Turn the object around X axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around X axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundX');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundY',
          _('Turn around Y axis'),
          _(
            "Turn the object around Y axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around Y axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundY');

      // Deprecated
      object
        .addScopedAction(
          'TurnAroundZ',
          _('Turn around Z axis'),
          _(
            "Turn the object around Z axis. This axis doesn't move with the object rotation."
          ),
          _('Turn _PARAM0_ from _PARAM1_° around Z axis'),
          _('Angle'),
          'res/conditions/3d_box.svg',
          'res/conditions/3d_box.svg'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .addParameter('number', _('Rotation angle'), '', false)
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('turnAroundZ');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'Animation',
          _('Animation (by number)'),
          _(
            'the number of the animation played by the object (the number from the animations list)'
          ),
          _('the number of the animation'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
        .markAsSimple()
        .setHidden()
        .setFunctionName('setAnimationIndex')
        .setGetter('getAnimationIndex');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'string',
          'AnimationName',
          _('Animation (by name)'),
          _('the animation played by the object'),
          _('the animation'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'objectAnimationName',
          gd.ParameterOptions.makeNewOptions().setDescription(
            _('Animation name')
          )
        )
        .markAsAdvanced()
        .setHidden()
        .setFunctionName('setAnimationName')
        .setGetter('getAnimationName');

      // Deprecated
      object
        .addAction(
          'PauseAnimation',
          _('Pause the animation'),
          _('Pause the animation of the object'),
          _('Pause the animation of _PARAM0_'),
          _('Animations and images'),
          'res/actions/animation24.png',
          'res/actions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('pauseAnimation');

      // Deprecated
      object
        .addAction(
          'ResumeAnimation',
          _('Resume the animation'),
          _('Resume the animation of the object'),
          _('Resume the animation of _PARAM0_'),
          _('Animations and images'),
          'res/actions/animation24.png',
          'res/actions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('resumeAnimation');

      // Deprecated
      object
        .addExpressionAndConditionAndAction(
          'number',
          'AnimationSpeedScale',
          _('Animation speed scale'),
          _(
            'the animation speed scale (1 = the default speed, >1 = faster and <1 = slower)'
          ),
          _('the animation speed scale'),
          _('Animations and images'),
          'res/actions/animation24.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .useStandardParameters(
          'number',
          gd.ParameterOptions.makeNewOptions().setDescription(_('Speed scale'))
        )
        .markAsSimple()
        .setHidden()
        .setFunctionName('setAnimationSpeedScale')
        .setGetter('getAnimationSpeedScale');

      // Deprecated
      object
        .addCondition(
          'IsAnimationPaused',
          _('Animation paused'),
          _('Check if the animation of an object is paused.'),
          _('The animation of _PARAM0_ is paused'),
          _('Animations and images'),
          'res/conditions/animation24.png',
          'res/conditions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('isAnimationPaused');

      // Deprecated
      object
        .addCondition(
          'HasAnimationEnded',
          _('Animation finished'),
          _(
            'Check if the animation being played by the Sprite object is finished.'
          ),
          _('The animation of _PARAM0_ is finished'),
          _('Animations and images'),
          'res/conditions/animation24.png',
          'res/conditions/animation.png'
        )
        .addParameter('object', _('3D model'), 'Model3DObject', false)
        .markAsSimple()
        .setHidden()
        .setFunctionName('hasAnimationEnded');
    }

    const Cube3DObject = new gd.ObjectJsImplementation();
    Cube3DObject.updateProperty = function (propertyName, newValue) {
      const objectContent = this.content;
      if (
        propertyName === 'width' ||
        propertyName === 'height' ||
        propertyName === 'depth'
      ) {
        objectContent[propertyName] = parseFloat(newValue);
        return true;
      }
      if (
        propertyName === 'frontFaceResourceName' ||
        propertyName === 'backFaceResourceName' ||
        propertyName === 'leftFaceResourceName' ||
        propertyName === 'rightFaceResourceName' ||
        propertyName === 'topFaceResourceName' ||
        propertyName === 'bottomFaceResourceName' ||
        propertyName === 'backFaceUpThroughWhichAxisRotation' ||
        propertyName === 'facesOrientation' ||
        propertyName === 'materialType'
      ) {
        objectContent[propertyName] = newValue;
        return true;
      }
      if (
        propertyName === 'frontFaceVisible' ||
        propertyName === 'backFaceVisible' ||
        propertyName === 'leftFaceVisible' ||
        propertyName === 'rightFaceVisible' ||
        propertyName === 'topFaceVisible' ||
        propertyName === 'bottomFaceVisible' ||
        propertyName === 'frontFaceResourceRepeat' ||
        propertyName === 'backFaceResourceRepeat' ||
        propertyName === 'leftFaceResourceRepeat' ||
        propertyName === 'rightFaceResourceRepeat' ||
        propertyName === 'topFaceResourceRepeat' ||
        propertyName === 'bottomFaceResourceRepeat' ||
        propertyName === 'enableTextureTransparency'
      ) {
        objectContent[propertyName] = newValue === '1';
        return true;
      }

      return false;
    };
    Cube3DObject.getProperties = function () {
      const objectProperties = new gd.MapStringPropertyDescriptor();
      const objectContent = this.content;

      objectProperties
        .getOrCreate('enableTextureTransparency')
        .setValue(objectContent.enableTextureTransparency ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Enable texture transparency'))
        .setDescription(
          _(
            'Enabling texture transparency has an impact on rendering performance.'
          )
        )
        .setGroup(_('Texture settings'));

      objectProperties
        .getOrCreate('facesOrientation')
        .setValue(objectContent.facesOrientation || 'Y')
        .setType('choice')
        .addExtraInfo('Y')
        .addExtraInfo('Z')
        .setLabel(_('Faces orientation'))
        .setDescription(
          _(
            'The top of each image can touch the **top face** (Y) or the **front face** (Z).'
          )
        )
        .setGroup(_('Face orientation'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('width')
        .setValue((objectContent.width || 0).toString())
        .setType('number')
        .setLabel(_('Width'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));

      objectProperties
        .getOrCreate('height')
        .setValue((objectContent.height || 0).toString())
        .setType('number')
        .setLabel(_('Height'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));

      objectProperties
        .getOrCreate('depth')
        .setValue((objectContent.depth || 0).toString())
        .setType('number')
        .setLabel(_('Depth'))
        .setMeasurementUnit(gd.MeasurementUnit.getPixel())
        .setGroup(_('Default size'));

      objectProperties
        .getOrCreate('frontFaceResourceName')
        .setValue(objectContent.frontFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Front face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceName')
        .setValue(objectContent.backFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Back face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceUpThroughWhichAxisRotation')
        .setValue(objectContent.backFaceUpThroughWhichAxisRotation || 'X')
        .setType('choice')
        .addExtraInfo('X')
        .addExtraInfo('Y')
        .setLabel(_('Back face orientation'))
        .setDescription(
          _(
            'The top of the image can touch the **top face** (Y) or the **bottom face** (X).'
          )
        )
        .setGroup(_('Face orientation'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('leftFaceResourceName')
        .setValue(objectContent.leftFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Left face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceName')
        .setValue(objectContent.rightFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Right face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceName')
        .setValue(objectContent.topFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Top face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceName')
        .setValue(objectContent.bottomFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bottom face'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceResourceRepeat')
        .setValue(objectContent.frontFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceRepeat')
        .setValue(objectContent.backFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('leftFaceResourceRepeat')
        .setValue(objectContent.leftFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceRepeat')
        .setValue(objectContent.rightFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceRepeat')
        .setValue(objectContent.topFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceRepeat')
        .setValue(objectContent.bottomFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceVisible')
        .setValue(objectContent.frontFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Front face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('backFaceVisible')
        .setValue(objectContent.backFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Back face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('leftFaceVisible')
        .setValue(objectContent.leftFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Left face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('rightFaceVisible')
        .setValue(objectContent.rightFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Right face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('topFaceVisible')
        .setValue(objectContent.topFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Top face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('bottomFaceVisible')
        .setValue(objectContent.bottomFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Bottom face'))
        .setGroup(_('Face visibility'))
        .setAdvanced(true);

      objectProperties
        .getOrCreate('materialType')
        .setValue(objectContent.materialType || 'Basic')
        .setType('choice')
        .addExtraInfo('Basic')
        .addExtraInfo('StandardWithoutMetalness')
        .setLabel(_('Material type'));

      return objectProperties;
    };
    Cube3DObject.content = {
      width: 100,
      height: 100,
      depth: 100,
      enableTextureTransparency: false,
      facesOrientation: 'Y',
      frontFaceResourceName: '',
      backFaceResourceName: '',
      backFaceUpThroughWhichAxisRotation: 'X',
      leftFaceResourceName: '',
      rightFaceResourceName: '',
      topFaceResourceName: '',
      bottomFaceResourceName: '',
      frontFaceVisible: true,
      backFaceVisible: false,
      leftFaceVisible: true,
      rightFaceVisible: true,
      topFaceVisible: true,
      bottomFaceVisible: true,
      frontFaceResourceRepeat: false,
      backFaceResourceRepeat: false,
      leftFaceResourceRepeat: false,
      rightFaceResourceRepeat: false,
      topFaceResourceRepeat: false,
      bottomFaceResourceRepeat: false,
      materialType: 'Basic',
    };

    Cube3DObject.updateInitialInstanceProperty = function (
      instance,
      propertyName,
      newValue
    ) {
      return false;
    };

    Cube3DObject.getInitialInstanceProperties = function (instance) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'Cube3DObject',
        _('3D Box'),
        _('A box with images for each face'),
        'JsPlatform/Extensions/3d_box.svg',
        Cube3DObject
      )
      .setCategoryFullName(_('General'))
      // Effects are unsupported because the object is not rendered with PIXI.
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior')
      .addDefaultBehavior('FlippableCapability::FlippableBehavior')
      .addDefaultBehavior('Scene3D::Base3DBehavior')
      .markAsRenderedIn3D()
      .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
      .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObject.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObjectPixiRenderer.js');

    // Properties expressions/conditions/actions:

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Z',
        _('Z (elevation)'),
        _('the Z position (the "elevation")'),
        _('the Z position'),
        _('Position'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setHidden()
      .setFunctionName('setZ')
      .setGetter('getZ');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Depth',
        _('Depth (size on Z axis)'),
        _('the depth (size on Z axis)'),
        _('the depth'),
        _('Size'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setHidden()
      .setFunctionName('setDepth')
      .setGetter('getDepth');

    // Deprecated
    object
      .addScopedAction(
        'SetWidth',
        _('Width'),
        _('Change the width of an object.'),
        _('the width'),
        _('Size'),
        'res/actions/scaleWidth24_black.png',
        'res/actions/scaleWidth_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setWidth')
      .setGetter('getWidth');

    // Deprecated
    object
      .addScopedCondition(
        'Width',
        _('Width'),
        _('Compare the width of an object.'),
        _('the width'),
        _('Size'),
        'res/actions/scaleWidth24_black.png',
        'res/actions/scaleWidth_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('getWidth');

    // Deprecated
    object
      .addScopedAction(
        'SetHeight',
        _('Height'),
        _('Change the height of an object.'),
        _('the height'),
        _('Size'),
        'res/actions/scaleHeight24_black.png',
        'res/actions/scaleHeight_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setHeight')
      .setGetter('getHeight');

    // Deprecated
    object
      .addScopedCondition(
        'Height',
        _('Height'),
        _('Compare the height of an object.'),
        _('the height'),
        _('Size'),
        'res/actions/scaleHeight24_black.png',
        'res/actions/scaleHeight_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardRelationalOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions()
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('getHeight');

    // Deprecated
    object
      .addScopedAction(
        'Scale',
        _('Scale'),
        _('Modify the scale of the specified object.'),
        _('the scale'),
        _('Size'),
        'res/actions/scale24_black.png',
        'res/actions/scale_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardOperatorParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScale')
      .setGetter('getScale');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleX',
        _('Scale on X axis'),
        _("the width's scale of an object"),
        _("the width's scale"),
        _('Size'),
        'res/actions/scaleWidth24_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScaleX')
      .setGetter('getScaleX');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleY',
        _('Scale on Y axis'),
        _("the height's scale of an object"),
        _("the height's scale"),
        _('Size'),
        'res/actions/scaleHeight24_black.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
      .markAsAdvanced()
      .setFunctionName('setScaleY')
      .setGetter('getScaleY');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'ScaleZ',
        _('Scale on Z axis'),
        _("the depth's scale of an object"),
        _("the depth's scale"),
        _('Size'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('setScaleZ')
      .setGetter('getScaleZ');

    // Deprecated
    object
      .addScopedAction(
        'FlipX',
        _('Flip the object horizontally'),
        _('Flip the object horizontally'),
        _('Flip horizontally _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/actions/flipX24.png',
        'res/actions/flipX.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipX');

    // Deprecated
    object
      .addScopedAction(
        'FlipY',
        _('Flip the object vertically'),
        _('Flip the object vertically'),
        _('Flip vertically _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/actions/flipY24.png',
        'res/actions/flipY.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipY');

    // Deprecated
    object
      .addScopedAction(
        'FlipZ',
        _('Flip the object on Z'),
        _('Flip the object on Z axis'),
        _('Flip on Z axis _PARAM0_: _PARAM1_'),
        _('Effects'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setHidden()
      .setFunctionName('flipZ');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedX',
        _('Horizontally flipped'),
        _('Check if the object is horizontally flipped'),
        _('_PARAM0_ is horizontally flipped'),
        _('Effects'),
        'res/actions/flipX24.png',
        'res/actions/flipX.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedX');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedY',
        _('Vertically flipped'),
        _('Check if the object is vertically flipped'),
        _('_PARAM0_ is vertically flipped'),
        _('Effects'),
        'res/actions/flipY24.png',
        'res/actions/flipY.png'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedY');

    // Deprecated
    object
      .addScopedCondition(
        'FlippedZ',
        _('Flipped on Z'),
        _('Check if the object is flipped on Z axis'),
        _('_PARAM0_ is flipped on Z axis'),
        _('Effects'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .setHidden()
      .setFunctionName('isFlippedZ');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'RotationX',
        _('Rotation on X axis'),
        _('the rotation on X axis'),
        _('the rotation on X axis'),
        _('Angle'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setRotationX')
      .setHidden()
      .setGetter('getRotationX');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'RotationY',
        _('Rotation on Y axis'),
        _('the rotation on Y axis'),
        _('the rotation on Y axis'),
        _('Angle'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setRotationY')
      .setHidden()
      .setGetter('getRotationY');

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'FaceVisibility',
        _('Face visibility'),
        _('a face should be visible'),
        _('having its _PARAM1_ face visible'),
        _('Face'),
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter(
        'stringWithSelector',
        _('Face'),
        JSON.stringify(['front', 'back', 'left', 'right', 'top', 'bottom']),
        false
      )
      .useStandardParameters(
        'boolean',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Visible?'))
      )
      .setFunctionName('setFaceVisibility')
      .setGetter('isFaceVisible');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundX',
        _('Turn around X axis'),
        _(
          "Turn the object around X axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around X axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundX');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundY',
        _('Turn around Y axis'),
        _(
          "Turn the object around Y axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around Y axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundY');

    // Deprecated
    object
      .addScopedAction(
        'TurnAroundZ',
        _('Turn around Z axis'),
        _(
          "Turn the object around Z axis. This axis doesn't move with the object rotation."
        ),
        _('Turn _PARAM0_ from _PARAM1_° around Z axis'),
        _('Angle'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter('number', _('Rotation angle'), '', false)
      .markAsAdvanced()
      .setHidden()
      .setFunctionName('turnAroundZ');

    object
      .addScopedAction(
        'SetFaceResource',
        _('Face image'),
        _('Change the image of the face.'),
        _('Change the image of _PARAM1_ face of _PARAM0_ to _PARAM2_'),
        _('Face'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addParameter('object', _('3D cube'), 'Cube3DObject', false)
      .addParameter(
        'stringWithSelector',
        _('Face'),
        JSON.stringify(['front', 'back', 'left', 'right', 'top', 'bottom']),
        false
      )
      .addParameter('imageResource', _('Image'), '', false)
      .setFunctionName('setFaceResourceName');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraZ',
        _('Camera Z position'),
        _('the camera position on Z axis'),
        _('the camera position on Z axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraZ')
      .setGetter('gdjs.scene3d.camera.getCameraZ')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationX',
        _('Camera X rotation'),
        _('the camera rotation on X axis'),
        _('the camera rotation on X axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraRotationX')
      .setGetter('gdjs.scene3d.camera.getCameraRotationX')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationY',
        _('Camera Y rotation'),
        _('the camera rotation on Y axis'),
        _('the camera rotation on Y axis'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Angle (in degrees)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setCameraRotationY')
      .setGetter('gdjs.scene3d.camera.getCameraRotationY')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addAction(
        'TurnCameraTowardObject',
        _('Look at an object'),
        _(
          'Change the camera rotation to look at an object. The camera top always face the screen.'
        ),
        _('Change the camera rotation of _PARAM2_ to look at _PARAM1_'),
        _('Layers and cameras'),
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('objectPtr', _('Object'), '')
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Stand on Y instead of Z'), '', true)
      .setDefaultValue('false')
      .setFunctionName('gdjs.scene3d.camera.turnCameraTowardObject')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addAction(
        'TurnCameraTowardPosition',
        _('Look at a position'),
        _(
          'Change the camera rotation to look at a position. The camera top always face the screen.'
        ),
        _(
          'Change the camera rotation of _PARAM4_ to look at _PARAM1_; _PARAM2_; _PARAM3_'
        ),
        '',
        'res/conditions/3d_box.svg',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .addParameter('number', _('X position'))
      .addParameter('number', _('Y position'))
      .addParameter('number', _('Z position'))
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .addParameter('yesorno', _('Stand on Y instead of Z'), '', true)
      .setDefaultValue('false')
      .setFunctionName('gdjs.scene3d.camera.turnCameraTowardPosition')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraNearPlane',
        _('Camera near plane'),
        _('the camera near plane distance'),
        _('the camera near plane distance'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Distance (> 0)'))
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setNearPlane')
      .setGetter('gdjs.scene3d.camera.getNearPlane')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFarPlane',
        _('Camera far plane'),
        _('the camera far plane distance'),
        _('the camera far plane distance'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Distance (> 0)'))
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setFarPlane')
      .setGetter('gdjs.scene3d.camera.getFarPlane')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFov',
        _('Camera field of view (fov)'),
        _('the camera field of view'),
        _('the camera field of view'),
        '',
        'res/conditions/3d_box.svg'
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Field of view in degrees (between 0° and 180°)')
        )
      )
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.scene3d.camera.setFov')
      .setGetter('gdjs.scene3d.camera.getFov')
      .setIncludeFile('Extensions/3D/Scene3DTools.js');

    {
      const effect = extension
        .addEffect('LinearFog')
        .setFullName(_('Fog (linear)'))
        .setDescription(_('Linear fog for 3D objects.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/LinearFog.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Fog color'))
        .setType('color');
      properties
        .getOrCreate('near')
        .setValue('200')
        .setLabel(_('Distance where the fog starts'))
        .setType('number');
      properties
        .getOrCreate('far')
        .setValue('2000')
        .setLabel(_('Distance where the fog is fully opaque'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('ExponentialFog')
        .setFullName(_('Fog (exponential)'))
        .setDescription(_('Exponential fog for 3D objects.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/ExponentialFog.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Fog color'))
        .setType('color');
      properties
        .getOrCreate('density')
        .setValue('0.0012')
        .setLabel(_('Density'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('AmbientLight')
        .setFullName(_('Ambient light'))
        .setDescription(
          _('A light that illuminates all objects from every direction.')
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/AmbientLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.75')
        .setLabel(_('Intensity'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('DirectionalLight')
        .setFullName(_('Directional light'))
        .setDescription(_('A very far light source like the sun.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/DirectionalLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('color')
        .setValue('255;255;255')
        .setLabel(_('Light color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.5')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Y-')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Y-')
        .addExtraInfo('Z+')
        .setGroup(_('Orientation'));
      properties
        .getOrCreate('elevation')
        .setValue('45')
        .setLabel(_('Elevation (in degrees)'))
        .setType('number')
        .setGroup(_('Orientation'))
        .setDescription(_('Maximal elevation is reached at 90°.'));
      properties
        .getOrCreate('rotation')
        .setValue('0')
        .setLabel(_('Rotation (in degrees)'))
        .setType('number')
        .setGroup(_('Orientation'));
    }
    {
      const effect = extension
        .addEffect('HemisphereLight')
        .setFullName(_('Hemisphere light'))
        .setDescription(
          _(
            'A light that illuminates objects from every direction with a gradient.'
          )
        )
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/HemisphereLight.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('skyColor')
        .setValue('255;255;255')
        .setLabel(_('Sky color'))
        .setType('color');
      properties
        .getOrCreate('groundColor')
        .setValue('127;127;127')
        .setLabel(_('Ground color'))
        .setType('color');
      properties
        .getOrCreate('intensity')
        .setValue('0.5')
        .setLabel(_('Intensity'))
        .setType('number');
      properties
        .getOrCreate('top')
        .setValue('Y-')
        .setLabel(_('3D world top'))
        .setType('choice')
        .addExtraInfo('Y-')
        .addExtraInfo('Z+')
        .setGroup(_('Orientation'));
      properties
        .getOrCreate('elevation')
        .setValue('90')
        .setLabel(_('Elevation (in degrees)'))
        .setType('number')
        .setGroup(_('Orientation'))
        .setDescription(_('Maximal elevation is reached at 90°.'));
      properties
        .getOrCreate('rotation')
        .setValue('0')
        .setLabel(_('Rotation (in degrees)'))
        .setType('number')
        .setGroup(_('Orientation'));
    }
    {
      const effect = extension
        .addEffect('HueAndSaturation')
        .setFullName(_('Hue and saturation'))
        .setDescription(_('Adjust hue and saturation.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/HueAndSaturationEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('hue')
        .setValue('0')
        .setLabel(_('Hue in degrees (between -180 and 180)'))
        .setType('number');
      properties
        .getOrCreate('saturation')
        .setValue('0')
        .setLabel(_('Saturation (between -1 and 1)'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('Exposure')
        .setFullName(_('Exposure'))
        .setDescription(_('Adjust exposure.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/ExposureEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('exposure')
        .setValue('1')
        .setLabel(_('Exposure (positive value)'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('Bloom')
        .setFullName(_('Bloom'))
        .setDescription(_('Apply a bloom effect.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/BloomEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('strength')
        .setValue('1')
        .setLabel(_('Strength (between 0 and 3)'))
        .setType('number');
      properties
        .getOrCreate('radius')
        .setValue('0')
        .setLabel(_('Radius (between 0 and 1)'))
        .setType('number');
      properties
        .getOrCreate('threshold')
        .setValue('0')
        .setLabel(_('Threshold (between 0 and 1)'))
        .setType('number');
    }
    {
      const effect = extension
        .addEffect('BrightnessAndContrast')
        .setFullName(_('Brightness and contrast.'))
        .setDescription(_('Adjust brightness and contrast.'))
        .markAsNotWorkingForObjects()
        .markAsOnlyWorkingFor3D()
        .addIncludeFile('Extensions/3D/BrightnessAndContrastEffect.js');
      const properties = effect.getProperties();
      properties
        .getOrCreate('brightness')
        .setValue('0')
        .setLabel(_('Brightness (between -1 and 1)'))
        .setType('number');
      properties
        .getOrCreate('contrast')
        .setValue('0')
        .setLabel(_('Contrast (between -1 and 1)'))
        .setType('number');
    }
    // Don't forget to update the alert condition in Model3DEditor.js when
    // adding a new light.

    return extension;
  },
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instantiating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array.
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function (gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (objectsEditorService) {},
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const Rendered3DInstance = objectsRenderingService.Rendered3DInstance;
    const PIXI = objectsRenderingService.PIXI;
    const THREE = objectsRenderingService.THREE;
    const THREE_ADDONS = objectsRenderingService.THREE_ADDONS;

    const materialIndexToFaceIndex = {
      0: 3,
      1: 2,
      2: 5,
      3: 4,
      4: 0,
      5: 1,
    };

    const noRepeatTextureVertexIndexToUvMapping = {
      0: [0, 0],
      1: [1, 0],
      2: [0, 1],
      3: [1, 1],
    };

    const noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ = {
      0: [0, 1],
      1: [0, 0],
      2: [1, 1],
      3: [1, 0],
    };

    const getFirstVisibleFaceResourceName = (objectConfiguration) => {
      const object = gd.castObject(
        objectConfiguration,
        gd.ObjectJsImplementation
      );

      const orderedFaces = [
        ['frontFaceVisible', 'frontFaceResourceName'],
        ['backFaceVisible', 'backFaceResourceName'],
        ['leftFaceVisible', 'leftFaceResourceName'],
        ['rightFaceVisible', 'rightFaceResourceName'],
        ['topFaceVisible', 'topFaceResourceName'],
        ['bottomFaceVisible', 'bottomFaceResourceName'],
      ];

      for (const [
        faceVisibleProperty,
        faceResourceNameProperty,
      ] of orderedFaces) {
        if (object.content[faceVisibleProperty]) {
          const textureResource = object.content[faceResourceNameProperty];
          if (textureResource) return textureResource;
        }
      }

      return null;
    };

    let transparentMaterial = null;
    const getTransparentMaterial = () => {
      if (!transparentMaterial)
        transparentMaterial = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          // Set the alpha test to to ensure the faces behind are rendered
          // (no "back face culling" that would still be done if alphaTest is not set).
          alphaTest: 1,
        });

      return transparentMaterial;
    };

    class RenderedCube3DObject2DInstance extends RenderedInstance {
      /** @type {number} */
      _centerX = 0;
      /** @type {number} */
      _centerY = 0;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // Name of the resource that is rendered.
        // If no face is visible, this will be null.
        this._renderedResourceName = undefined;

        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );
        this._defaultWidth = object.content.width;
        this._defaultHeight = object.content.height;
        this._defaultDepth = object.content.depth;

        this._pixiObject = new PIXI.Container();
        this._pixiFallbackObject = new PIXI.Graphics();
        this._pixiTexturedObject = new PIXI.Sprite(
          this._pixiResourcesLoader.getInvalidPIXITexture()
        );
        this._pixiObject.addChild(this._pixiTexturedObject);
        this._pixiObject.addChild(this._pixiFallbackObject);
        this._pixiContainer.addChild(this._pixiObject);
        this._renderFallbackObject = false;
        this.updateTexture();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        // Keep textures because they are shared by all sprites.
        this._pixiObject.destroy({ children: true });
      }

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        const textureResourceName = RenderedCube3DObject2DInstance._getResourceNameToDisplay(
          objectConfiguration
        );
        if (textureResourceName) {
          return resourcesLoader.getResourceFullUrl(
            project,
            textureResourceName,
            {}
          );
        }
        return 'JsPlatform/Extensions/3d_box.svg';
      }

      updateTextureIfNeeded() {
        const textureName = RenderedCube3DObject2DInstance._getResourceNameToDisplay(
          this._associatedObjectConfiguration
        );
        if (textureName === this._renderedResourceName) return;

        this.updateTexture();
      }

      updateTexture() {
        const textureName = RenderedCube3DObject2DInstance._getResourceNameToDisplay(
          this._associatedObjectConfiguration
        );

        if (!textureName) {
          this._renderFallbackObject = true;
          this._renderedResourceName = null;
        } else {
          const texture = this._pixiResourcesLoader.getPIXITexture(
            this._project,
            textureName
          );
          this._pixiTexturedObject.texture = texture;
          this._centerX = texture.frame.width / 2;
          this._centerY = texture.frame.height / 2;
          this._renderedResourceName = textureName;

          if (!texture.baseTexture.valid) {
            // Post pone texture update if texture is not loaded.
            texture.once('update', () => {
              if (this._wasDestroyed) return;

              this.updateTexture();
              this.updatePIXISprite();
            });
            return;
          }
        }
      }

      updatePIXISprite() {
        const width = this.getWidth();
        const height = this.getHeight();
        const objectTextureFrame = this._pixiTexturedObject.texture.frame;
        // In case the texture is not loaded yet, we don't want to crash.
        if (!objectTextureFrame) return;

        this._pixiTexturedObject.anchor.x =
          this._centerX / objectTextureFrame.width;
        this._pixiTexturedObject.anchor.y =
          this._centerY / objectTextureFrame.height;

        this._pixiTexturedObject.angle = this._instance.getAngle();
        const scaleX =
          (width / objectTextureFrame.width) *
          (this._instance.isFlippedX() ? -1 : 1);
        const scaleY =
          (height / objectTextureFrame.height) *
          (this._instance.isFlippedY() ? -1 : 1);
        this._pixiTexturedObject.scale.x = scaleX;
        this._pixiTexturedObject.scale.y = scaleY;

        this._pixiTexturedObject.position.x =
          this._instance.getX() +
          this._centerX * Math.abs(this._pixiTexturedObject.scale.x);
        this._pixiTexturedObject.position.y =
          this._instance.getY() +
          this._centerY * Math.abs(this._pixiTexturedObject.scale.y);
      }

      updateFallbackObject() {
        const width = this.getWidth();
        const height = this.getHeight();

        this._pixiFallbackObject.clear();
        this._pixiFallbackObject.beginFill(0x0033ff);
        this._pixiFallbackObject.lineStyle(1, 0xffd900, 1);
        this._pixiFallbackObject.moveTo(-width / 2, -height / 2);
        this._pixiFallbackObject.lineTo(width / 2, -height / 2);
        this._pixiFallbackObject.lineTo(width / 2, height / 2);
        this._pixiFallbackObject.lineTo(-width / 2, height / 2);
        this._pixiFallbackObject.endFill();

        this._pixiFallbackObject.position.x = this._instance.getX() + width / 2;
        this._pixiFallbackObject.position.y =
          this._instance.getY() + height / 2;
        this._pixiFallbackObject.angle = this._instance.getAngle();

        if (this._instance.isFlippedX()) this._pixiFallbackObject.scale.x = -1;
        if (this._instance.isFlippedY()) this._pixiFallbackObject.scale.y = -1;
      }

      update() {
        this.updateTextureIfNeeded();

        this._pixiFallbackObject.visible = this._renderFallbackObject;
        this._pixiTexturedObject.visible = !this._renderFallbackObject;

        if (this._renderFallbackObject) {
          this.updateFallbackObject();
        } else {
          this.updatePIXISprite();
        }
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }

      getCenterX() {
        if (this._renderFallbackObject) {
          return this.getWidth() / 2;
        } else {
          return this._centerX * this._pixiTexturedObject.scale.x;
        }
      }

      getCenterY() {
        if (this._renderFallbackObject) {
          return this.getHeight() / 2;
        } else {
          return this._centerY * this._pixiTexturedObject.scale.y;
        }
      }
    }

    class RenderedCube3DObject3DInstance extends Rendered3DInstance {
      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );

        this._defaultWidth = 1;
        this._defaultHeight = 1;
        this._defaultDepth = 1;

        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._faceResourceNames = new Array(6).fill(null);
        this._faceVisibilities = new Array(6).fill(null);
        this._shouldRepeatTextureOnFace = new Array(6).fill(null);
        this._facesOrientation = 'Y';
        this._backFaceUpThroughWhichAxisRotation = 'X';
        this._shouldUseTransparentTexture = false;

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materials = [
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
          getTransparentMaterial(),
        ];
        this._threeObject = new THREE.Mesh(geometry, materials);
        this._threeObject.rotation.order = 'ZYX';
        this._threeGroup.add(this._threeObject);

        this.updateThreeObject();
      }

      async _updateThreeObjectMaterials() {
        const getFaceMaterial = async (project, faceIndex) => {
          if (!this._faceVisibilities[faceIndex])
            return getTransparentMaterial();

          return await this._pixiResourcesLoader.getThreeMaterial(
            project,
            this._faceResourceNames[faceIndex],
            {
              useTransparentTexture: this._shouldUseTransparentTexture,
            }
          );
        };

        const materials = await Promise.all([
          getFaceMaterial(this._project, materialIndexToFaceIndex[0]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[1]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[2]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[3]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[4]),
          getFaceMaterial(this._project, materialIndexToFaceIndex[5]),
        ]);
        if (this._wasDestroyed) return;

        this._threeObject.material[0] = materials[0];
        this._threeObject.material[1] = materials[1];
        this._threeObject.material[2] = materials[2];
        this._threeObject.material[3] = materials[3];
        this._threeObject.material[4] = materials[4];
        this._threeObject.material[5] = materials[5];

        this._updateTextureUvMapping();
      }

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      updateThreeObject() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.ObjectJsImplementation
        );

        this._defaultWidth = object.content.width;
        this._defaultHeight = object.content.height;
        this._defaultDepth = object.content.depth;

        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();

        this._threeObject.position.set(
          this._instance.getX() + width / 2,
          this._instance.getY() + height / 2,
          this._instance.getZ() + depth / 2
        );

        this._threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );

        let materialsDirty = false;
        let uvMappingDirty = false;

        const shouldUseTransparentTexture =
          object.content.enableTextureTransparency;
        if (this._shouldUseTransparentTexture !== shouldUseTransparentTexture) {
          this._shouldUseTransparentTexture = shouldUseTransparentTexture;
          materialsDirty = true;
        }

        const faceResourceNames = [
          object.content.frontFaceResourceName,
          object.content.backFaceResourceName,
          object.content.leftFaceResourceName,
          object.content.rightFaceResourceName,
          object.content.topFaceResourceName,
          object.content.bottomFaceResourceName,
        ];
        if (
          this._faceResourceNames[0] !== faceResourceNames[0] ||
          this._faceResourceNames[1] !== faceResourceNames[1] ||
          this._faceResourceNames[2] !== faceResourceNames[2] ||
          this._faceResourceNames[3] !== faceResourceNames[3] ||
          this._faceResourceNames[4] !== faceResourceNames[4] ||
          this._faceResourceNames[5] !== faceResourceNames[5]
        ) {
          this._faceResourceNames = faceResourceNames;
          materialsDirty = true;
        }

        const faceVisibilities = [
          object.content.frontFaceVisible,
          object.content.backFaceVisible,
          object.content.leftFaceVisible,
          object.content.rightFaceVisible,
          object.content.topFaceVisible,
          object.content.bottomFaceVisible,
        ];
        if (
          this._faceVisibilities[0] !== faceVisibilities[0] ||
          this._faceVisibilities[1] !== faceVisibilities[1] ||
          this._faceVisibilities[2] !== faceVisibilities[2] ||
          this._faceVisibilities[3] !== faceVisibilities[3] ||
          this._faceVisibilities[4] !== faceVisibilities[4] ||
          this._faceVisibilities[5] !== faceVisibilities[5]
        ) {
          this._faceVisibilities = faceVisibilities;
          materialsDirty = true;
          uvMappingDirty = true;
        }

        const shouldRepeatTextureOnFace = [
          object.content.frontFaceResourceRepeat,
          object.content.backFaceResourceRepeat,
          object.content.leftFaceResourceRepeat,
          object.content.rightFaceResourceRepeat,
          object.content.topFaceResourceRepeat,
          object.content.bottomFaceResourceRepeat,
        ];
        if (
          this._shouldRepeatTextureOnFace[0] !== shouldRepeatTextureOnFace[0] ||
          this._shouldRepeatTextureOnFace[1] !== shouldRepeatTextureOnFace[1] ||
          this._shouldRepeatTextureOnFace[2] !== shouldRepeatTextureOnFace[2] ||
          this._shouldRepeatTextureOnFace[3] !== shouldRepeatTextureOnFace[3] ||
          this._shouldRepeatTextureOnFace[4] !== shouldRepeatTextureOnFace[4] ||
          this._shouldRepeatTextureOnFace[5] !== shouldRepeatTextureOnFace[5]
        ) {
          this._shouldRepeatTextureOnFace = shouldRepeatTextureOnFace;
          uvMappingDirty = true;
        }

        const backFaceUpThroughWhichAxisRotation =
          object.content.backFaceUpThroughWhichAxisRotation;
        if (
          backFaceUpThroughWhichAxisRotation !==
          this._backFaceUpThroughWhichAxisRotation
        ) {
          this._backFaceUpThroughWhichAxisRotation = backFaceUpThroughWhichAxisRotation;
          uvMappingDirty = true;
        }

        const facesOrientation = object.content.facesOrientation;
        if (facesOrientation !== this._facesOrientation) {
          this._facesOrientation = facesOrientation;
          uvMappingDirty = true;
        }

        const scaleX = width * (this._instance.isFlippedX() ? -1 : 1);
        const scaleY = height * (this._instance.isFlippedY() ? -1 : 1);
        const scaleZ = depth * (this._instance.isFlippedZ() ? -1 : 1);
        if (
          scaleX !== this._threeObject.scale.x ||
          scaleY !== this._threeObject.scale.y ||
          scaleZ !== this._threeObject.scale.z
        ) {
          this._threeObject.scale.set(scaleX, scaleY, scaleZ);
          uvMappingDirty = true;
        }

        if (materialsDirty) this._updateThreeObjectMaterials();
        if (uvMappingDirty) this._updateTextureUvMapping();
      }

      /**
       * Updates the UV mapping of the geometry in order to repeat a material
       * over the different faces of the cube.
       * The mesh must be configured with a list of materials in order
       * for the method to work.
       */
      _updateTextureUvMapping() {
        // @ts-ignore - position is stored as a Float32BufferAttribute
        /** @type {THREE.BufferAttribute} */
        const pos = this._threeObject.geometry.getAttribute('position');
        // @ts-ignore - uv is stored as a Float32BufferAttribute
        /** @type {THREE.BufferAttribute} */
        const uvMapping = this._threeObject.geometry.getAttribute('uv');
        const startIndex = 0;
        const endIndex = 23;
        for (
          let vertexIndex = startIndex;
          vertexIndex <= endIndex;
          vertexIndex++
        ) {
          const materialIndex = Math.floor(
            vertexIndex /
              // Each face of the cube has 4 points
              4
          );
          const material = this._threeObject.material[materialIndex];
          if (!material || !material.map) {
            continue;
          }

          const shouldRepeatTexture = this._shouldRepeatTextureOnFace[
            materialIndexToFaceIndex[materialIndex]
          ];

          const shouldOrientateFacesTowardsY = this._facesOrientation === 'Y';

          let x = 0;
          let y = 0;
          switch (materialIndex) {
            case 0:
              // Right face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    -(
                      this._threeObject.scale.z / material.map.source.data.width
                    ) *
                    (pos.getZ(vertexIndex) - 0.5);
                  y =
                    -(
                      this._threeObject.scale.y /
                      material.map.source.data.height
                    ) *
                    (pos.getY(vertexIndex) + 0.5);
                } else {
                  x =
                    -(
                      this._threeObject.scale.y / material.map.source.data.width
                    ) *
                    (pos.getY(vertexIndex) - 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                if (shouldOrientateFacesTowardsY) {
                  [x, y] = noRepeatTextureVertexIndexToUvMapping[
                    vertexIndex % 4
                  ];
                } else {
                  [
                    x,
                    y,
                  ] = noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                    vertexIndex % 4
                  ];
                }
              }
              break;
            case 1:
              // Left face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    (this._threeObject.scale.z /
                      material.map.source.data.width) *
                    (pos.getZ(vertexIndex) + 0.5);
                  y =
                    -(
                      this._threeObject.scale.y /
                      material.map.source.data.height
                    ) *
                    (pos.getY(vertexIndex) + 0.5);
                } else {
                  x =
                    (this._threeObject.scale.y /
                      material.map.source.data.width) *
                    (pos.getY(vertexIndex) + 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                if (shouldOrientateFacesTowardsY) {
                  [x, y] = noRepeatTextureVertexIndexToUvMapping[
                    vertexIndex % 4
                  ];
                } else {
                  [
                    x,
                    y,
                  ] = noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
                    vertexIndex % 4
                  ];
                  x = -x;
                  y = -y;
                }
              }
              break;
            case 2:
              // Bottom face
              if (shouldRepeatTexture) {
                x =
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) + 0.5);
                y =
                  (this._threeObject.scale.z /
                    material.map.source.data.height) *
                  (pos.getZ(vertexIndex) - 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              }
              break;
            case 3:
              // Top face
              if (shouldRepeatTexture) {
                if (shouldOrientateFacesTowardsY) {
                  x =
                    (this._threeObject.scale.x /
                      material.map.source.data.width) *
                    (pos.getX(vertexIndex) + 0.5);
                  y =
                    -(
                      this._threeObject.scale.z /
                      material.map.source.data.height
                    ) *
                    (pos.getZ(vertexIndex) + 0.5);
                } else {
                  x =
                    -(
                      this._threeObject.scale.x / material.map.source.data.width
                    ) *
                    (pos.getX(vertexIndex) - 0.5);
                  y =
                    (this._threeObject.scale.z /
                      material.map.source.data.height) *
                    (pos.getZ(vertexIndex) - 0.5);
                }
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                if (!shouldOrientateFacesTowardsY) {
                  x = -x;
                  y = -y;
                }
              }
              break;
            case 4:
              // Front face
              if (shouldRepeatTexture) {
                x =
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) + 0.5);
                y =
                  -(
                    this._threeObject.scale.y / material.map.source.data.height
                  ) *
                  (pos.getY(vertexIndex) + 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
              }
              break;
            case 5:
              // Back face
              const shouldBackFaceBeUpThroughXAxisRotation =
                this._backFaceUpThroughWhichAxisRotation === 'X';

              if (shouldRepeatTexture) {
                x =
                  (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                  (this._threeObject.scale.x / material.map.source.data.width) *
                  (pos.getX(vertexIndex) +
                    (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) * 0.5);
                y =
                  (shouldBackFaceBeUpThroughXAxisRotation ? 1 : -1) *
                  (this._threeObject.scale.y /
                    material.map.source.data.height) *
                  (pos.getY(vertexIndex) +
                    (shouldBackFaceBeUpThroughXAxisRotation ? -1 : 1) * 0.5);
              } else {
                [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                if (shouldBackFaceBeUpThroughXAxisRotation) {
                  x = -x;
                  y = -y;
                }
              }
              break;
            default:
              [x, y] = noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
          }
          uvMapping.setXY(vertexIndex, x, y);
        }
        uvMapping.needsUpdate = true;
      }

      updatePixiObject() {
        const width = this.getWidth();
        const height = this.getHeight();

        this._pixiObject.clear();
        this._pixiObject.beginFill(0x999999, 0.2);
        this._pixiObject.lineStyle(1, 0xffd900, 0);
        this._pixiObject.moveTo(-width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, height / 2);
        this._pixiObject.lineTo(-width / 2, height / 2);
        this._pixiObject.endFill();

        this._pixiObject.position.x = this._instance.getX() + width / 2;
        this._pixiObject.position.y = this._instance.getY() + height / 2;
        this._pixiObject.angle = this._instance.getAngle();
      }

      update() {
        this.updatePixiObject();
        this.updateThreeObject();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'Scene3D::Cube3DObject',
      RenderedCube3DObject2DInstance
    );
    objectsRenderingService.registerInstance3DRenderer(
      'Scene3D::Cube3DObject',
      RenderedCube3DObject3DInstance
    );

    const epsilon = 1 / (1 << 16);

    class Model3DRendered2DInstance extends RenderedInstance {
      _modelOriginPoint = [0, 0, 0];

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.Model3DObjectConfiguration
        );

        this._defaultWidth = object.getWidth();
        this._defaultHeight = object.getHeight();
        this._defaultDepth = object.getDepth();
        const rotationX = object.getRotationX();
        const rotationY = object.getRotationY();
        const rotationZ = object.getRotationZ();
        const keepAspectRatio = object.shouldKeepAspectRatio();
        const modelResourceName = object.getModelResourceName();

        this._originPoint = getPointForLocation(object.getOriginLocation());
        this._centerPoint = getPointForLocation(object.getCenterLocation());

        // This renderer shows a placeholder for the object:
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._pixiResourcesLoader
          .get3DModel(project, modelResourceName)
          .then((model3d) => {
            if (this._wasDestroyed) return;
            const clonedModel3D = THREE_ADDONS.SkeletonUtils.clone(
              model3d.scene
            );
            // This group hold the rotation defined by properties.
            const threeObject = new THREE.Group();
            threeObject.rotation.order = 'ZYX';
            threeObject.add(clonedModel3D);
            this._updateDefaultTransformation(
              threeObject,
              rotationX,
              rotationY,
              rotationZ,
              this._defaultWidth,
              this._defaultHeight,
              this._defaultDepth,
              keepAspectRatio
            );
          });
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy({ children: true });
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/3d_model.svg';
      }

      getOriginX() {
        const originPoint = this.getOriginPoint();
        return this.getWidth() * originPoint[0];
      }

      getOriginY() {
        const originPoint = this.getOriginPoint();
        return this.getHeight() * originPoint[1];
      }

      getCenterX() {
        const centerPoint = this.getCenterPoint();
        return this.getWidth() * centerPoint[0];
      }

      getCenterY() {
        const centerPoint = this.getCenterPoint();
        return this.getHeight() * centerPoint[1];
      }

      getOriginPoint() {
        return this._originPoint || this._modelOriginPoint;
      }

      getCenterPoint() {
        return this._centerPoint || this._modelOriginPoint;
      }

      _updateDefaultTransformation(
        threeObject,
        rotationX,
        rotationY,
        rotationZ,
        originalWidth,
        originalHeight,
        originalDepth,
        keepAspectRatio
      ) {
        // These formulas are also used in:
        // - gdjs.Model3DRuntimeObject3DRenderer._updateDefaultTransformation
        // - Model3DEditor.modelSize
        threeObject.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );
        threeObject.updateMatrixWorld(true);
        const boundingBox = new THREE.Box3().setFromObject(threeObject);
        const shouldKeepModelOrigin = !this._originPoint;
        if (shouldKeepModelOrigin) {
          // Keep the origin as part of the model.
          // For instance, a model can be 1 face of a cube and we want to keep the
          // inside as part of the object even if it's just void.
          // It also avoids to have the origin outside of the object box.
          boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
        }

        const modelWidth = boundingBox.max.x - boundingBox.min.x;
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        const modelDepth = boundingBox.max.z - boundingBox.min.z;
        this._modelOriginPoint[0] =
          modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth;
        this._modelOriginPoint[1] =
          modelHeight < epsilon ? 0 : -boundingBox.min.y / modelHeight;
        this._modelOriginPoint[2] =
          modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth;

        // The model is flipped on Y axis.
        this._modelOriginPoint[1] = 1 - this._modelOriginPoint[1];

        // Center the model.
        const centerPoint = this._centerPoint;
        if (centerPoint) {
          threeObject.position.set(
            -(boundingBox.min.x + modelWidth * centerPoint[0]),
            // The model is flipped on Y axis.
            -(boundingBox.min.y + modelHeight * (1 - centerPoint[1])),
            -(boundingBox.min.z + modelDepth * centerPoint[2])
          );
        }

        // Rotate the model.
        threeObject.scale.set(1, 1, 1);
        threeObject.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );

        // Stretch the model in a 1x1x1 cube.
        const scaleX = modelWidth < epsilon ? 1 : 1 / modelWidth;
        const scaleY = modelHeight < epsilon ? 1 : 1 / modelHeight;
        const scaleZ = modelDepth < epsilon ? 1 : 1 / modelDepth;

        const scaleMatrix = new THREE.Matrix4();
        // Flip on Y because the Y axis is on the opposite side of direct basis.
        // It avoids models to be like a mirror refection.
        scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
        threeObject.updateMatrix();
        threeObject.applyMatrix4(scaleMatrix);

        if (keepAspectRatio) {
          // Reduce the object dimensions to keep aspect ratio.
          const widthRatio =
            modelWidth < epsilon
              ? Number.POSITIVE_INFINITY
              : originalWidth / modelWidth;
          const heightRatio =
            modelHeight < epsilon
              ? Number.POSITIVE_INFINITY
              : originalHeight / modelHeight;
          const depthRatio =
            modelDepth < epsilon
              ? Number.POSITIVE_INFINITY
              : originalDepth / modelDepth;
          let scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);
          if (!Number.isFinite(scaleRatio)) {
            scaleRatio = 1;
          }

          this._defaultWidth = scaleRatio * modelWidth;
          this._defaultHeight = scaleRatio * modelHeight;
          this._defaultDepth = scaleRatio * modelDepth;
        }
      }

      update() {
        const width = this.getWidth();
        const height = this.getHeight();
        const centerPoint = this.getCenterPoint();
        const centerX = width * centerPoint[0];
        const centerY = height * centerPoint[1];

        const minX = 0 - centerX;
        const minY = 0 - centerY;
        const maxX = width - centerX;
        const maxY = height - centerY;
        this._pixiObject.clear();
        this._pixiObject.beginFill(0x0033ff);
        this._pixiObject.lineStyle(1, 0xffd900, 1);
        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.lineTo(minX, maxY);
        this._pixiObject.endFill();

        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.moveTo(maxX, minY);
        this._pixiObject.lineTo(minX, maxY);

        const originPoint = this.getOriginPoint();
        this._pixiObject.position.x =
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]);
        this._pixiObject.position.y =
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]);
        this._pixiObject.angle = this._instance.getAngle();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    const isSamePoint = (point1, point2) => {
      if (!point1 && !point2) return true;
      if (point1 && !point2) return false;
      if (!point1 && point2) return false;
      return (
        point1[0] === point2[0] &&
        point1[1] === point2[1] &&
        point1[2] === point2[2]
      );
    };

    const getPointForLocation = (location) => {
      switch (location) {
        case 'ModelOrigin':
          return null;
        case 'ObjectCenter':
          return [0.5, 0.5, 0.5];
        case 'BottomCenterZ':
          return [0.5, 0.5, 0];
        case 'BottomCenterY':
          return [0.5, 1, 0.5];
        case 'TopLeft':
          return [0, 0, 0];
        default:
          return null;
      }
    };

    class Model3DRendered3DInstance extends Rendered3DInstance {
      _modelOriginPoint = [0, 0, 0];

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );

        this._defaultWidth = 1;
        this._defaultHeight = 1;
        this._defaultDepth = 1;
        this._originalWidth = 1;
        this._originalHeight = 1;
        this._originalDepth = 1;
        this._rotationX = 0;
        this._rotationY = 0;
        this._rotationZ = 0;
        this._keepAspectRatio = false;

        this._originPoint = null;
        this._centerPoint = null;

        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._threeObject = new THREE.Group();
        this._threeObject.rotation.order = 'ZYX';
        this._threeGroup.add(this._threeObject);

        this._threeModelGroup = null;
        this._clonedModel3D = null;
      }

      getOriginX() {
        const originPoint = this.getOriginPoint();
        return this.getWidth() * originPoint[0];
      }

      getOriginY() {
        const originPoint = this.getOriginPoint();
        return this.getHeight() * originPoint[1];
      }

      getOriginZ() {
        const originPoint = this.getOriginPoint();
        return this.getDepth() * originPoint[2];
      }

      getCenterX() {
        const centerPoint = this.getCenterPoint();
        return this.getWidth() * centerPoint[0];
      }

      getCenterY() {
        const centerPoint = this.getCenterPoint();
        return this.getHeight() * centerPoint[1];
      }

      getCenterZ() {
        const centerPoint = this.getCenterPoint();
        return this.getDepth() * centerPoint[2];
      }

      getOriginPoint() {
        return this._originPoint || this._modelOriginPoint;
      }

      getCenterPoint() {
        return this._centerPoint || this._modelOriginPoint;
      }

      _updateDefaultTransformation() {
        if (!this._clonedModel3D) return; // Model is not ready - nothing to do.

        if (this._threeModelGroup) {
          // Remove any previous container as we will recreate it just below
          this._threeObject.clear();
        }
        // This group hold the rotation defined by properties.
        // Always restart from a new group to avoid miscomputing bounding boxes/sizes.
        this._threeModelGroup = new THREE.Group();
        this._threeModelGroup.rotation.order = 'ZYX';
        this._threeModelGroup.add(this._clonedModel3D);

        this._threeModelGroup.rotation.set(
          (this._rotationX * Math.PI) / 180,
          (this._rotationY * Math.PI) / 180,
          (this._rotationZ * Math.PI) / 180
        );
        this._threeModelGroup.updateMatrixWorld(true);
        const boundingBox = new THREE.Box3().setFromObject(
          this._threeModelGroup
        );

        const shouldKeepModelOrigin = !this._originPoint;
        if (shouldKeepModelOrigin) {
          // Keep the origin as part of the model.
          // For instance, a model can be 1 face of a cube and we want to keep the
          // inside as part of the object even if it's just void.
          // It also avoids to have the origin outside of the object box.
          boundingBox.expandByPoint(new THREE.Vector3(0, 0, 0));
        }

        const modelWidth = boundingBox.max.x - boundingBox.min.x;
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        const modelDepth = boundingBox.max.z - boundingBox.min.z;
        this._modelOriginPoint[0] =
          modelWidth < epsilon ? 0 : -boundingBox.min.x / modelWidth;
        this._modelOriginPoint[1] =
          modelHeight < epsilon ? 0 : -boundingBox.min.y / modelHeight;
        this._modelOriginPoint[2] =
          modelDepth < epsilon ? 0 : -boundingBox.min.z / modelDepth;

        // The model is flipped on Y axis.
        this._modelOriginPoint[1] = 1 - this._modelOriginPoint[1];

        // Center the model.
        const centerPoint = this._centerPoint;
        if (centerPoint) {
          this._threeModelGroup.position.set(
            -(boundingBox.min.x + modelWidth * centerPoint[0]),
            // The model is flipped on Y axis.
            -(boundingBox.min.y + modelHeight * (1 - centerPoint[1])),
            -(boundingBox.min.z + modelDepth * centerPoint[2])
          );
        }

        // Rotate the model.
        this._threeModelGroup.scale.set(1, 1, 1);
        this._threeModelGroup.rotation.set(
          (this._rotationX * Math.PI) / 180,
          (this._rotationY * Math.PI) / 180,
          (this._rotationZ * Math.PI) / 180
        );

        // Stretch the model in a 1x1x1 cube.
        const scaleX = modelWidth < epsilon ? 1 : 1 / modelWidth;
        const scaleY = modelHeight < epsilon ? 1 : 1 / modelHeight;
        const scaleZ = modelDepth < epsilon ? 1 : 1 / modelDepth;

        const scaleMatrix = new THREE.Matrix4();
        // Flip on Y because the Y axis is on the opposite side of direct basis.
        // It avoids models to be like a mirror refection.
        scaleMatrix.makeScale(scaleX, -scaleY, scaleZ);
        this._threeModelGroup.updateMatrix();
        this._threeModelGroup.applyMatrix4(scaleMatrix);

        if (this._keepAspectRatio) {
          // Reduce the object dimensions to keep aspect ratio.
          const widthRatio =
            modelWidth < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalWidth / modelWidth;
          const heightRatio =
            modelHeight < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalHeight / modelHeight;
          const depthRatio =
            modelDepth < epsilon
              ? Number.POSITIVE_INFINITY
              : this._originalDepth / modelDepth;
          const minScaleRatio = Math.min(widthRatio, heightRatio, depthRatio);
          if (!Number.isFinite(minScaleRatio)) {
            this._defaultWidth = this._originalWidth;
            this._defaultHeight = this._originalHeight;
            this._defaultDepth = this._originalDepth;
          } else {
            if (widthRatio === minScaleRatio) {
              this._defaultWidth = this._originalWidth;
              this._defaultHeight = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelWidth,
                newReferenceValue: this._originalWidth,
                valueToApplyTo: modelHeight,
              });
              this._defaultDepth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelWidth,
                newReferenceValue: this._originalWidth,
                valueToApplyTo: modelDepth,
              });
            } else if (heightRatio === minScaleRatio) {
              this._defaultWidth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelHeight,
                newReferenceValue: this._originalHeight,
                valueToApplyTo: modelWidth,
              });

              this._defaultHeight = this._originalHeight;
              this._defaultDepth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelHeight,
                newReferenceValue: this._originalHeight,
                valueToApplyTo: modelDepth,
              });
            } else {
              this._defaultWidth = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelDepth,
                newReferenceValue: this._originalDepth,
                valueToApplyTo: modelWidth,
              });
              this._defaultHeight = Rendered3DInstance.applyRatio({
                oldReferenceValue: modelDepth,
                newReferenceValue: this._originalDepth,
                valueToApplyTo: modelHeight,
              });
              this._defaultDepth = this._originalDepth;
            }
          }
        } else {
          this._defaultWidth = this._originalWidth;
          this._defaultHeight = this._originalHeight;
          this._defaultDepth = this._originalDepth;
        }

        this._threeObject.add(this._threeModelGroup);
      }

      updateThreeObject() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.Model3DObjectConfiguration
        );

        let defaultTransformationDirty = false;

        const originalWidth = object.getWidth();
        const originalHeight = object.getHeight();
        const originalDepth = object.getDepth();
        if (
          this._originalWidth !== originalWidth ||
          this._originalHeight !== originalHeight ||
          this._originalDepth !== originalDepth
        ) {
          this._originalWidth = originalWidth;
          this._originalHeight = originalHeight;
          this._originalDepth = originalDepth;
          defaultTransformationDirty = true;
        }

        const rotationX = object.getRotationX();
        const rotationY = object.getRotationY();
        const rotationZ = object.getRotationZ();
        if (
          this._rotationX !== rotationX ||
          this._rotationY !== rotationY ||
          this._rotationZ !== rotationZ
        ) {
          this._rotationX = rotationX;
          this._rotationY = rotationY;
          this._rotationZ = rotationZ;
          defaultTransformationDirty = true;
        }

        const keepAspectRatio = object.shouldKeepAspectRatio();
        if (this._keepAspectRatio !== keepAspectRatio) {
          this._keepAspectRatio = keepAspectRatio;
          defaultTransformationDirty = true;
        }

        const originPoint = getPointForLocation(object.getOriginLocation());
        if (!isSamePoint(originPoint, this._originPoint)) {
          this._originPoint = originPoint;
          defaultTransformationDirty = true;
        }

        const centerPoint = getPointForLocation(object.getCenterLocation());
        if (!isSamePoint(centerPoint, this._centerPoint)) {
          this._centerPoint = centerPoint;
          defaultTransformationDirty = true;
        }

        if (defaultTransformationDirty) this._updateDefaultTransformation();

        const modelResourceName = object.getModelResourceName();
        if (this._modelResourceName !== modelResourceName) {
          this._modelResourceName = modelResourceName;

          this._pixiResourcesLoader
            .get3DModel(this._project, modelResourceName)
            .then((model3d) => {
              if (this._wasDestroyed) return;
              this._clonedModel3D = THREE_ADDONS.SkeletonUtils.clone(
                model3d.scene
              );

              this._updateDefaultTransformation();
            });
        }

        this._updateThreeObjectPosition();
      }

      _updateThreeObjectPosition() {
        const width = this.getWidth();
        const height = this.getHeight();
        const depth = this.getDepth();

        const originPoint = this.getOriginPoint();
        const centerPoint = this.getCenterPoint();
        this._threeObject.position.set(
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]),
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]),
          this._instance.getZ() - depth * (originPoint[2] - centerPoint[2])
        );

        this._threeObject.rotation.set(
          RenderedInstance.toRad(this._instance.getRotationX()),
          RenderedInstance.toRad(this._instance.getRotationY()),
          RenderedInstance.toRad(this._instance.getAngle())
        );

        const scaleX = width * (this._instance.isFlippedX() ? -1 : 1);
        const scaleY = height * (this._instance.isFlippedY() ? -1 : 1);
        const scaleZ = depth * (this._instance.isFlippedZ() ? -1 : 1);

        if (
          scaleX !== this._threeObject.scale.x ||
          scaleY !== this._threeObject.scale.y ||
          scaleZ !== this._threeObject.scale.z
        ) {
          this._threeObject.scale.set(scaleX, scaleY, scaleZ);
        }
      }

      updatePixiObject() {
        const width = this.getWidth();
        const height = this.getHeight();
        const centerPoint = this.getCenterPoint();
        const centerX = width * centerPoint[0];
        const centerY = height * centerPoint[1];

        const minX = 0 - centerX;
        const minY = 0 - centerY;
        const maxX = width - centerX;
        const maxY = height - centerY;
        this._pixiObject.clear();
        this._pixiObject.beginFill(0x999999, 0.2);
        this._pixiObject.lineStyle(1, 0xffd900, 0);
        this._pixiObject.moveTo(minX, minY);
        this._pixiObject.lineTo(maxX, minY);
        this._pixiObject.lineTo(maxX, maxY);
        this._pixiObject.lineTo(minX, maxY);
        this._pixiObject.endFill();

        const originPoint = this.getOriginPoint();
        this._pixiObject.position.x =
          this._instance.getX() - width * (originPoint[0] - centerPoint[0]);
        this._pixiObject.position.y =
          this._instance.getY() - height * (originPoint[1] - centerPoint[1]);
        this._pixiObject.angle = this._instance.getAngle();
      }

      update() {
        this.updatePixiObject();
        this.updateThreeObject();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }

      getDefaultDepth() {
        return this._defaultDepth;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'Scene3D::Model3DObject',
      Model3DRendered2DInstance
    );

    objectsRenderingService.registerInstance3DRenderer(
      'Scene3D::Model3DObject',
      Model3DRendered3DInstance
    );
  },
};
