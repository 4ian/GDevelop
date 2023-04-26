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
        '3D',
        _('3D'),
        _('Support for 3D in GDevelop.'),
        'Florian Rival',
        'MIT'
      )
      .setCategory('General');

    const threeDShapeObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    threeDShapeObject.updateProperty = function (
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
        propertyName === 'bottomFaceResourceName'
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
        propertyName === 'bottomFaceVisible'
      ) {
        objectContent[propertyName] = newValue === '1';
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    threeDShapeObject.getProperties = function (objectContent) {
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
        .getOrCreate('frontFaceVisible')
        .setValue(objectContent.frontFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Front face visible'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('backFaceVisible')
        .setValue(objectContent.backFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Back face visible'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('leftFaceVisible')
        .setValue(objectContent.leftFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Left face visible'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('rightFaceVisible')
        .setValue(objectContent.rightFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Right face visible'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('topFaceVisible')
        .setValue(objectContent.topFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Top face visible'))
        .setGroup(_('Face visibility'));

      objectProperties
        .getOrCreate('bottomFaceVisible')
        .setValue(objectContent.bottomFaceVisible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Bottom face visible'))
        .setGroup(_('Face visibility'));

      return objectProperties;
    };
    threeDShapeObject.setRawJSONContent(
      JSON.stringify({
        width: 100,
        height: 100,
        depth: 100,
        frontFaceResourceName: '',
        backFaceResourceName: '',
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
      })
    );

    // $FlowExpectedError
    threeDShapeObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === 'z') {
        instance.setRawDoubleProperty('z', parseFloat(newValue));
        return true;
      } else if (propertyName === 'rotationX') {
        instance.setRawDoubleProperty('rotationX', parseFloat(newValue));
        return true;
      } else if (propertyName === 'rotationY') {
        instance.setRawDoubleProperty('rotationY', parseFloat(newValue));
        return true;
      } else if (propertyName === 'depth') {
        instance.setRawDoubleProperty('depth', parseFloat(newValue));
        return true;
      }

      return false;
    };

    // $FlowExpectedError
    threeDShapeObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties
        .getOrCreate('z')
        .setValue(instance.getRawDoubleProperty('z').toString())
        .setType('number')
        .setLabel(_('Z (elevation)'));

      instanceProperties
        .getOrCreate('rotationX')
        .setValue(instance.getRawDoubleProperty('rotationX').toString())
        .setType('number')
        .setLabel(_('Rotation on X axis'));

      instanceProperties
        .getOrCreate('rotationY')
        .setValue(instance.getRawDoubleProperty('rotationY').toString())
        .setType('number')
        .setLabel(_('Rotation on Y axis'));

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'ThreeDShapeObject',
        _('3D Shape'),
        _('A 3D shape.'),
        'JsPlatform/Extensions/text_input.svg', // TODO (3D) - make or choose a proper icon for this.
        threeDShapeObject
      )
      .setCategoryFullName(_('3D'))
      .addUnsupportedBaseObjectCapability('effect')
      // .addUnsupportedBaseObjectCapability('effect') // TODO: are there more unsupported features?
      .setIncludeFile('Extensions/3D/threedshaperuntimeobject.js')
      .addIncludeFile(
        'Extensions/3D/threedshaperuntimeobject-pixi-renderer.js'
      );

    // Properties expressions/conditions/actions:
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Z',
        _('Z (elevation)'),
        _('the Z position (the "elevation")'),
        _('the Z position'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
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
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setDepth')
      .setGetter('getDepth');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'RotationX',
        _('Rotation on X axis'),
        _('the rotation on X axis'),
        _('the rotation on X axis'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
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
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setRotationY')
      .setGetter('getRotationY');

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'FaceVisibility',
        _('Face visibility'),
        _('the face visibility'), // TODO (3D) - face visibility: fix the sentence.
        _('the _PARAM1_ face visibility'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
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
      .addAction(
        'SetFaceResource',
        _('Face image'),
        _('Change the image of the face'),
        _('Change the image of _PARAM1_ face of _PARAM0_ to _PARAM2_'),
        '',
        'res/conditions/text24_black.png', // TODO (3D) - make or choose a proper icon for this.
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addParameter('object', _('3D Shape'), 'ThreeDShapeObject', false)
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
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
      )
      .addCodeOnlyParameter('currentScene', '')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .addParameter('layer', _('Layer'), '', true)
      .setDefaultValue('""')
      .addParameter('expression', _('Camera number (default : 0)'), '', true)
      .setDefaultValue('0')
      .markAsAdvanced()
      .setFunctionName('gdjs.threeD.camera.setCameraZ')
      .setGetter('gdjs.threeD.camera.getCameraZ')
      .setIncludeFile('Extensions/3D/threedtools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationX',
        _('Camera X rotation'),
        _('the camera rotation on X axis'),
        _('the camera rotation on X axis'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
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
      .setFunctionName('gdjs.threeD.camera.setCameraRotationX')
      .setGetter('gdjs.threeD.camera.getCameraRotationX')
      .setIncludeFile('Extensions/3D/threedtools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraRotationY',
        _('Camera Y rotation'),
        _('the camera rotation on Y axis'),
        _('the camera rotation on Y axis'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
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
      .setFunctionName('gdjs.threeD.camera.setCameraRotationY')
      .setGetter('gdjs.threeD.camera.getCameraRotationY')
      .setIncludeFile('Extensions/3D/threedtools.js');

      extension
        .addAction(
          'TurnCameraTowardObject',
          _('Look at an object'),
          _('Change the camera rotation to look at an object. The camera top always face the screen.'),
          _('Change the camera rotation of _PARAM2_ to look at _PARAM1_'),
          '',
           // TODO (3D) - make or choose a proper icon for this.
          'res/conditions/text24_black.png',
          'res/conditions/text24_black.png'
        )
        .addCodeOnlyParameter('currentScene', '')
        .addParameter('objectPtr', _('Object'), '3D::ThreeDShapeObject')
        .addParameter('layer', _('Layer'), '', true)
        .setDefaultValue('""')
        .addParameter('expression', _('Camera number (default : 0)'), '', true)
        .setDefaultValue('0')
        .addParameter('yesorno', _('Stand on Y instead of Z'), '', true)
        .setDefaultValue('false')
        .setFunctionName('gdjs.threeD.camera.turnCameraTowardObject')
        .setIncludeFile('Extensions/3D/threedtools.js');

        extension
          .addAction(
            'TurnCameraTowardPosition',
            _('Look at a position'),
            _('Change the camera rotation to look at a position. The camera top always face the screen.'),
            _('Change the camera rotation of _PARAM4_ to look at _PARAM1_; _PARAM2_; _PARAM3_'),
            '',
             // TODO (3D) - make or choose a proper icon for this.
            'res/conditions/text24_black.png',
            'res/conditions/text24_black.png'
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
          .setFunctionName('gdjs.threeD.camera.turnCameraTowardPosition')
          .setIncludeFile('Extensions/3D/threedtools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraNearPlane',
        _('Camera near plane'),
        _('the camera near plane distance'),
        _('the camera near plane distance'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
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
      .setFunctionName('gdjs.threeD.camera.setNearPlane')
      .setGetter('gdjs.threeD.camera.getNearPlane')
      .setIncludeFile('Extensions/3D/threedtools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFarPlane',
        _('Camera far plane'),
        _('the camera far plane distance'),
        _('the camera far plane distance'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
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
      .setFunctionName('gdjs.threeD.camera.setFarPlane')
      .setGetter('gdjs.threeD.camera.getFarPlane')
      .setIncludeFile('Extensions/3D/threedtools.js');

    extension
      .addExpressionAndConditionAndAction(
        'number',
        'CameraFov',
        _('Camera field of view (fov)'),
        _('the camera field of view'),
        _('the camera field of view'),
        '',
        'res/conditions/text24_black.png' // TODO (3D) - make or choose a proper icon for this.
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
      .setFunctionName('gdjs.threeD.camera.setFov')
      .setGetter('gdjs.threeD.camera.getFov')
      .setIncludeFile('Extensions/3D/threedtools.js');

    return extension;
  },
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
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
  ) {
    objectsEditorService.registerEditorConfiguration(
      '3D::ThreeDShapeObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/3d_shape',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    // TODO
  },
};
