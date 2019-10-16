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
      if (propertyName === 'family') {
        objectContent.family = newValue;
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
      if (propertyName === 'align') {
        objectContent.align = newValue ? newValue : 'left';
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
        'align',
        new gd.PropertyDescriptor(objectContent.align)
          .setType('choice')
          .addExtraInfo('left')
          .addExtraInfo('center')
          .addExtraInfo('right')
          .setLabel(_('Base alignment'))
      );

      objectProperties.set(
        'family',
        new gd.PropertyDescriptor(objectContent.family)
          .setType('string')
          .setLabel(_('Base font family'))
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
          '[b]bold[/b] [i]italic[/i] [size=15]smaller[/size] [font=times]times[/font] font\n[spacing=12]spaced out[/spacing]\n[outline=yellow]outlined[/outline] [shadow=red]DropShadow[/shadow] ',
        opacity: 255,
        size: '20',
        visible: true,
        color: '#000000',
        family: 'Arial',
        align: 'left',
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
    object
      .addAction(
        'SetText',
        _('Set BBCode text'),
        _('Set the BBCode formatted text.'),
        _('Set BBCode text of _PARAM0_ to _PARAM1_ _PARAM2_'),
        '',
        'JsPlatform/Extensions/bbcode32.png',
        'JsPlatform/Extensions/bbcode32.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('operator', _("Modification's sign"), '', false)
      .addParameter('string', _('BBCode text'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setBBText')
      .setManipulatedType('string')
      .setGetter('getBBText');

    object
      .addAction(
        'SetColor',
        _('Set base color'),
        _('Set base color'),
        _('Set base color of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/color24.png',
        'res/actions/color24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('color', _('Color'))
      .getCodeExtraInformation()
      .setFunctionName('setColor')
      .setGetter('getColor');

    object
      .addAction(
        'SetOpacity',
        _('Set base opacity'),
        _('Set base opacity'),
        _('Set base opacity of _PARAM0_ to _PARAM1_ _PARAM2_'),
        '',
        'res/actions/opacity24.png',
        'res/actions/opacity24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('operator', _("Modification's sign"), '', false)
      .addParameter('expression', _('Opacity (0-255)'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setOpacity')
      .setManipulatedType('number')
      .setGetter('getOpacity');

    object
      .addAction(
        'SetFontSize',
        _('Set base font size'),
        _('Set base font size'),
        _('Set base font size of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/characterSize24.png',
        'res/actions/characterSize24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('operator', _("Modification's sign"), '', false)
      .addParameter('expression', _('Font size'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setFontSize')
      .setGetter('getFontSize');

    object
      .addAction(
        'SetFontFamily',
        _('Set base font family'),
        _('Set base font family'),
        _('Set base font family of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/font24.png',
        'res/actions/font24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('string', _('Font family'))
      .getCodeExtraInformation()
      .setFunctionName('setFontFamily')
      .setGetter('getFontFamily');

    object
      .addAction(
        'SetAlignment',
        _('Set text alignment'),
        _('Set text alignment'),
        _('Set text alignment of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/textAlign24.png',
        'res/actions/textAlign24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter(
        'stringWithSelector',
        _('Alignment'),
        '["left", "right", "center"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setAlignment')
      .setGetter('getAlignment');

    object
      .addAction(
        'SetWidth',
        _('Set wrapping width'),
        _('Set wrapping width'),
        _('Set wrapping width of _PARAM0_ to _PARAM1_ _PARAM2_'),
        '',
        'res/actions/scaleWidth24.png',
        'res/actions/scaleWidth24.png'
      )
      .addParameter('object', _('BBText object'), 'BBText', false)
      .addParameter('operator', _("Modification's sign"), '', false)
      .addParameter('expression', _('Width in px'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setWrappingWidth')
      .setManipulatedType('number')
      .setGetter('getWrappingWidth');

    // extension
    //   .addExpression(
    //     'GetText',
    //     _('Get text'),
    //     _('Get text'),
    //     _('BBText'),
    //     '',
    //     'JsPlatform/Extensions/bbcode32.png',
    //     'JsPlatform/Extensions/bbcode32.png'
    //   )
    //   .getCodeExtraInformation()
    //   .setFunctionName('getBBText');

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
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/BBTextObject',
      })
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

      // Update font family
      const family = this._associatedObject
        .getProperties(this.project)
        .get('family')
        .getValue();
      this._pixiObject.textStyles.default.fontFamily = family;

      // Update alignment
      const align = this._associatedObject
        .getProperties(this.project)
        .get('align')
        .getValue();
      if (align !== this._pixiObject._style.align) {
        this._pixiObject._style.align = align;
        this._pixiObject.dirty = true;
      }

      // Read position and angle from the instance
      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      if (this._instance.hasCustomSize() && this._pixiObject) {
        const customSize = this._instance.getCustomWidth();
        if (
          this._pixiObject &&
          this._pixiObject.textStyles.default.wordWrapWidth !== customSize
        ) {
          this._pixiObject._style.wordWrapWidth = customSize;
          this._pixiObject.dirty = true;
        }
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

    objectsRenderingService.registerInstanceRenderer(
      'BBText::BBText',
      RenderedBBTextInstance
    );
  },
};
