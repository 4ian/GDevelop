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
      const Model3DObject = new gd.ObjectJsImplementation();
      // $FlowExpectedError - ignore Flow warning as we're creating an object
      Model3DObject.updateProperty = function (
        objectContent,
        propertyName,
        newValue
      ) {
        if (
          propertyName === 'width' ||
          propertyName === 'height' ||
          propertyName === 'depth' ||
          propertyName === 'rotationX' ||
          propertyName === 'rotationY' ||
          propertyName === 'rotationZ'
        ) {
          objectContent[propertyName] = parseFloat(newValue);
          return true;
        }
        if (
          propertyName === 'modelResourceName' ||
          propertyName === 'materialType'
        ) {
          objectContent[propertyName] = newValue;
          return true;
        }
        if (propertyName === 'keepAspectRatio') {
          objectContent[propertyName] = newValue === '1';
          return true;
        }

        return false;
      };
      // $FlowExpectedError - ignore Flow warning as we're creating an object
      Model3DObject.getProperties = function (objectContent) {
        const objectProperties = new gd.MapStringPropertyDescriptor();

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
          .getOrCreate('keepAspectRatio')
          .setValue(objectContent.keepAspectRatio ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Reduce initial dimensions to keep aspect ratio'))
          .setGroup(_('Default size'));

        objectProperties
          .getOrCreate('rotationX')
          .setValue((objectContent.rotationX || 0).toString())
          .setType('number')
          .setLabel(_('Rotation around X axis'))
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setGroup(_('Default orientation'));

        objectProperties
          .getOrCreate('rotationY')
          .setValue((objectContent.rotationY || 0).toString())
          .setType('number')
          .setLabel(_('Rotation around Y axis'))
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setGroup(_('Default orientation'));

        objectProperties
          .getOrCreate('rotationZ')
          .setValue((objectContent.rotationZ || 0).toString())
          .setType('number')
          .setLabel(_('Rotation around Z axis'))
          .setMeasurementUnit(gd.MeasurementUnit.getDegreeAngle())
          .setGroup(_('Default orientation'));

        objectProperties
          .getOrCreate('modelResourceName')
          .setValue(objectContent.modelResourceName || '')
          .setType('resource')
          .addExtraInfo('model3D')
          .setLabel(_('3D model'));

        objectProperties
          .getOrCreate('materialType')
          .setValue(objectContent.materialType || 'Basic')
          .setType('choice')
          .addExtraInfo('Basic')
          .addExtraInfo('StandardWithoutMetalness')
          .addExtraInfo('KeepOriginal')
          .setLabel(_('Material modifier'));

        return objectProperties;
      };
      Model3DObject.setRawJSONContent(
        JSON.stringify({
          width: 100,
          height: 100,
          depth: 100,
          keepAspectRatio: true,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          modelResourceName: '',
          materialType: 'Basic',
        })
      );

      // $FlowExpectedError
      Model3DObject.updateInitialInstanceProperty = function (
        objectContent,
        instance,
        propertyName,
        newValue,
        project,
        layout
      ) {
        return false;
      };

      // $FlowExpectedError
      Model3DObject.getInitialInstanceProperties = function (
        content,
        instance,
        project,
        layout
      ) {
        const instanceProperties = new gd.MapStringPropertyDescriptor();
        return instanceProperties;
      };

      const object = extension
        .addObject(
          'Model3DObject',
          _('3D Model'),
          _('A 3D model.'),
          'JsPlatform/Extensions/3d_box.svg',
          Model3DObject
        )
        .setCategoryFullName(_('3D'))
        .addUnsupportedBaseObjectCapability('effect')
        .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
        .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject.js')
        .addIncludeFile('Extensions/3D/Model3DRuntimeObject3DRenderer.js');

      // Properties expressions/conditions/actions:
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
        .setFunctionName('setZ')
        .setGetter('getZ');

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
        .setFunctionName('setDepth')
        .setGetter('getDepth');

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
        .markAsAdvanced()
        .setFunctionName('setWidth')
        .setGetter('getWidth');

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
        .markAsAdvanced()
        .setFunctionName('getWidth');

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
        .markAsAdvanced()
        .setFunctionName('setHeight')
        .setGetter('getHeight');

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
        .markAsAdvanced()
        .setFunctionName('getHeight');

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
        .setFunctionName('setHeight')
        .setGetter('getHeight');

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
        .markAsAdvanced()
        .setFunctionName('setScale')
        .setGetter('getScale');

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
        .markAsAdvanced()
        .setFunctionName('setScaleX')
        .setGetter('getScaleX');

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
        .markAsAdvanced()
        .setFunctionName('setScaleY')
        .setGetter('getScaleY');

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
        .setFunctionName('setScaleZ')
        .setGetter('getScaleZ');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setFunctionName('flipX');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setFunctionName('flipY');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .addParameter('yesorno', _('Activate flipping'))
        .markAsSimple()
        .setFunctionName('flipZ');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .setFunctionName('isFlippedX');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .setFunctionName('isFlippedY');

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
        .addParameter('object', _('3D model'), 'Model3DObject')
        .setFunctionName('isFlippedZ');

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
        .setFunctionName('setRotationX')
        .setGetter('getRotationX');

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
        .setFunctionName('setRotationY')
        .setGetter('getRotationY');

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
        .setFunctionName('turnAroundX');

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
        .setFunctionName('turnAroundY');

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
        .setFunctionName('turnAroundZ');
    }

    const Cube3DObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    Cube3DObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
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
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    Cube3DObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

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
        .setLabel(_('How to set up the face orientation'))
        .setDescription(
          _(
            'When set to Z, the left, right and top faces are oriented so that their up side is towards the player. When set to Y, those same faces are oriented towards the top of the screen.'
          )
        )
        .setGroup(_('Face orientation'));

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
        .setLabel(_('Front face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceName')
        .setValue(objectContent.backFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Back face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceUpThroughWhichAxisRotation')
        .setValue(objectContent.backFaceUpThroughWhichAxisRotation || 'X')
        .setType('choice')
        .addExtraInfo('X')
        .addExtraInfo('Y')
        .setLabel(
          _(
            'Rotation axis around which to get to the back face with the right way up.'
          )
        )
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('leftFaceResourceName')
        .setValue(objectContent.leftFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Left face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceName')
        .setValue(objectContent.rightFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Right face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceName')
        .setValue(objectContent.topFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Top face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceName')
        .setValue(objectContent.bottomFaceResourceName || '')
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bottom face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceResourceRepeat')
        .setValue(objectContent.frontFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile front face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('backFaceResourceRepeat')
        .setValue(objectContent.backFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile back face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('leftFaceResourceRepeat')
        .setValue(objectContent.leftFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile left face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('rightFaceResourceRepeat')
        .setValue(objectContent.rightFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile right face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('topFaceResourceRepeat')
        .setValue(objectContent.topFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile top face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('bottomFaceResourceRepeat')
        .setValue(objectContent.bottomFaceResourceRepeat ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Tile bottom face image'))
        .setGroup(_('Textures'));

      objectProperties
        .getOrCreate('frontFaceVisible')
        .setValue(objectContent.frontFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show front face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('backFaceVisible')
        .setValue(objectContent.backFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show back face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('leftFaceVisible')
        .setValue(objectContent.leftFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show left face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('rightFaceVisible')
        .setValue(objectContent.rightFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show right face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('topFaceVisible')
        .setValue(objectContent.topFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show top face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('bottomFaceVisible')
        .setValue(objectContent.bottomFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Show bottom face'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('materialType')
        .setValue(objectContent.materialType || 'Basic')
        .setType('choice')
        .addExtraInfo('Basic')
        .addExtraInfo('StandardWithoutMetalness')
        .setLabel(_('Material type'));

      return objectProperties;
    };
    Cube3DObject.setRawJSONContent(
      JSON.stringify({
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
      })
    );

    // $FlowExpectedError
    Cube3DObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };

    // $FlowExpectedError
    Cube3DObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'Cube3DObject',
        _('3D Box'),
        _('A 3D box.'),
        'JsPlatform/Extensions/3d_box.svg',
        Cube3DObject
      )
      .setCategoryFullName(_('3D'))
      .addUnsupportedBaseObjectCapability('effect')
      .setIncludeFile('Extensions/3D/A_RuntimeObject3D.js')
      .addIncludeFile('Extensions/3D/A_RuntimeObject3DRenderer.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObject.js')
      .addIncludeFile('Extensions/3D/Cube3DRuntimeObjectPixiRenderer.js');

    // Properties expressions/conditions/actions:
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
      .setFunctionName('setZ')
      .setGetter('getZ');

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
      .setFunctionName('setDepth')
      .setGetter('getDepth');

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
      .markAsAdvanced()
      .setFunctionName('setWidth')
      .setGetter('getWidth');

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
      .markAsAdvanced()
      .setFunctionName('getWidth');

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
      .markAsAdvanced()
      .setFunctionName('setHeight')
      .setGetter('getHeight');

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
      .markAsAdvanced()
      .setFunctionName('getHeight');

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
      .markAsAdvanced()
      .setFunctionName('setScale')
      .setGetter('getScale');

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
      .markAsAdvanced()
      .setFunctionName('setScaleX')
      .setGetter('getScaleX');

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
      .markAsAdvanced()
      .setFunctionName('setScaleY')
      .setGetter('getScaleY');

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
      .setFunctionName('setScaleZ')
      .setGetter('getScaleZ');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setFunctionName('flipX');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setFunctionName('flipY');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .addParameter('yesorno', _('Activate flipping'))
      .markAsSimple()
      .setFunctionName('flipZ');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .setFunctionName('isFlippedX');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .setFunctionName('isFlippedY');

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
      .addParameter('object', _('3D cube'), 'Cube3DObject')
      .setFunctionName('isFlippedZ');

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
      .setGetter('getRotationX');

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
      .setFunctionName('turnAroundX');

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
      .setFunctionName('turnAroundY');

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
        '',
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
        .setDescription(_('A light that illuminates objects from every direction with a gradient.'))
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
  runExtensionSanityTests: function (
    gd /*: libGDevelop */,
    extension /*: gdPlatformExtension*/
  ) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function (
    objectsEditorService /*: ObjectsEditorService */
  ) {},
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const Rendered3DInstance = objectsRenderingService.Rendered3DInstance;
    const PIXI = objectsRenderingService.PIXI;
    const THREE = objectsRenderingService.THREE;
    const THREE_ADDONS = objectsRenderingService.THREE_ADDONS;

    const materialIndexToFaceIndex = {
      // $FlowFixMe
      0: 3,
      // $FlowFixMe
      1: 2,
      // $FlowFixMe
      2: 5,
      // $FlowFixMe
      3: 4,
      // $FlowFixMe
      4: 0,
      // $FlowFixMe
      5: 1,
    };

    const noRepeatTextureVertexIndexToUvMapping = {
      // $FlowFixMe
      0: [0, 0],
      // $FlowFixMe
      1: [1, 0],
      // $FlowFixMe
      2: [0, 1],
      // $FlowFixMe
      3: [1, 1],
    };

    const noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ = {
      // $FlowFixMe
      0: [0, 1],
      // $FlowFixMe
      1: [0, 0],
      // $FlowFixMe
      2: [1, 1],
      // $FlowFixMe
      3: [1, 0],
    };

    const getFirstVisibleFaceResourceName = (objectConfiguration) => {
      const properties = objectConfiguration.getProperties();

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
        if (properties.get(faceVisibleProperty).getValue() === 'true') {
          const textureResource = properties
            .get(faceResourceNameProperty)
            .getValue();
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
      constructor(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        /**
         * Name of the resource that is rendered.
         * If no face is visible, this will be null.
         */
        this._renderedResourceName = undefined;
        const properties = associatedObjectConfiguration.getProperties();
        this._defaultWidth = parseFloat(properties.get('width').getValue());
        this._defaultHeight = parseFloat(properties.get('height').getValue());
        this._defaultDepth = parseFloat(properties.get('depth').getValue());

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

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        const instance = this._instance;

        const textureResourceName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
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
        const textureName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
            this._associatedObjectConfiguration
          );
        if (textureName === this._renderedResourceName) return;

        this.updateTexture();
      }

      updateTexture() {
        const textureName =
          RenderedCube3DObject2DInstance._getResourceNameToDisplay(
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

        this._pixiTexturedObject.anchor.x =
          this._centerX / this._pixiTexturedObject.texture.frame.width;
        this._pixiTexturedObject.anchor.y =
          this._centerY / this._pixiTexturedObject.texture.frame.height;

        this._pixiTexturedObject.angle = this._instance.getAngle();
        this._pixiTexturedObject.scale.x =
          width / this._pixiTexturedObject.texture.frame.width;
        this._pixiTexturedObject.scale.y =
          height / this._pixiTexturedObject.texture.frame.height;

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
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );

        const properties = associatedObjectConfiguration.getProperties();
        this._defaultWidth = parseFloat(properties.get('width').getValue());
        this._defaultHeight = parseFloat(properties.get('height').getValue());
        this._defaultDepth = parseFloat(properties.get('depth').getValue());

        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._faceResourceNames = [
          properties.get('frontFaceResourceName').getValue(),
          properties.get('backFaceResourceName').getValue(),
          properties.get('leftFaceResourceName').getValue(),
          properties.get('rightFaceResourceName').getValue(),
          properties.get('topFaceResourceName').getValue(),
          properties.get('bottomFaceResourceName').getValue(),
        ];
        this._faceVisibilities = [
          properties.get('frontFaceVisible').getValue() === 'true',
          properties.get('backFaceVisible').getValue() === 'true',
          properties.get('leftFaceVisible').getValue() === 'true',
          properties.get('rightFaceVisible').getValue() === 'true',
          properties.get('topFaceVisible').getValue() === 'true',
          properties.get('bottomFaceVisible').getValue() === 'true',
        ];
        this._shouldRepeatTextureOnFace = [
          properties.get('frontFaceResourceRepeat').getValue() === 'true',
          properties.get('backFaceResourceRepeat').getValue() === 'true',
          properties.get('leftFaceResourceRepeat').getValue() === 'true',
          properties.get('rightFaceResourceRepeat').getValue() === 'true',
          properties.get('topFaceResourceRepeat').getValue() === 'true',
          properties.get('bottomFaceResourceRepeat').getValue() === 'true',
        ];
        this._facesOrientation = properties.get('facesOrientation').getValue();
        this._backFaceUpThroughWhichAxisRotation = properties
          .get('backFaceUpThroughWhichAxisRotation')
          .getValue();
        this._shouldUseTransparentTexture =
          properties.get('enableTextureTransparency').getValue() === 'true';

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materials = [
          this._getFaceMaterial(project, materialIndexToFaceIndex[0]),
          this._getFaceMaterial(project, materialIndexToFaceIndex[1]),
          this._getFaceMaterial(project, materialIndexToFaceIndex[2]),
          this._getFaceMaterial(project, materialIndexToFaceIndex[3]),
          this._getFaceMaterial(project, materialIndexToFaceIndex[4]),
          this._getFaceMaterial(project, materialIndexToFaceIndex[5]),
        ];
        this._threeObject = new THREE.Mesh(geometry, materials);
        this._threeObject.rotation.order = 'ZYX';

        this._threeGroup.add(this._threeObject);
      }

      _getFaceMaterial(project, faceIndex) {
        if (!this._faceVisibilities[faceIndex]) return getTransparentMaterial();

        return this._pixiResourcesLoader.getThreeMaterial(
          project,
          this._faceResourceNames[faceIndex],
          {
            useTransparentTexture: this._shouldUseTransparentTexture,
          }
        );
      }

      static _getResourceNameToDisplay(objectConfiguration) {
        return getFirstVisibleFaceResourceName(objectConfiguration);
      }

      updateThreeObject() {
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

        if (
          width !== this._threeObject.scale.width ||
          height !== this._threeObject.scale.height ||
          depth !== this._threeObject.scale.depth
        ) {
          this._threeObject.scale.set(width, height, depth);
          this.updateTextureUvMapping();
        }
      }

      /**
       * Updates the UV mapping of the geometry in order to repeat a material
       * over the different faces of the cube.
       * The mesh must be configured with a list of materials in order
       * for the method to work.
       */
      updateTextureUvMapping() {
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

          const shouldRepeatTexture =
            this._shouldRepeatTextureOnFace[
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
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                } else {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
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
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMapping[vertexIndex % 4];
                } else {
                  [x, y] =
                    noRepeatTextureVertexIndexToUvMappingForLeftAndRightFacesTowardsZ[
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

    class Model3DRendered2DInstance extends RenderedInstance {
      constructor(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );
        const properties = associatedObjectConfiguration.getProperties();
        this._defaultWidth = parseFloat(properties.get('width').getValue());
        this._defaultHeight = parseFloat(properties.get('height').getValue());

        // This renderer shows a placeholder for the object:
        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/3d_box.svg';
      }

      update() {
        const width = this.getWidth();
        const height = this.getHeight();

        this._pixiObject.clear();
        this._pixiObject.beginFill(0x0033ff);
        this._pixiObject.lineStyle(1, 0xffd900, 1);
        this._pixiObject.moveTo(-width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, height / 2);
        this._pixiObject.lineTo(-width / 2, height / 2);
        this._pixiObject.endFill();

        this._pixiObject.moveTo(-width / 2, -height / 2);
        this._pixiObject.lineTo(width / 2, height / 2);
        this._pixiObject.moveTo(width / 2, -height / 2);
        this._pixiObject.lineTo(-width / 2, height / 2);

        this._pixiObject.position.x = this._instance.getX() + width / 2;
        this._pixiObject.position.y = this._instance.getY() + height / 2;
        this._pixiObject.angle = this._instance.getAngle();
      }

      getDefaultWidth() {
        return this._defaultWidth;
      }

      getDefaultHeight() {
        return this._defaultHeight;
      }
    }

    class Model3DRendered3DInstance extends Rendered3DInstance {
      constructor(
        project,
        layout,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        threeGroup,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          threeGroup,
          pixiResourcesLoader
        );
        const properties = associatedObjectConfiguration.getProperties();
        this._defaultWidth = parseFloat(properties.get('width').getValue());
        this._defaultHeight = parseFloat(properties.get('height').getValue());
        this._defaultDepth = parseFloat(properties.get('depth').getValue());
        const rotationX = parseFloat(properties.get('rotationX').getValue());
        const rotationY = parseFloat(properties.get('rotationY').getValue());
        const rotationZ = parseFloat(properties.get('rotationZ').getValue());
        const keepAspectRatio =
          properties.get('keepAspectRatio').getValue() === 'true';
        const modelResourceName = properties
          .get('modelResourceName')
          .getValue();

        this._pixiObject = new PIXI.Graphics();
        this._pixiContainer.addChild(this._pixiObject);

        this._threeObject = new THREE.Group();
        this._threeObject.rotation.order = 'ZYX';
        this._threeGroup.add(this._threeObject);

        this._pixiResourcesLoader
          .get3DModel(project, modelResourceName)
          .then((model3d) => {
            const clonedModel3D = THREE_ADDONS.SkeletonUtils.clone(model3d);
            clonedModel3D.rotation.order = 'ZYX';
            this._updateDefaultTransformation(
              clonedModel3D,
              rotationX,
              rotationY,
              rotationZ,
              this._defaultWidth,
              this._defaultHeight,
              this._defaultDepth,
              keepAspectRatio
            );
            this._threeObject.add(clonedModel3D);
          });
      }

      _updateDefaultTransformation(
        model3D,
        rotationX,
        rotationY,
        rotationZ,
        originalWidth,
        originalHeight,
        originalDepth,
        keepAspectRatio
      ) {
        const boundingBox = this._getModelAABB(
          model3D,
          rotationX,
          rotationY,
          rotationZ
        );

        // Center the model.
        model3D.position.set(
          -(boundingBox.min.x + boundingBox.max.x) / 2,
          (model3D.position.y = -(boundingBox.min.y + boundingBox.max.y) / 2),
          (model3D.position.z = -(boundingBox.min.z + boundingBox.max.z) / 2)
        );

        // Rotate the model.
        model3D.scale.set(1, 1, 1);
        model3D.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );

        // Stretch the model in a 1x1x1 cube.
        const modelWidth = boundingBox.max.x - boundingBox.min.x;
        const modelHeight = boundingBox.max.y - boundingBox.min.y;
        const modelDepth = boundingBox.max.z - boundingBox.min.z;

        const scaleX = 1 / modelWidth;
        const scaleY = 1 / modelHeight;
        const scaleZ = 1 / modelDepth;

        const scaleMatrix = new THREE.Matrix4();
        scaleMatrix.makeScale(scaleX, scaleY, scaleZ);
        model3D.updateMatrix();
        model3D.applyMatrix4(scaleMatrix);

        if (keepAspectRatio) {
          // Reduce the object dimensions to keep aspect ratio.
          const widthRatio = originalWidth / modelWidth;
          const heightRatio = originalHeight / modelHeight;
          const depthRatio = originalDepth / modelDepth;
          const scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);

          this._defaultWidth = scaleRatio * modelWidth;
          this._defaultHeight = scaleRatio * modelHeight;
          this._defaultDepth = scaleRatio * modelDepth;
        }

        model3D.updateMatrix();
      }

      _getModelAABB(model3D, rotationX, rotationY, rotationZ) {
        // The original model is used because `setFromObject` is working in
        // world transformation.

        model3D.rotation.set(
          (rotationX * Math.PI) / 180,
          (rotationY * Math.PI) / 180,
          (rotationZ * Math.PI) / 180
        );

        const aabb = new THREE.Box3().setFromObject(model3D);

        // Revert changes.
        model3D.rotation.set(0, 0, 0);

        return aabb;
      }

      updateThreeObject() {
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

        if (
          width !== this._threeObject.scale.width ||
          height !== this._threeObject.scale.height ||
          depth !== this._threeObject.scale.depth
        ) {
          this._threeObject.scale.set(width, height, depth);
        }
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
      'Scene3D::Model3DObject',
      Model3DRendered2DInstance
    );

    objectsRenderingService.registerInstance3DRenderer(
      'Scene3D::Model3DObject',
      Model3DRendered3DInstance
    );
  },
};
