/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

//TODO: add base color, base font, base size
const MultiStyleText = require('./dist/pixi-multistyle-text.umd');
console.log(MultiStyleText);
module.exports = {
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'BBText',
        'BBTextObject',
        _('Display a BBText object on the scene.'),
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/BBTextObject');

    var objectBBText = new gd.ObjectJsImplementation();
    objectBBText.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'text') {
        objectContent.text = newValue;
        return true;
      }
      if (propertyName === 'color') {
        objectContent.color = newValue;
        return true;
      }
      if (propertyName === 'opacity') {
        objectContent.opacity = parseFloat(newValue);
        return true;
      }
      if (propertyName === 'visible') {
        objectContent.visible = newValue === '1';
        return true;
      }
      if (propertyName === 'size') {
        objectContent.size = String(newValue);
        return true;
      }

      return false;
    };
    objectBBText.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        'text',
        new gd.PropertyDescriptor(objectContent.text)
          .setType('textarea')
          .setLabel(_('BBCode text'))
      );

      objectProperties.set(
        'color',
        new gd.PropertyDescriptor(objectContent.color)
          .setType('color')
          .setLabel(_('Base color'))
      );

      objectProperties.set(
        'opacity',
        new gd.PropertyDescriptor(objectContent.opacity.toString())
          .setType('number')
          .setLabel(_('Opacity (0-255)'))
      );
      objectProperties.set(
        'size',
        new gd.PropertyDescriptor(objectContent.size)
          .setType('number')
          .setLabel(_('Base size'))
      );
      objectProperties.set(
        'visible',
        new gd.PropertyDescriptor(objectContent.visible ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Visible on start'))
      );

      return objectProperties;
    };
    objectBBText.setRawJSONContent(
      JSON.stringify({
        text:
          "[spacing=19]spaced out [/spacing][font=Cursive]comix[/font] comix [shadow=red]DropShadow[/shadow] [size=15]Let's[/size] do [outline=black][color=pink][size=40]outlined text[/size][/color][/outline] [color=yellow]bbcolors[/color] [i]italic[/i]\nand [b]bold[/b] text for\n[pixi]Pixi.js![/pixi]",
        opacity: 255,
        size: '24',
        visible: true,
        color: '#000000',
      })
    );

    objectBBText.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    objectBBText.getInitialInstanceProperties = function(
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
        'BBText',
        _('BBText'),
        _('Displays a BBCode rich Text.'),
        'JsPlatform/Extensions/bbcode32.png',
        objectBBText
      )
      .setIncludeFile('Extensions/BBText/bbtextruntimeobject.js')
      .addIncludeFile('Extensions/BBText/bbtextruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/BBText/dist/pixi-multistyle-text.umd.js');

    /// Actions / Conditions / Expressions

    // object
    //   .addAction(
    //     'Play',
    //     _('Play a video'),
    //     _(
    //       'Play a video (recommended file format is MPEG4, with H264 video codec and AAC audio codec).'
    //     ),
    //     _('Play the video of _PARAM0_'),
    //     '',
    //     'JsPlatform/Extensions/videoicon24.png',
    //     'JsPlatform/Extensions/videoicon16.png'
    //   )
    //   .addParameter('object', _('Example object'), 'ObjectExample', false)
    //   .getCodeExtraInformation()
    //   .setFunctionName('play');

    // object
    //   .addAction(
    //     'Loop',
    //     _('Loop a video'),
    //     _('Loop the specified Example.'),
    //     _('Loop Example of _PARAM0_: _PARAM1_'),
    //     '',
    //     'JsPlatform/Extensions/videoicon24.png',
    //     'JsPlatform/Extensions/videoicon16.png'
    //   )
    //   .addParameter('object', _('Example object'), 'ObjectExample', false)
    //   .addParameter('yesorno', _('Activate loop'), '', false)
    //   .getCodeExtraInformation()
    //   .setFunctionName('setLoop');

    // object
    //   .addAction(
    //     'SetTime',
    //     _('Set time'),
    //     _('Set the time of the video object in seconds'),
    //     _('Set time of _PARAM0_: _PARAM1__PARAM2_ seconds'),
    //     '',
    //     'JsPlatform/Extensions/videoicon24.png',
    //     'JsPlatform/Extensions/videoicon16.png'
    //   )
    //   .addParameter('object', _('Example object'), 'ObjectExample', false)
    //   .addParameter('operator', _("Modification's sign"), '', false)
    //   .addParameter('expression', _('Time in seconds'), '', false)
    //   .getCodeExtraInformation()
    //   .setFunctionName('setCurrentTime')
    //   .setManipulatedType('number')
    //   .setGetter('getCurrentTime');

    // object
    //   .addExpression(
    //     'Volume',
    //     _('Get the volume'),
    //     _(
    //       'Get the volume of a video object, between 0 (muted) and 100 (maximum).'
    //     ),
    //     '',
    //     'JsPlatform/Extensions/videoicon16.png'
    //   )
    //   .addParameter('object', _('Object'), 'ObjectExample', false)
    //   .getCodeExtraInformation()
    //   .setFunctionName('getVolume');

    // object
    //   .addCondition(
    //     'Pause',
    //     _('Is paused'),
    //     _('Check if the video is paused.'),
    //     _('_PARAM0_ is paused'),
    //     '',
    //     'JsPlatform/Extensions/videoicon24.png',
    //     'JsPlatform/Extensions/videoicon16.png'
    //   )
    //   .addParameter('object', _('Example object'), 'ObjectExample', false)
    //   .getCodeExtraInformation()
    //   .setFunctionName('isPaused');

    // console.log(new MultiStyleText('echo', {}));
    // console.log(this._pixiObject);
    return extension;
  },
  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array like this:
   * `runExtensionSanityTests: function(gd, extension) { return []; }`
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */

  registerEditorConfigurations: function(objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'BBText::BBText',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor()
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function(objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    // console.log(objectsRenderingService);
    /**
     * Renderer for instances of BBText inside the IDE.
     *
     * @extends RenderedBBTextInstance
     * @class RenderedBBTextInstance
     * @constructor
     */
    function RenderedBBTextInstance(
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

      const BBTextStyles = {
        default: {
          fontFamily: 'Arial',
          fontSize: '24px',
          fill: '#cccccc',
          tagStyle: ['[', ']'],
          wordWrap: true,
          wordWrapWidth: 250,
          align: 'left',
        },
      };

      this._pixiObject = new MultiStyleText('', BBTextStyles);

      console.log(this._pixiObject);
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedBBTextInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedBBTextInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/bbcode24.png';
    };

    // RenderedBBTextInstance.prototype._getVideoTexture = function() {
    //   // Get the video resource to use
    //   const videoResource = this._associatedObject
    //     .getProperties(this.project)
    //     .get('videoResource')
    //     .getValue();

    //   // This returns a VideoTexture with autoPlay set to false
    //   return this._pixiResourcesLoader.getPIXIVideoTexture(
    //     this._project,
    //     videoResource
    //   );
    // };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedBBTextInstance.prototype.update = function() {
      // Check if the text has changed
      const rawText = this._associatedObject
        .getProperties(this.project)
        .get('text')
        .getValue();
      if (rawText !== this._pixiObject.text) {
        this._pixiObject.setText(rawText);
      }

      // Update opacity
      const opacity = this._associatedObject
        .getProperties(this.project)
        .get('opacity')
        .getValue();
      this._pixiObject.alpha = opacity / 255;

      // Update color
      const color = this._associatedObject
        .getProperties(this.project)
        .get('color')
        .getValue();
      this._pixiObject.textStyles.default.fill = color;

      // Update size
      const size = this._associatedObject
        .getProperties(this.project)
        .get('size')
        .getValue();
      this._pixiObject.textStyles.default.fontSize = `${size}px`;

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      if (this._instance.hasCustomSize()) {
        this._pixiObject.textStyles.default.wordWrapWidth =
          this._instance.getCustomWidth() / 2;
        // this._pixiObject.width = this._instance.getCustomWidth();
        // this._pixiObject.height = this._instance.getCustomHeight();
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedBBTextInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedBBTextInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height;
    };

    // We don't do anything special when instance is removed from the scene,
    // because the video is never really played.

    objectsRenderingService.registerInstanceRenderer(
      'BBText::BBText',
      RenderedBBTextInstance
    );
  },
};
