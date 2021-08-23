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
        'Video',
        'Video',
        'Provides an object to display a video on the scene. The recommended file format is MPEG4, with H264 video codec and AAC audio codec, to maximize the support of the video on different platform and browsers.',
        'Aurélien Vivet',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/video');

    var videoObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    videoObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'Opacity') {
        objectContent.opacity = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'Looped') {
        objectContent.loop = newValue === '1';
        return true;
      }
      if (propertyName === 'Volume') {
        objectContent.volume = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'videoResource') {
        objectContent.videoResource = newValue;
        return true;
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    videoObject.getProperties = function (objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('Opacity')
        .setValue(objectContent.opacity.toString())
        .setType('number')
        .setLabel(_('Video opacity (0-255)'));
      objectProperties
        .getOrCreate('Looped')
        .setValue(objectContent.loop ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Loop the video'));
      objectProperties
        .getOrCreate('Volume')
        .setValue(objectContent.volume.toString())
        .setType('number')
        .setLabel(_('Video volume (0-100)'));
      objectProperties
        .getOrCreate('videoResource')
        .setValue(objectContent.videoResource)
        .setType('resource')
        .addExtraInfo('video')
        .setLabel(_('Video resource'));

      return objectProperties;
    };
    videoObject.setRawJSONContent(
      JSON.stringify({
        opacity: 255,
        loop: false,
        volume: 100,
        videoResource: '',
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
    videoObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    videoObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'VideoObject',
        _('Video'),
        _('Displays a video.'),
        'JsPlatform/Extensions/videoicon32.png',
        videoObject
      )
      .setIncludeFile('Extensions/Video/videoruntimeobject.js')
      .addIncludeFile('Extensions/Video/videoruntimeobject-pixi-renderer.js')

    object
      .addAction(
        'Play',
        _('Play a video'),
        _(
          'Play a video (recommended file format is MPEG4, with H264 video codec and AAC audio codec).'
        ),
        _('Play the video of _PARAM0_'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('play');

    object
      .addAction(
        'Pause',
        _('Pause a video'),
        _('Pause the specified video.'),
        _('Pause video _PARAM0_'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('pause');

    object
      .addAction(
        'Loop',
        _('Loop a video'),
        _('Loop the specified video.'),
        _('Loop video of _PARAM0_: _PARAM1_'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .addParameter('yesorno', _('Activate loop'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setLoop');

    object
      .addAction(
        'Mute',
        _('Mute a video'),
        _('Mute, or unmute, the specified video.'),
        _('Mute video of _PARAM0_: _PARAM1_'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .addParameter('yesorno', _('Activate mute'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('mute');

    object
      .addAction(
        'SetTime',
        _('Set time'),
        _('Set the time of the video object in seconds'),
        _('the time'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setCurrentTime')
      .setGetter('getCurrentTime');

    object
      .addAction(
        'SetVolume',
        _('Set volume'),
        _(
          'Set the volume of the video object, between 0 (muted) and 100 (maximum).'
        ),
        _('the volume'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setVolume')
      .setGetter('getVolume');

    object
      .addExpression(
        'Volume',
        _('Get the volume'),
        _(
          'Get the volume of a video object, between 0 (muted) and 100 (maximum).'
        ),
        '',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getVolume');

    object
      .addCondition(
        'Play',
        _('Is played'),
        _('Check if a video is played.'),
        _('_PARAM0_ is played'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isPlayed');

    object
      .addCondition(
        'Pause',
        _('Is paused'),
        _('Check if the video is paused.'),
        _('_PARAM0_ is paused'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isPaused');

    object
      .addCondition(
        'Loop',
        _('Is looped'),
        _('Check if the video is looped.'),
        _('_PARAM0_ is looped'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isLooped');

    object
      .addCondition(
        'Volume',
        _('Volume'),
        _('Compare the current volume of a video object.'),
        _('the volume'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getVolume');

    object
      .addCondition(
        'Mute',
        _('Is muted'),
        _('Check if a video is muted.'),
        _('_PARAM0_ is muted'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isMuted');

    object
      .addExpression(
        'CurrentTime',
        _('Get current time'),
        _('Return the current time of a video object (in seconds).'),
        '',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getCurrentTime');

    object
      .addExpression(
        'Duration',
        _('Get the duration'),
        _('Return the duration of a video object (in seconds).'),
        '',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getDuration');

    object
      .addCondition(
        'Duration',
        _('Duration'),
        _('Compare the duration of a video object'),
        _('the duration (in seconds)'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getDuration');

    object
      .addCondition(
        'CurrentTime',
        _('Current time'),
        _('Compare the current time of a video object'),
        _('the current time (in seconds)'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getCurrentTime');

    object
      .addCondition(
        'Ended',
        _('Is ended'),
        _('Check if a video is ended'),
        _('_PARAM0_ is ended'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isEnded');

    object
      .addAction(
        'SetOpacity',
        _('Set opacity'),
        _(
          'Set opacity of the specified video object, between 0 (fully transparent) and 255 (opaque).'
        ),
        _('the opacity'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setOpacity')
      .setGetter('getOpacity');

    object
      .addCondition(
        'GetOpacity',
        _('Opacity'),
        _('Compare the opacity of a video object'),
        _('the opacity'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getOpacity');

    object
      .addExpression(
        'Opacity',
        _('Get current opacity'),
        _('Return the opacity of a video object'),
        '',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getOpacity');

    object
      .addAction(
        'SetPlaybackSpeed',
        _('Set playback speed'),
        _(
          'Set playback speed of the specified video object, (1 = the default speed, >1 = faster and <1 = slower).'
        ),
        _('the playback speed'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setPlaybackSpeed')
      .setGetter('getPlaybackSpeed');

    object
      .addCondition(
        'GetPlaybackSpeed',
        _('Playback speed '),
        _('Compare the playback speed of a video object'),
        _('the playback speed'),
        '',
        'JsPlatform/Extensions/videoicon24.png',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Video object'), 'VideoObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getPlaybackSpeed');

    object
      .addExpression(
        'PlaybackSpeed',
        _('Get current playback speed'),
        _('Return the playback speed of a video object'),
        '',
        'JsPlatform/Extensions/videoicon16.png'
      )
      .addParameter('object', _('Object'), 'VideoObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getPlaybackSpeed');

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
      'Video::VideoObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/video',
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
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of VideoObject inside the IDE.
     *
     * @extends RenderedInstance
     * @class RenderedVideoObjectInstance
     * @constructor
     */
    function RenderedVideoObjectInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      this._videoResource = undefined;

      //Setup the PIXI object:
      this._pixiObject = new PIXI.Sprite(this._getVideoTexture());
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedVideoObjectInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedVideoObjectInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/videoicon24.png';
    };

    RenderedVideoObjectInstance.prototype._getVideoTexture = function () {
      // Get the video resource to use
      const videoResource = this._associatedObject
        .getProperties()
        .get('videoResource')
        .getValue();

      // This returns a VideoTexture with autoPlay set to false
      return this._pixiResourcesLoader.getPIXIVideoTexture(
        this._project,
        videoResource
      );
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedVideoObjectInstance.prototype.update = function () {
      // Check if the video resource has changed
      const videoResource = this._associatedObject
        .getProperties()
        .get('videoResource')
        .getValue();
      if (videoResource !== this._videoResource) {
        this._videoResource = videoResource;
        this._pixiObject.texture = this._getVideoTexture();

        if (!this._pixiObject.texture.baseTexture.valid) {
          var that = this;

          that._pixiObject.texture.on('error', function () {
            that._pixiObject.texture.off('error', this);

            that._pixiObject.texture = that._pixiResourcesLoader.getInvalidPIXITexture();
          });
        }
      }

      // Update opacity
      const opacity = this._associatedObject
        .getProperties()
        .get('Opacity')
        .getValue();
      this._pixiObject.alpha = opacity / 255;

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedVideoObjectInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    // We don't do anything special when instance is removed from the scene,
    // because the video is never really played.

    objectsRenderingService.registerInstanceRenderer(
      'Video::VideoObject',
      RenderedVideoObjectInstance
    );
  },
};
