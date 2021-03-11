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
        'BitmapText',
        _('Bitmap Text Object'),
        _('Displays a text as a bitmap image.'),
        'Aurélien Vivet',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/bitmaptext');

    const bitmapTextObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError
    bitmapTextObject.updateProperty = function (
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
    bitmapTextObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('text')
        .setValue(objectContent.text)
        .setType('textarea')
        .setLabel(_('Text'));

      objectProperties
        .getOrCreate('opacity')
        .setValue(objectContent.opacity.toString())
        .setType('number')
        .setLabel(_('Opacity (0-255)'));

      objectProperties
        .getOrCreate('align')
        .setValue(objectContent.align)
        .setType('choice')
        .addExtraInfo('left')
        .addExtraInfo('center')
        .addExtraInfo('right')
        .setLabel(_('Alignment, when multiple lines are displayed'));

      objectProperties
        .getOrCreate('bitmapFontResourceName')
        .setValue(objectContent.bitmapFontResourceName)
        .setType('resource')
        .addExtraInfo('bitmapFont') //fnt or xml files
        .setLabel(_('Bitmap Font'));

      objectProperties
        .getOrCreate('textureAtlasResourceName')
        .setValue(objectContent.textureAtlasResourceName)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bitmap atlas image'));

      objectProperties
        .getOrCreate('scale')
        .setValue(objectContent.scale.toString())
        .setType('number')
        .setLabel(_('Text scale'));

      objectProperties
        .getOrCreate('tint')
        .setValue(objectContent.tint)
        .setType('color')
        .setLabel(_('Font tint'));

      objectProperties
        .getOrCreate('wordWrap')
        .setValue(objectContent.wordWrap ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Word wrapping'));

      return objectProperties;
    };
    bitmapTextObject.setRawJSONContent(
      JSON.stringify({
        text:
          'This text use the default bitmap font.\nUse a custom Bitmap Font to create your own texts.',
        opacity: 255,
        scale: 1,
        fontSize: 20,
        tint: '#ffffff',
        bitmapFontResourceName: '',
        textureAtlasResourceName: '',
        align: 'left',
        wordWrap: true,
      })
    );

    // $FlowExpectedError
    bitmapTextObject.updateInitialInstanceProperty = function (
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
    bitmapTextObject.getInitialInstanceProperties = function (
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
        'BitmapTextObject',
        _('BitmapText'),
        _(
          'Displays a text using a "Bitmap Font", which is more performant than a traditional text but also less flexible (only alphanumerical characters are supported).'
        ),
        'JsPlatform/Extensions/bitmapfont32.png',
        bitmapTextObject
      )
      .setIncludeFile('Extensions/BitmapText/bitmaptextruntimeobject.js')
      .addIncludeFile(
        'Extensions/BitmapText/bitmaptextruntimeobject-pixi-renderer.js'
      );

    object
      .addExpressionAndConditionAndAction(
        'string',
        'Text',
        _('Text'),
        _('the text'),
        _('the text'),
        '',
        'res/conditions/text24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('string')
      .setFunctionName('setText')
      .setGetter('getText');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Opacity',
        _('Opacity'),
        _('the opacity, between 0 (fully transparent) and 255 (opaque)'),
        _('the opacity'),
        '',
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('number')
      .setFunctionName('setOpacity')
      .setGetter('getOpacity');

    object
      .addExpressionAndCondition(
        'number',
        'FontSize',
        _('Font size'),
        _('the font size, defined in the Bitmap Font'),
        _('the font size'),
        '',
        'res/conditions/characterSize24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('number')
      .setFunctionName('getFontSize');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Scale',
        _('Scale'),
        _('the scale (1 by default)'),
        _('the scale'),
        '',
        'res/actions/scale24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('number')
      .setFunctionName('setScale')
      .setGetter('getScale');

    object
      .addExpressionAndCondition(
        'string',
        'FontName',
        _('Font name'),
        _('the font name (defined in the Bitmap font)'),
        _('the font name'),
        '',
        'res/conditions/font24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('string')
      .setFunctionName('getFontName');

    object
      .addAction(
        'SetTint',
        _('Tint'),
        _('Set the tint of the Bitmap Text object.'),
        _('Set tint of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('color', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTint');

    object
      .addAction(
        'SetBitmapFontResourceName',
        _('Bitmap Font'),
        _('Change the Bitmap Font of the object.') +
          ' ' +
          _(
            'The resource name can be found in: `Project Manager > Game settings > Resources`.'
          ),
        _('Set the bitmap font of _PARAM0_ to _PARAM2_'),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('bitmapFont', _('Bitmap font resource name'), '', false)
      .setParameterLongDescription(
        'The resource name of the font file, without quotes.'
      )
      .getCodeExtraInformation()
      .setFunctionName('setBitmapFontResourceName');

    object
      .addAction(
        'SetTextureAtlasResourceName',
        _('Bitmap Font Atlas'),
        _('Change the atlas image used by the object.') +
          ' ' +
          _(
            'The resource name can be found in: `Project Manager > Game settings > Resources`.'
          ),
        _('Set the atlas of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('string', _('Texture atlas resource name'), '', false)
      .setParameterLongDescription(
        'The resource name of the image exported with the font, with quotes.'
      )
      .getCodeExtraInformation()
      .setFunctionName('setTextureAtlasResourceName');

    object
      .addExpressionAndCondition(
        'string',
        'Alignment',
        _('Alignment'),
        _('the text alignment'),
        _('the text alignment'),
        '',
        'res/actions/textAlign24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('string')
      .setFunctionName('getAlignment');

    object
      .addAction(
        'SetAlignment',
        _('Alignment'),
        _('Change the alignment of a Bitmap text object.'),
        _('Set the alignment of _PARAM0_ to _PARAM1_'),
        '',
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
      .setFunctionName('setAlignment');

    object
      .addCondition(
        'WordWrap',
        _('Word wrap'),
        _('Check if word wrap is enabled.'),
        _('_PARAM0_ word wrap is enabled'),
        '',
        'res/conditions/wordWrap24.png',
        'res/conditions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getWordWrap');

    object
      .addAction(
        'SetWordWrap',
        _('Word wrap'),
        _('De/activate word wrapping.'),
        _('Activate word wrap of _PARAM0_: _PARAM1_'),
        '',
        'res/actions/wordWrap24.png',
        'res/actions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('yesorno', _('Activate word wrap'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setWordWrap');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'WrappingWidth',
        _('Wrapping width'),
        _('the width, in pixels, after which the text is wrapped on next line'),
        _('the wrapping width'),
        '',
        'res/actions/scaleWidth24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('number')
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
      'BitmapText::BitmapTextObject',
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
  registerInstanceRenderers: function (
    objectsRenderingService /*: ObjectsRenderingService */
  ) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /** The bitmap font used in case another font can't be loaded */
    let defaultBitmapFont = null;

    /**
     * Patch the specified installed font to use a slug name that includes the size of the font and line height,
     * to avoid conflicts between different font files using the same font name.
     */
    const patchBitmapFont = (bitmapFont) => {
      const generateSlugName = (bitmapFontStyle) => {
        return (
          bitmapFontStyle.font +
          '-' +
          bitmapFontStyle.size +
          '-' +
          bitmapFontStyle.lineHeight
        );
      };

      const defaultName = bitmapFont.font;
      const fullSlugName = generateSlugName(bitmapFont);
      bitmapFont.font = fullSlugName;
      PIXI.BitmapFont.available[fullSlugName] = bitmapFont;

      delete PIXI.BitmapFont.available[defaultName];
      return PIXI.BitmapFont.available[fullSlugName];
    };

    /**
     * Return a default bitmap font to be used in case another font can't be loaded.
     */
    const getDefaultBitmapFont = () => {
      if (defaultBitmapFont) return defaultBitmapFont;

      const defaultBitmapFontStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        padding: 5,
        align: 'left',
        fill: '#ffffff',
        wordWrap: true,
        lineHeight: 20,
      });

      defaultBitmapFont = patchBitmapFont(
        PIXI.BitmapFont.from(
          defaultBitmapFontStyle.fontFamily,
          defaultBitmapFontStyle,
          {
            chars: [
              [' ', '~'], // All the printable ASCII characters
            ],
          }
        )
      );
      return defaultBitmapFont;
    };

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

      // We'll track changes of the font to trigger the loading of the new font.
      this._currentBitmapFontResourceName = '';
      this._currentTextureAtlasResourceName = '';

      this._pixiObject = new PIXI.BitmapText('', {
        // Use a default font. The proper font will be loaded in `update` method.
        fontName: getDefaultBitmapFont().font,
      });

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
    RenderedBitmapTextInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/bitmapfont24.png';
    };

    // This is called to update the PIXI object on the scene editor
    RenderedBitmapTextInstance.prototype.update = function () {
      const properties = this._associatedObject.getProperties();

      // Update the rendered text properties (note: Pixi is only
      // applying changes if there were changed).
      const rawText = properties.get('text').getValue();
      this._pixiObject.text = rawText;

      const opacity = properties.get('opacity').getValue();
      this._pixiObject.alpha = opacity / 255;

      const align = properties.get('align').getValue();
      this._pixiObject.align = align;

      const color = properties.get('tint').getValue();
      this._pixiObject.tint = parseInt(color.replace('#', '0x'), 16);

      const scale = properties.get('scale').getValue() || 1;
      this._pixiObject.scale.set(scale);

      // Track the changes in font to load the new requested font.
      const bitmapFontResourceName = properties
        .get('bitmapFontResourceName')
        .getValue();
      const textureAtlasResourceName = properties
        .get('textureAtlasResourceName')
        .getValue();

      if (
        this._currentBitmapFontResourceName !== bitmapFontResourceName ||
        this._currentTextureAtlasResourceName !== textureAtlasResourceName
      ) {
        this._currentBitmapFontResourceName = bitmapFontResourceName;
        this._currentTextureAtlasResourceName = textureAtlasResourceName;

        const texture = this._pixiResourcesLoader.getPIXITexture(
          this._project,
          this._currentTextureAtlasResourceName
        );

        this._pixiResourcesLoader
          .getResourceBitmapFont(
            this._project,
            this._currentBitmapFontResourceName
          )
          .then((fontData) => {
            const bitmapFont = patchBitmapFont(
              PIXI.BitmapFont.install(fontData, texture)
            );
            this._pixiObject.fontName = bitmapFont.font;
            this._pixiObject.fontSize = bitmapFont.size;
            this._pixiObject.dirty = true;
          })
          .catch((err) => {
            console.warn('Unable to load font data:', err);
            console.info(
              'Is the texture atlas properly set for the Bitmap Text object? The default font will be used instead.'
            );

            const bitmapFont = getDefaultBitmapFont();
            this._pixiObject.fontName = bitmapFont.font;
            this._pixiObject.fontSize = bitmapFont.size;
            this._pixiObject.dirty = true;
          });
      }

      // Set up the wrapping width if enabled.
      const wordWrap = properties.get('wordWrap').getValue() === 'true';
      if (wordWrap && this._instance.hasCustomSize()) {
        this._pixiObject.maxWidth =
          this._instance.getCustomWidth() / this._pixiObject.scale.x;
        this._pixiObject.dirty = true;
      } else {
        this._pixiObject.maxWidth = 0;
        this._pixiObject.dirty = true;
      }

      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedBitmapTextInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedBitmapTextInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'BitmapText::BitmapTextObject',
      RenderedBitmapTextInstance
    );
  },
};
