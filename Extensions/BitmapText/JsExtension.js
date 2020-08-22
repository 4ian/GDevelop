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
  createExtension: function(
    _ /*: (string) => string */,
    gd /*: libGDevelop */
  ) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'BitmapText',
        _('Bitmap Text Object'),
        _('Displays a text as a bitmap image.'),
        'Aurélien Vivet',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/bitmaptext');

    const BitmapTextObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError
    BitmapTextObject.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName in objectContent) {
        if (typeof objectContent[propertyName] === 'boolean')
          objectContent[propertyName] = newValue === '1';
        else if (typeof objectContent[propertyName] === 'number')
          objectContent[propertyName] = parseFloat(newValue);
        else objectContent[propertyName] = newValue;
        return true;
      }

      return false;
    };
    // $FlowExpectedError
    BitmapTextObject.getProperties = function(objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('text')
        .setValue(objectContent.text)
        .setType('textarea')
        .setLabel(_('Text'));

      objectProperties
        .getOrCreate('color')
        .setValue(objectContent.color)
        .setType('color')
        .setLabel(_('Base color'));

      objectProperties
        .getOrCreate('opacity')
        .setValue(objectContent.opacity.toString())
        .setType('number')
        .setLabel(_('Opacity (0-255)'));

      objectProperties
        .getOrCreate('fontSize')
        .setValue(objectContent.fontSize.toString())
        .setType('number')
        .setLabel(_('Base size'));

      objectProperties
        .getOrCreate('align')
        .setValue(objectContent.align)
        .setType('choice')
        .addExtraInfo('left')
        .addExtraInfo('center')
        .addExtraInfo('right')
        .setLabel(_('Base alignment'));

      objectProperties
        .getOrCreate('fontFamily')
        .setValue(objectContent.fontFamily)
        .setType('resource')
        .addExtraInfo('font')
        .setLabel(_('Base font family'));

      objectProperties
        .getOrCreate('wordWrap')
        .setValue(objectContent.wordWrap ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Word wrapping'));

      objectProperties
        .getOrCreate('visible')
        .setValue(objectContent.visible ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Visible on start'));

      return objectProperties;
    };
    BitmapTextObject.setRawJSONContent(
      JSON.stringify({
        text: 'Bitmap Text test',
        opacity: 255,
        fontSize: 20,
        visible: true,
        color: '#000000',
        fontFamily: 'Arial',
        align: 'left',
        wordWrap: true,
      })
    );

    // $FlowExpectedError
    BitmapTextObject.updateInitialInstanceProperty = function(
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
    BitmapTextObject.getInitialInstanceProperties = function(
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
        'BitmapText',
        _('BitmapText'),
        _(
          'Displays rich text as a sprite by converting a standard font to a Bitmap font.'
        ),
        'JsPlatform/Extensions/bitmapfont32.png',
        BitmapTextObject
      )
      .setIncludeFile('Extensions/BitmapText/bitmaptextruntimeobject.js')
      .addIncludeFile(
        'Extensions/BitmapText/bitmaptextruntimeobject-pixi-renderer.js'
      );

    object
      .addCondition(
        'GetBitmapText',
        _('Compare the text'),
        _('Compare the text of the Bitmap text object.'),
        _('the text'),
        '',
        'res/conditions/text24.png',
        'res/conditions/text.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getBitmapText');

    object
      .addCondition(
        'GetOpacity',
        _('Opacity'),
        _(
          'Compare the opacity of the Bitmap text object, between 0 (fully transparent) to 255 (opaque).'
        ),
        _('the opacity'),
        '',
        'res/conditions/opacity24.png',
        'res/conditions/opacity.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getOpacity');

    object
      .addCondition(
        'GetFontSize',
        _('Font size'),
        _('Compare the font size of the Bitmap text object.'),
        _('the font size'),
        '',
        'res/conditions/characterSize24.png',
        'res/conditions/characterSize.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getFontSize');

    object
      .addCondition(
        'GetFontFamily',
        _('Font family'),
        _('Compare the font family of the Bitmap text object.'),
        _('the font family'),
        _('Style'),
        'res/conditions/font24.png',
        'res/conditions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getFontFamily');

    object
      .addCondition(
        'GetAlignment',
        _('Alignment'),
        _('Compare the alignment of the Bitmap text object.'),
        _('the alignment'),
        _('Style'),
        'res/actions/textAlign24.png',
        'res/actions/textAlign.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getAlignment');

    object
      .addCondition(
        'GetWordWrap',
        _('Wrapping'),
        _('Check if word wrap is enabled'),
        _('_PARAM0_ word wrapping is activated'),
        _('Style'),
        'res/conditions/wordWrap24.png',
        'res/conditions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getWordWrap');

    object
      .addCondition(
        'GetWrappingWidth',
        _('Wrapping width'),
        _(
          'Compare the width, in pixels, after which the text is wrapped on next line.'
        ),
        _('the wrapping width'),
        _('Style'),
        'res/actions/wordWrap24.png',
        'res/actions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getWrappingWidth');

    object
      .addAction(
        'SetBitmapText',
        _('Text'),
        _('Modify the text of a Bitmap text object.'),
        _('the Bitmap text'),
        '',
        'res/actions/text24.png',
        'res/actions/text.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('setBitmapText')
      .setGetter('getBitmapText');

    object
      .addAction(
        'SetColor',
        _('Color'),
        _('Change the color of the text.'),
        _('Change color of _PARAM0_ to _PARAM1_'),
        _('Style'),
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('color', _('Color'), '', false)
      .setDefaultValue('0;0;0')
      .getCodeExtraInformation()
      .setFunctionName('setColor')
      .setGetter('getColor');

    object
      .addAction(
        'SetOpacity',
        _('Opacity'),
        _('Modify the opacity of a Bitmap text object.'),
        _('the opacity'),
        '',
        'res/actions/opacity24.png',
        'res/actions/opacity.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setOpacity')
      .setGetter('getOpacity');

    object
      .addAction(
        'SetFontSize',
        _('Font size'),
        _('Modify the font size of a Bitmap text object.'),
        _('the font size'),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setFontSize')
      .setGetter('getFontSize');

    object
      .addAction(
        'SetFontFamily',
        _('Font family'),
        _('Modify the font family of a Bitmap text object.'),
        _('the font family'),
        _('Style'),
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('setFontFamily')
      .setGetter('getFontFamily');

    object
      .addAction(
        'SetAlignment',
        _('Alignment'),
        _('Modify the alignment of a Bitmap text object.'),
        _('Align _PARAM0_: _PARAM1_'),
        _('Style'),
        'res/actions/textAlign24.png',
        'res/actions/textAlign.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter(
        'stringWithSelector',
        _('Alignment'),
        '["left", "center", "right"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setFontFamily')
      .setGetter('getFontFamily');

    object
      .addAction(
        'SetWordWrap',
        _('Word wrap'),
        _('Modify the word wrap of a Bitmap text object.'),
        _('Set word wrapping of _PARAM0_: _PARAM1_'),
        _('Style'),
        'res/actions/wordWrap24.png',
        'res/actions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('yesorno', _('Activate word wrap'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setWordWrap');

    object
      .addAction(
        'SetWrappingWidth',
        _('Wrapping width'),
        _(
          'Change the width, in pixels, after which the text is wrapped on next line.'
        ),
        _('the wrapping width'),
        _('Style'),
        'res/actions/scaleWidth24.png',
        'res/actions/scaleWidth.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setWrappingWidth')
      .setGetter('getWrappingWidth');

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
  runExtensionSanityTests: function(
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
  registerEditorConfigurations: function(
    objectsEditorService /*: ObjectsEditorService */
  ) {
    objectsEditorService.registerEditorConfiguration(
      'BitmapText::BitmapText',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/bitmaptext',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function(
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /**
     * Renderer for instances of BitmapText inside the IDE.
     *
     * @extends RenderedBitmapTextInstance
     * @class RenderedBitmapTextInstance
     * @constructor
     */
    function RenderedBitmapTextInstance(
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

      const style = new PIXI.TextStyle();

      //classic font in GDevelop
      style.fontFamily = 'Arial';
      style.fontSize = 20;
      style.wordWrap = false;
      style.fill = '#ffffff'; // baked color in font, not doing for be dynamic so it's white here, and real color is handle dynamicaly on bitmapText.

      const slugFontName =
        style.fontFamily +
        '-' +
        style.fontSize +
        '-' +
        style.fill +
        '-bitmapFont';

      if (!PIXI.BitmapFont.available[slugFontName]) {
        PIXI.BitmapFont.from(slugFontName, style, {
          chars: PIXI.BitmapFont.ASCII,
          textureWidth: 1024,
        });
      }

      this._pixiObject = new PIXI.BitmapText('', {
        fontName: slugFontName,
      });

      this.style = style;
      this.constructorSlugFontName = slugFontName;
      this._pixiObject.anchor.x = 0.5;
      this._pixiObject.anchor.y = 0.5;
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
    }
    RenderedBitmapTextInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedBitmapTextInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/bitmapfont24.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedBitmapTextInstance.prototype.update = function() {
      const properties = this._associatedObject.getProperties();

      //NOTE text - bitmapText
      const rawText = properties.get('text').getValue();
      if (rawText !== this._pixiObject.text) {
        this._pixiObject.text = rawText;
      }

      //NOTE opacity - bitmapText
      const opacity = properties.get('opacity').getValue();
      if (opacity !== this._pixiObject.opacity) {
        this._pixiObject.alpha = opacity / 255;
      }

      //NOTE color - bitmapFont
      const color = properties.get('color').getValue();
      if (color !== this.style.fill) {
        this.style.fill = color;
        this._pixiObject.dirty = true;
      }

      const fontSize = Number(properties.get('fontSize').getValue());
      if (fontSize !== this.style.fontSize) {
        this.style.fontSize = fontSize; //size of the bitmapFont, generate a texture
        this._pixiObject.fontSize = fontSize; // size of the bitmapText
        this._pixiObject.dirty = true;
      }

      //NOTE fontFamily - bitmapFont
      const fontResourceName = properties.get('fontFamily').getValue();
      if (this._fontResourceName !== fontResourceName) {
        this._fontResourceName = fontResourceName;

        this._pixiResourcesLoader
          .loadFontFamily(this._project, fontResourceName)
          .then(fontFamily => {
            // Once the font is loaded, we can use the given fontFamily.
            this.style.fontFamily = fontFamily;
            this._pixiObject.dirty = true;
          })
          .catch(err => {
            // Ignore errors
            console.warn(
              'Unable to load font family for RenderedBitmapTextInstance',
              err
            );
          });
      }

      const width = this._instance.hasCustomSize()
        ? this._instance.getCustomWidth()
        : this.getDefaultWidth();
      const height = this._instance.hasCustomSize()
        ? this._instance.getCustomHeight()
        : this.getDefaultHeight();

      //NOTE wordWrap to maxWidth - bitmapText
      const wordWrap = properties.get('wordWrap').getValue() === 'true';
      if (wordWrap && this._instance.hasCustomSize()) {
        this._pixiObject.maxWidth = width;
        this._pixiObject.dirty = true;
      } else {
        this._pixiObject.maxWidth = 0;
        this._pixiObject.dirty = true;
      }

      // NOTE align - bitmapText
      const align = properties.get('align').getValue();
      if (align !== this._pixiObject.align) {
        this._pixiObject.align = align;
      }

      this._pixiObject.position.x = this._instance.getX() + width / 2;
      this._pixiObject.position.y = this._instance.getY() + height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      const slugFontName =
        this.style.fontFamily +
        '-' +
        this.style.fontSize +
        '-' +
        this.style.fill +
        '-bitmapFont';

      if (!PIXI.BitmapFont.available[slugFontName] || this._pixiObject.dirty) {
        PIXI.BitmapFont.from(slugFontName, this.style, {
          chars: PIXI.BitmapFont.ASCII,
          textureWidth: 1024,
        });
        this._pixiObject.dirty = true;
      }
      this._pixiObject.fontName = slugFontName;
      this._pixiObject.updateText();
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedBitmapTextInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedBitmapTextInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'BitmapText::BitmapText',
      RenderedBitmapTextInstance
    );
  },
};
