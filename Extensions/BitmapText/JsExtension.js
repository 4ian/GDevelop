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
        .getOrCreate('bitmapFontFile')
        .setValue(objectContent.bitmapFontFile)
        .setType('resource')
        .addExtraInfo('bitmapFont') //fnt or xml files
        .setLabel(_('Bitmap Font'));

      objectProperties
        .getOrCreate('bitmapAtlasFile')
        .setValue(objectContent.bitmapAtlasFile)
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
          'This text use the default bitmap font,\nadd your files in the object properties.',
        opacity: 255,
        scale: 1,
        fontSize: 20,
        tint: '#ffffff',
        bitmapFontFile: '',
        bitmapAtlasFile: '',
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
      .addCondition(
        'Text',
        _('Compare the text'),
        _('Compare the text of a Bitmap text object.'),
        _('the text'),
        '',
        'res/conditions/text24.png',
        'res/conditions/text.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getText');

    object
      .addCondition(
        'Opacity',
        _('Opacity'),
        _(
          'Check the opacity of a Bitmap text object, between 0 (fully transparent) to 255 (opaque).'
        ),
        _('the opacity'),
        '',
        'res/conditions/opacity24.png',
        'res/conditions/opacity.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getOpacity');

    object
      .addCondition(
        'FontSize',
        _('Font size'),
        _(
          'Check the font size of the text. This value is the font size setup in the external bmFont editor.'
        ),
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
        'Scale',
        _('Scale'),
        _('Check the scale of the Bitmap text object, 1 by default.'),
        _('the scale'),
        '',
        'res/actions/scale24.png',
        'res/actions/scale.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getScale');

    object
      .addCondition(
        'Font',
        _('Font name'),
        _('Check the font name, define in the external editor bmFont.'),
        _('the font name'),
        '',
        'res/conditions/font24.png',
        'res/conditions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getFontName');

    object
      .addCondition(
        'Alignment',
        _('Alignment'),
        _('Check the current text alignment.'),
        _('the alignment'),
        '',
        'res/actions/textAlign24.png',
        'res/actions/textAlign.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('getAlignment');

    object
      .addCondition(
        'WordWrap',
        _('Wrapping'),
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
      .addCondition(
        'WrappingWidth',
        _('Wrapping width'),
        _(
          'Compare the width, in pixels, after which the text is wrapped on next line.'
        ),
        _('the wrapping width'),
        '',
        'res/actions/scaleWidth24.png',
        'res/actions/scaleWidth.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getWrappingWidth');

    object
      .addAction(
        'Text',
        _('Modify the text'),
        _('Modify the text of a Bitmap text object.'),
        _('the Bitmap text'),
        '',
        'res/actions/text24.png',
        'res/actions/text.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('string')
      .getCodeExtraInformation()
      .setFunctionName('setText')
      .setGetter('getText');

    object
      .addAction(
        'Tint',
        _('Tint'),
        _('Change the tint of an object. The default color is white.'),
        _('Change tint of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('color', _('Color'), '', false)
      .setDefaultValue('255;255;255')
      .getCodeExtraInformation()
      .setFunctionName('setTint');

    object
      .addAction(
        'Opacity',
        _('Change text opacity'),
        _(
          'Change the opacity of a Bitmap text object. 0 is fully transparent, 255 is opaque (default).'
        ),
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
        'Scale',
        _('Scale'),
        _('Change the scale of a Bitmap text object, 1 by default.'),
        _('the scale'),
        '',
        'res/actions/scale24.png',
        'res/actions/scale.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setScale')
      .setGetter('getScale');

    object
      .addAction(
        'BitmapFontAndAtlasFile',
        _('Bitmap files'),
        _(
          'Change the font file and atlas image used by the Bitmap text object.'
        ),
        _(
          'Set the bitmap font of _PARAM0_ with font file:_PARAM1_ and the atlas image:_PARAM2_'
        ),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('bitmapFont', _('Bitmap font file'), '', false)
      .addParameter('string', _('Bitmap atlas texture'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setBitmapFontAndAtlasFile');

    object
      .addAction(
        'Alignment',
        _('Alignment'),
        _('Change the alignment of a Bitmap text object.'),
        _('Change the alignment of _PARAM0_ to _PARAM1_'),
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
      .addAction(
        'WordWrap',
        _('Word wrap'),
        _(
          "De/activate word wrapping. Note that word wrapping is a graphical option\nyou can't get the number of lines displayed"
        ),
        _('Activate wrapping style of _PARAM0_: _PARAM1_'),
        '',
        'res/actions/wordWrap24.png',
        'res/actions/wordWrap.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter('yesorno', _('Activate word wrap'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setWordWrap');

    object
      .addAction(
        'WrappingWidth',
        _('Wrapping width'),
        _(
          'Change the width, in pixels, after which the text is wrapped on next line.'
        ),
        _('the wrapping width'),
        '',
        'res/actions/scaleWidth24.png',
        'res/actions/scaleWidth.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('setWrappingWidth')
      .setGetter('getWrappingWidth');

    object
      .addExpression(
        'Scale',
        _('Scale'),
        _('Scale'),
        '',
        'res/actions/scale24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getScale');

    object
      .addExpression(
        'FontSize',
        _('Font size'),
        _('Font size'),
        '',
        'res/actions/characterSize24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getFontSize');

    object
      .addStrExpression(
        'Text',
        _('Text'),
        _('Text'),
        '',
        'res/actions/text24.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getText');

    object
      .addStrExpression(
        'FontName',
        _('Font name'),
        _('Font name'),
        '',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .getCodeExtraInformation()
      .setFunctionName('getFontName');

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

      // Set up a and generate a default bitmap font
      // It will then be replaced with the bitmap font setup by the user (see `update` method)

      // Define same as  bitmapTextObject.setRawJSONContent() on top of this file
      this._bitmapFontStyle = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        align: 'left',
        padding: 5,
        fill: '#ffffff',
        wordWrap: true,
      });

      // defaultSlugFontName is used as fontName when PixiJS generate the bitmap font.
      const defaultSlugFontName =
        this._bitmapFontStyle.fontFamily +
        '-' +
        this._bitmapFontStyle.fontSize +
        '-' +
        this._bitmapFontStyle.fill +
        '-bitmapFont';
      this._bitmapFontStyle.fontName = defaultSlugFontName;

      //Generate a bitmap font, defaultSlugFontName is used as fontName.
      PIXI.BitmapFont.from(defaultSlugFontName, this._bitmapFontStyle, {
        chars: [
          [' ', '~'], // All the printable ASCII characters
        ],
      });

      // We'll track changes of the font to trigger the loading of the new font.
      this._currentBitmapFontFile = '';
      this._currentBitmapAtlasFile = '';

      this._pixiObject = new PIXI.BitmapText('', {
        fontName: this._bitmapFontStyle.fontName, // Use the bitmap font previously generated.
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
      const bitmapFontFile = properties.get('bitmapFontFile').getValue();
      const bitmapAtlasFile = properties.get('bitmapAtlasFile').getValue();

      if (
        this._currentBitmapFontFile !== bitmapFontFile ||
        this._currentBitmapAtlasFile !== bitmapAtlasFile
      ) {
        this._currentBitmapFontFile = bitmapFontFile;
        this._currentBitmapAtlasFile = bitmapAtlasFile;

        this._bitmapAtlasTexture = this._pixiResourcesLoader.getPIXITexture(
          this._project,
          this._currentBitmapAtlasFile
        );

        this._pixiResourcesLoader
          .getResourceBitmapFont(this._project, this._currentBitmapFontFile)
          .then((fontData) => {
            const bitmapFont = PIXI.BitmapFont.install(
              fontData,
              this._bitmapAtlasTexture
            );
            // We patch the installed font to use a more complex name that includes the size of the font,
            // to avoid conflicts between different font files using the same font name.

            const defaultName = bitmapFont.font;
            const fullSlugName = bitmapFont.font + '-' + bitmapFont.size;
            bitmapFont.font = fullSlugName;
            PIXI.BitmapFont.available[fullSlugName] = bitmapFont;
            delete PIXI.BitmapFont.available[defaultName];

            this._pixiObject.fontName = bitmapFont.font;
            this._pixiObject.fontSize = bitmapFont.size;
            this._pixiObject.dirty = true;
          })
          .catch((err) => {
            console.warn('Unable to load font data', err);
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
