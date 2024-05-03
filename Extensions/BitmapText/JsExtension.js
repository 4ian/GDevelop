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
        'BitmapText',
        _('Bitmap Text'),
        _(
          'Displays a text using a "Bitmap Font" (an image representing characters). This is more performant than a traditional Text object and it allows for complete control on the characters aesthetic.'
        ),
        'Aurélien Vivet',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/bitmap_text')
      .setCategory('Text');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Bitmap Text'))
      .setIcon('JsPlatform/Extensions/bitmapfont32.png');

    const bitmapTextObject = new gd.ObjectJsImplementation();
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
        .setLabel(_('Opacity (0-255)'))
        .setGroup(_('Appearance'));

      objectProperties
        .getOrCreate('align')
        .setValue(objectContent.align)
        .setType('choice')
        .addExtraInfo('left')
        .addExtraInfo('center')
        .addExtraInfo('right')
        .setLabel(_('Alignment, when multiple lines are displayed'))
        .setGroup(_('Appearance'));

      objectProperties
        .getOrCreate('bitmapFontResourceName')
        .setValue(objectContent.bitmapFontResourceName)
        .setType('resource')
        .addExtraInfo('bitmapFont') //fnt or xml files
        .setLabel(_('Bitmap Font'))
        .setGroup(_('Font'));

      objectProperties
        .getOrCreate('textureAtlasResourceName')
        .setValue(objectContent.textureAtlasResourceName)
        .setType('resource')
        .addExtraInfo('image')
        .setLabel(_('Bitmap atlas image'))
        .setGroup(_('Font'));

      objectProperties
        .getOrCreate('scale')
        .setValue(objectContent.scale.toString())
        .setType('number')
        .setLabel(_('Text scale'))
        .setGroup(_('Appearance'));

      objectProperties
        .getOrCreate('tint')
        .setValue(objectContent.tint)
        .setType('color')
        .setLabel(_('Font tint'))
        .setGroup(_('Font'));

      objectProperties
        .getOrCreate('wordWrap')
        .setValue(objectContent.wordWrap ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Word wrapping'))
        .setGroup(_('Appearance'));

      return objectProperties;
    };
    bitmapTextObject.setRawJSONContent(
      JSON.stringify({
        text:
          'This text use the default bitmap font.\nUse a custom Bitmap Font to create your own texts.',
        opacity: 255,
        scale: 1,
        fontSize: 20,
        tint: '255;255;255',
        bitmapFontResourceName: '',
        textureAtlasResourceName: '',
        align: 'left',
        wordWrap: true,
      })
    );

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
        _('Bitmap Text'),
        _(
          'Displays a text using a "Bitmap Font" (an image representing characters). This is more performant than a traditional Text object and it allows for complete control on the characters aesthetic.'
        ),
        'JsPlatform/Extensions/bitmapfont32.png',
        bitmapTextObject
      )
      .setIncludeFile('Extensions/BitmapText/bitmaptextruntimeobject.js')
      .addIncludeFile(
        'Extensions/BitmapText/bitmaptextruntimeobject-pixi-renderer.js'
      )
      .setCategoryFullName(_('Text'))
      .addDefaultBehavior('TextContainerCapability::TextContainerBehavior')
      .addDefaultBehavior('EffectCapability::EffectBehavior')
      .addDefaultBehavior('OpacityCapability::OpacityBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'string',
        'Text',
        _('Text'),
        _('the text'),
        _('the text'),
        '',
        'res/conditions/text24_black.png'
      )
      .setHidden()
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('string', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setText')
      .setGetter('getText');

    object
      .addStrExpression(
        'Text',
        _('Text'),
        _('Return the text.'),
        '',
        'res/conditions/text24_black.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .setFunctionName('getText');

    // Deprecated
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
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Opacity (0-255)')
        )
      )
      .setFunctionName('setOpacity')
      .setGetter('getOpacity')
      .setHidden();

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
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getFontSize');

    // Deprecated
    object
      .addExpressionAndConditionAndAction(
        'number',
        'Scale',
        _('Scale'),
        _('the scale (1 by default)'),
        _('the scale'),
        '',
        'res/actions/scale24_black.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setHidden()
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
      .useStandardParameters('string', gd.ParameterOptions.makeNewOptions())
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

    // Deprecated
    object
      .addAction(
        'SetBitmapFontAndTextureAtlasResourceName',
        _('Bitmap files resources'),
        _('Change the Bitmap Font and/or the atlas image used by the object.'),
        _(
          'Set the bitmap font of _PARAM0_ to _PARAM1_ and the atlas to _PARAM2_'
        ),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .setHidden()
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter(
        'bitmapFontResource',
        _('Bitmap font resource name'),
        '',
        false
      )
      .setParameterLongDescription(
        'The resource name of the font file, without quotes.'
      )
      .addParameter('string', _('Texture atlas resource name'), '', false)
      .setParameterLongDescription(
        'The resource name of the image exported with the font, with quotes.'
      )
      .getCodeExtraInformation()
      .setFunctionName('setBitmapFontAndTextureAtlasResourceName');

    object
      .addAction(
        'SetBitmapFontAndTextureAtlasResourceName2',
        _('Bitmap files resources'),
        _('Change the Bitmap Font and/or the atlas image used by the object.'),
        _(
          'Set the bitmap font of _PARAM0_ to _PARAM1_ and the atlas to _PARAM2_'
        ),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .addParameter(
        'bitmapFontResource',
        _('Bitmap font resource name'),
        '',
        false
      )
      .addParameter(
        'imageResource',
        _('Texture atlas resource name'),
        '',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setBitmapFontAndTextureAtlasResourceName');

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
      .useStandardParameters(
        'string',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Alignment ("left", "right" or "center")')
        )
      )
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
        'res/conditions/wordWrap24_black.png',
        'res/conditions/wordWrap_black.png'
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
        'res/actions/wordWrap24_black.png',
        'res/actions/wordWrap_black.png'
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
        'res/actions/scaleWidth24_black.png'
      )
      .addParameter('object', _('Bitmap text'), 'BitmapTextObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setWrappingWidth')
      .setGetter('getWrappingWidth');

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
  registerEditorConfigurations: function (objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'BitmapText::BitmapTextObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/bitmap_text',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    /** The bitmap font used in case another font can't be loaded. */
    let defaultBitmapFont = null;

    const defaultBitmapFontInstallKey = 'GD-DEFAULT-BITMAP-FONT';

    /**
     * Map counting the number of "reference" to a bitmap font. This is useful
     * to uninstall a bitmap font when not used anymore.
     */
    const bitmapFontUsageCount = {};

    /**
     * We patch the installed font to use a name that is unique for each font data and texture,
     * to avoid conflicts between different font files using the same font name (by default, the
     * font name used by Pixi is the one inside the font data, but this name is not necessarily unique.
     * For example, 2 resources can use the same font, or we can have multiple objects with the same
     * font data and different textures).
     */
    const patchBitmapFont = (bitmapFont, bitmapFontInstallKey) => {
      const defaultName = bitmapFont.font;
      bitmapFont.font = bitmapFontInstallKey;
      PIXI.BitmapFont.available[bitmapFontInstallKey] = bitmapFont;

      delete PIXI.BitmapFont.available[defaultName];
      return PIXI.BitmapFont.available[bitmapFontInstallKey];
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
        ),
        defaultBitmapFontInstallKey
      );
      return defaultBitmapFont;
    };

    /**
     * Given a bitmap font resource name and a texture atlas resource name, returns the PIXI.BitmapFont
     * for it.
     * The font must be released with `releaseBitmapFont` when not used anymore - so that it can be removed
     * from memory when not used by any instance.
     *
     * @param pixiResourcesLoader
     * @param project
     * @param bitmapFontResourceName
     * @param textureAtlasResourceName
     */
    const obtainBitmapFont = (
      pixiResourcesLoader,
      project,
      bitmapFontResourceName,
      textureAtlasResourceName
    ) => {
      const bitmapFontInstallKey =
        bitmapFontResourceName + '@' + textureAtlasResourceName;

      if (PIXI.BitmapFont.available[bitmapFontInstallKey]) {
        // Return the existing BitmapFont that is already in memory and already installed.
        bitmapFontUsageCount[bitmapFontInstallKey] =
          (bitmapFontUsageCount[bitmapFontInstallKey] || 0) + 1;
        return Promise.resolve(PIXI.BitmapFont.available[bitmapFontInstallKey]);
      }

      // Get the atlas texture, the bitmap font data and install the font:
      const texture = pixiResourcesLoader.getPIXITexture(
        project,
        textureAtlasResourceName
      );

      const loadBitmapFont = () =>
        pixiResourcesLoader
          .getBitmapFontData(project, bitmapFontResourceName)
          .then((fontData) => {
            if (!texture.valid)
              throw new Error(
                'Tried to install a BitmapFont with an invalid texture.'
              );

            const bitmapFont = patchBitmapFont(
              PIXI.BitmapFont.install(fontData, texture),
              bitmapFontInstallKey
            );
            bitmapFontUsageCount[bitmapFontInstallKey] =
              (bitmapFontUsageCount[bitmapFontInstallKey] || 0) + 1;

            return bitmapFont;
          })
          .catch((err) => {
            console.warn('Unable to load font data:', err);
            console.info(
              'Is the texture atlas properly set for the Bitmap Text object? The default font will be used instead.'
            );

            const bitmapFont = getDefaultBitmapFont();
            return bitmapFont;
          });

      if (!texture.valid) {
        // Post pone texture update if texture is not loaded.
        // (otherwise, the bitmap font would not get updated when the
        // texture is loaded and updated).
        return new Promise((resolve) => {
          texture.once('update', () => {
            resolve(loadBitmapFont());
          });
        });
      } else {
        // We're ready to load the bitmap font now, as the texture
        // is already loaded.
        return loadBitmapFont();
      }
    };

    /**
     * When a font is not used by an object anymore (object destroyed or font changed),
     * call this function to decrease the internal count of objects using the font.
     *
     * Fonts are unloaded when not used anymore.
     */
    const releaseBitmapFont = (bitmapFontInstallKey) => {
      if (bitmapFontInstallKey === defaultBitmapFontInstallKey) {
        // Never uninstall the default bitmap font.
        return;
      }

      if (!bitmapFontUsageCount[bitmapFontInstallKey]) {
        console.error(
          'BitmapFont with name ' +
            bitmapFontInstallKey +
            ' was tried to be released but was never marked as used.'
        );
        return;
      }
      bitmapFontUsageCount[bitmapFontInstallKey]--;

      if (bitmapFontUsageCount[bitmapFontInstallKey] === 0) {
        PIXI.BitmapFont.uninstall(bitmapFontInstallKey);
        console.info(
          'Uninstalled BitmapFont "' + bitmapFontInstallKey + '" from memory.'
        );
      }
    };

    /**
     * Return the path to the thumbnail of the specified object.
     * This is called to update the PIXI object on the scene editor
     */
    class RenderedBitmapTextInstance extends RenderedInstance {
      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/bitmapfont24.png';
      }

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

      update() {
        const properties = this._associatedObjectConfiguration.getProperties();

        // Update the rendered text properties (note: Pixi is only
        // applying changes if there were changed).
        const rawText = properties.get('text').getValue();
        this._pixiObject.text = rawText;

        const opacity = +properties.get('opacity').getValue();
        this._pixiObject.alpha = opacity / 255;

        const align = properties.get('align').getValue();
        this._pixiObject.align = align;

        const color = properties.get('tint').getValue();
        this._pixiObject.tint = objectsRenderingService.rgbOrHexToHexNumber(
          color
        );

        const scale = +(properties.get('scale').getValue() || 1);
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
          // Release the old font (if it was installed).
          releaseBitmapFont(this._pixiObject.fontName);

          // Temporarily go back to the default font, as the PIXI.BitmapText
          // object does not support being displayed with a font not installed at all.
          // It will be replaced as soon as the proper font is loaded.
          this._pixiObject.fontName = getDefaultBitmapFont().font;

          this._currentBitmapFontResourceName = bitmapFontResourceName;
          this._currentTextureAtlasResourceName = textureAtlasResourceName;
          obtainBitmapFont(
            this._pixiResourcesLoader,
            this._project,
            this._currentBitmapFontResourceName,
            this._currentTextureAtlasResourceName
          ).then((bitmapFont) => {
            this._pixiObject.fontName = bitmapFont.font;
            this._pixiObject.fontSize = bitmapFont.size;
            this._pixiObject.dirty = true;
          });
        }

        // Set up the wrapping width if enabled.
        const wordWrap = properties.get('wordWrap').getValue() === 'true';
        if (wordWrap && this._instance.hasCustomSize()) {
          this._pixiObject.maxWidth =
            this.getCustomWidth() / this._pixiObject.scale.x;
          this._pixiObject.dirty = true;
        } else {
          this._pixiObject.maxWidth = 0;
          this._pixiObject.dirty = true;
        }

        this._pixiObject.position.x =
          this._instance.getX() + (this._pixiObject.textWidth * scale) / 2;
        this._pixiObject.position.y =
          this._instance.getY() + (this._pixiObject.textHeight * scale) / 2;
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );
      }

      onRemovedFromScene() {
        RenderedInstance.prototype.onRemovedFromScene.call(this);

        const fontName = this._pixiObject.fontName;
        this._pixiObject.destroy();
        releaseBitmapFont(fontName);
      }

      /**
       * Return the width of the instance, when it's not resized.
       */
      getDefaultWidth() {
        return this._pixiObject.width;
      }

      /**
       * Return the height of the instance, when it's not resized.
       */
      getDefaultHeight() {
        return this._pixiObject.height;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'BitmapText::BitmapTextObject',
      RenderedBitmapTextInstance
    );
  },
};
