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
        'TextInput',
        _('Text Input'),
        _('A text field the player can type text into.'),
        'Florian Rival',
        'MIT'
      )
      .setCategory('User interface');
    extension
      .addInstructionOrExpressionGroupMetadata(_('Text Input'))
      .setIcon('JsPlatform/Extensions/text_input.svg');

    const textInputObject = new gd.ObjectJsImplementation();
    textInputObject.updateProperty = function (
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName === 'initialValue') {
        objectContent.initialValue = newValue;
        return true;
      } else if (propertyName === 'placeholder') {
        objectContent.placeholder = newValue;
        return true;
      } else if (propertyName === 'fontResourceName') {
        objectContent.fontResourceName = newValue;
        return true;
      } else if (propertyName === 'fontSize') {
        objectContent.fontSize = Math.max(1, parseFloat(newValue));
        return true;
      } else if (propertyName === 'inputType') {
        objectContent.inputType = newValue;
        return true;
      } else if (propertyName === 'textColor') {
        objectContent.textColor = newValue;
        return true;
      } else if (propertyName === 'fillColor') {
        objectContent.fillColor = newValue;
        return true;
      } else if (propertyName === 'fillOpacity') {
        objectContent.fillOpacity = Math.max(
          0,
          Math.min(255, parseFloat(newValue))
        );
        return true;
      } else if (propertyName === 'borderColor') {
        objectContent.borderColor = newValue;
        return true;
      } else if (propertyName === 'borderOpacity') {
        objectContent.borderOpacity = Math.max(
          0,
          Math.min(255, parseFloat(newValue))
        );
        return true;
      } else if (propertyName === 'borderWidth') {
        objectContent.borderWidth = Math.max(0, parseFloat(newValue));
        return true;
      } else if (propertyName === 'readOnly') {
        objectContent.readOnly = newValue === '1';
        return true;
      } else if (propertyName === 'disabled') {
        objectContent.disabled = newValue === '1';
        return true;
      }

      return false;
    };
    textInputObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('initialValue')
        .setValue(objectContent.initialValue)
        .setType('string')
        .setLabel(_('Initial value'))
        .setGroup(_('Content'));

      objectProperties
        .getOrCreate('placeholder')
        .setValue(objectContent.placeholder)
        .setType('string')
        .setLabel(_('Placeholder'))
        .setGroup(_('Content'));

      objectProperties
        .getOrCreate('fontResourceName')
        .setValue(objectContent.fontResourceName || '')
        .setType('resource')
        .addExtraInfo('font')
        .setLabel(_('Font'))
        .setGroup(_('Font'));

      objectProperties
        .getOrCreate('fontSize')
        .setValue((objectContent.fontSize || 20).toString())
        .setType('number')
        .setLabel(_('Font size (px)'))
        .setGroup(_('Font'));

      objectProperties
        .getOrCreate('inputType')
        .setValue(objectContent.inputType || '')
        .setType('choice')
        .addExtraInfo('text')
        .addExtraInfo('text area')
        .addExtraInfo('email')
        .addExtraInfo('password')
        .addExtraInfo('number')
        .addExtraInfo('telephone number')
        .addExtraInfo('url')
        .addExtraInfo('search')
        .setLabel(_('Input type'))
        .setDescription(
          _(
            'By default, a "text" is single line. Choose "text area" to allow multiple lines to be entered.'
          )
        );

      objectProperties
        .getOrCreate('readOnly')
        .setValue(objectContent.readOnly ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Read only'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('disabled')
        .setValue(objectContent.disabled ? 'true' : 'false')
        .setType('boolean')
        .setLabel(_('Disabled'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('textColor')
        .setValue(objectContent.textColor || '0;0;0')
        .setType('color')
        .setLabel(_('Text color'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('fillColor')
        .setValue(objectContent.fillColor || '255;255;255')
        .setType('color')
        .setLabel(_('Fill color'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('fillOpacity')
        .setValue(
          (objectContent.fillOpacity != undefined
            ? objectContent.fillOpacity
            : 255
          ).toString()
        )
        .setType('number')
        .setLabel(_('Fill opacity'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('borderColor')
        .setValue(objectContent.borderColor || '0;0;0')
        .setType('color')
        .setLabel(_('Border color'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('borderOpacity')
        .setValue(
          (objectContent.borderOpacity != undefined
            ? objectContent.borderOpacity
            : 255
          ).toString()
        )
        .setType('number')
        .setLabel(_('Border opacity'))
        .setGroup(_('Field appearance'));

      objectProperties
        .getOrCreate('borderWidth')
        .setValue((objectContent.borderWidth || 0).toString())
        .setType('number')
        .setLabel(_('Border width'))
        .setGroup(_('Field appearance'));

      return objectProperties;
    };
    textInputObject.setRawJSONContent(
      JSON.stringify({
        initialValue: '',
        placeholder: 'Touch to start typing',
        fontResourceName: '',
        fontSize: 20,
        inputType: 'text',
        textColor: '0;0;0',
        fillColor: '255;255;255',
        fillOpacity: 255,
        borderColor: '0;0;0',
        borderOpacity: 255,
        borderWidth: 1,
        readOnly: false,
        disabled: false,
      })
    );

    textInputObject.updateInitialInstanceProperty = function (
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      if (propertyName === 'initialValue') {
        instance.setRawStringProperty('initialValue', newValue);
        return true;
      } else if (propertyName === 'placeholder') {
        instance.setRawStringProperty('placeholder', newValue);
        return true;
      }

      return false;
    };
    textInputObject.getInitialInstanceProperties = function (
      content,
      instance,
      project,
      layout
    ) {
      const instanceProperties = new gd.MapStringPropertyDescriptor();

      instanceProperties
        .getOrCreate('initialValue')
        .setValue(instance.getRawStringProperty('initialValue'))
        .setType('string')
        .setLabel(_('Initial value'));
      instanceProperties
        .getOrCreate('placeholder')
        .setValue(instance.getRawStringProperty('placeholder'))
        .setType('string')
        .setLabel(_('Placeholder'));

      return instanceProperties;
    };

    const object = extension
      .addObject(
        'TextInputObject',
        _('Text input'),
        _('A text field the player can type text into.'),
        'JsPlatform/Extensions/text_input.svg',
        textInputObject
      )
      .setCategoryFullName(_('User interface'))
      // Effects are unsupported because the object is not rendered with PIXI.
      .setIncludeFile('Extensions/TextInput/textinputruntimeobject.js')
      .addIncludeFile(
        'Extensions/TextInput/textinputruntimeobject-pixi-renderer.js'
      )
      .addDefaultBehavior('TextContainerCapability::TextContainerBehavior')
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('OpacityCapability::OpacityBehavior');

    // Properties expressions/conditions/actions:

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
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'string',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Text'))
      )
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
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .setFunctionName('getText');

    object
      .addExpressionAndConditionAndAction(
        'string',
        'Placeholder',
        _('Placeholder'),
        _('the placeholder'),
        _('the placeholder'),
        '',
        'res/conditions/text24_black.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'string',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Text'))
      )
      .setFunctionName('setPlaceholder')
      .setGetter('getPlaceholder');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Font size',
        _('Font size'),
        _('the font size'),
        _('the font size'),
        _('Font'),
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setFontSize')
      .setGetter('getFontSize');

    object
      .addExpressionAndCondition(
        'string',
        'FontResourceName',
        _('Font name'),
        _('the font name'),
        _('the font name'),
        _('Font'),
        'res/conditions/font24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('string', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getFontResourceName');

    // TODO: could this be merged with the previous expression and condition?
    object
      .addScopedAction(
        'SetFontResourceName',
        _('Font name'),
        _('Set the font of the object.'),
        _('Set the font of _PARAM0_ to _PARAM1_'),
        _('Font'),
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .addParameter('fontResource', _('Font resource name'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setFontResourceName');

    object
      .addExpressionAndConditionAndAction(
        'string',
        'InputType',
        _('Input type'),
        _('the input type'),
        _('the input type'),
        _('Type'),
        'res/conditions/text24_black.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'stringWithSelector',
        gd.ParameterOptions.makeNewOptions()
          .setDescription(_('Input type'))
          .setTypeExtraInfo(
            JSON.stringify([
              'text',
              'text area',
              'email',
              'password',
              'number',
              'telephone number',
              'url',
              'search',
              'email',
            ])
          )
      )
      .setFunctionName('setInputType')
      .setGetter('getInputType');

    object
      .addScopedAction(
        'SetTextColor',
        _('Text color'),
        _('Set the text color of the object.'),
        _('Set the text color of _PARAM0_ to _PARAM1_'),
        _('Field appearance'),
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .addParameter('color', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTextColor');

    object
      .addScopedAction(
        'SetFillColor',
        _('Fill color'),
        _('Set the fill color of the object.'),
        _('Set the fill color of _PARAM0_ to _PARAM1_'),
        _('Field appearance'),
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .addParameter('color', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setFillColor');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'FillOpacity',
        _('Fill opacity'),
        _('the fill opacity, between 0 (fully transparent) and 255 (opaque)'),
        _('the fill opacity'),
        _('Field appearance'),
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Opacity (0-255)')
        )
      )
      .setFunctionName('setFillOpacity')
      .setGetter('getFillOpacity');

    object
      .addScopedAction(
        'SetBorderColor',
        _('Border color'),
        _('Set the border color of the object.'),
        _('Set the border color of _PARAM0_ to _PARAM1_'),
        _('Field appearance'),
        'res/actions/color24.png',
        'res/actions/color.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .addParameter('color', _('Color'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setBorderColor');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'BorderOpacity',
        _('Border opacity'),
        _('the border opacity, between 0 (fully transparent) and 255 (opaque)'),
        _('the border opacity'),
        _('Field appearance'),
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Opacity (0-255)')
        )
      )
      .setFunctionName('setBorderOpacity')
      .setGetter('getBorderOpacity');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'BorderWidth',
        _('Border width'),
        _('the border width'),
        _('the border width'),
        _('Field appearance'),
        'res/conditions/outlineSize24_black.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setBorderWidth')
      .setGetter('getBorderWidth');

    // TODO: expressions for colors?

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'ReadOnly',
        _('Read-only'),
        _('the text input is read-only'),
        _('read-only'),
        '',
        'res/conditions/text24_black.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters(
        'boolean',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Read-only?'))
      )
      .setFunctionName('setReadOnly')
      .setGetter('isReadOnly');

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'Disabled',
        _('Disabled'),
        _('the text input is disabled'),
        _('disabled'),
        '',
        'res/conditions/text24_black.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('boolean', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setDisabled')
      .setGetter('isDisabled');

    // Other expressions/conditions/actions:

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
      .addParameter('object', _('Text input'), 'TextInputObject', false)
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
      .addScopedCondition(
        'Focused',
        _('Focused'),
        _(
          'Check if the text input is focused (the cursor is in the field and player can type text in).'
        ),
        _('_PARAM0_ is focused'),
        '',
        'res/conditions/surObjet24.png',
        'res/conditions/surObjet.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .getCodeExtraInformation()
      .setFunctionName('isFocused');

    object
      .addScopedAction(
        'Focus',
        _('Focus'),
        _(
          'Focus the input so that text can be entered (like if it was touched/clicked).'
        ),
        _('Focus _PARAM0_'),
        _(''),
        'res/conditions/surObjet24.png',
        'res/conditions/surObjet.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .getCodeExtraInformation()
      .setFunctionName('focus');

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
      'TextInput::TextInputObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/text_input',
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

    const DEFAULT_WIDTH = 300;
    const DEFAULT_HEIGHT = 30;
    const TEXT_MASK_PADDING = 2;

    class RenderedTextInputObjectInstance extends RenderedInstance {
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

        this._fontResourceName = '';
        this._finalTextColor = 0x0;
        this._pixiGraphics = new PIXI.Graphics();
        this._pixiTextMask = new PIXI.Graphics();
        this._pixiText = new PIXI.Text(' ', {
          align: 'left',
          fontSize: 20,
        });
        this._pixiText.mask = this._pixiTextMask;
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this._pixiGraphics);
        this._pixiObject.addChild(this._pixiText);
        this._pixiObject.addChild(this._pixiTextMask);
        this._pixiContainer.addChild(this._pixiObject);
        this.update();
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiText.destroy(true);
        this._pixiObject.destroy({ children: true });
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/text_input.svg';
      }

      update() {
        const instance = this._instance;
        const properties = this._associatedObjectConfiguration.getProperties();

        const placeholder =
          instance.getRawStringProperty('placeholder') ||
          properties.get('placeholder').getValue();
        const initialValue =
          instance.getRawStringProperty('initialValue') ||
          properties.get('initialValue').getValue();
        const hasInitialValue = initialValue !== '';
        this._pixiText.text = hasInitialValue ? initialValue : placeholder;

        const textColor = properties.get('textColor').getValue();
        const finalTextColor = hasInitialValue
          ? objectsRenderingService.rgbOrHexToHexNumber(textColor)
          : 0x888888;
        if (this._finalTextColor !== finalTextColor) {
          this._finalTextColor = finalTextColor;
          this._pixiText.style.fill = finalTextColor;
          this._pixiText.dirty = true;
        }

        const fontSize = parseFloat(properties.get('fontSize').getValue());
        if (this._pixiText.style.fontSize !== fontSize) {
          this._pixiText.style.fontSize = fontSize;
          this._pixiText.dirty = true;
        }

        const fontResourceName = properties.get('fontResourceName').getValue();
        if (this._fontResourceName !== fontResourceName) {
          this._fontResourceName = fontResourceName;

          this._pixiResourcesLoader
            .loadFontFamily(this._project, fontResourceName)
            .then((fontFamily) => {
              this._pixiText.style.fontFamily = fontFamily;
              this._pixiText.dirty = true;
            })
            .catch((err) => {
              // Ignore errors
              console.warn(
                'Unable to load font family for RenderedTextInputObjectInstance',
                err
              );
            });
        }

        // Position the object.
        let width = DEFAULT_WIDTH;
        let height = DEFAULT_HEIGHT;
        if (instance.hasCustomSize()) {
          width = this.getCustomWidth();
          height = this.getCustomHeight();
        }

        this._pixiObject.pivot.x = width / 2;
        this._pixiObject.pivot.y = height / 2;
        this._pixiObject.position.x = instance.getX() + width / 2;
        this._pixiObject.position.y = instance.getY() + height / 2;
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );

        const borderWidth =
          parseFloat(properties.get('borderWidth').getValue()) || 0;

        // Draw the mask for the text.
        const textOffset = borderWidth + TEXT_MASK_PADDING;
        this._pixiTextMask.clear();
        this._pixiTextMask.beginFill(0xdddddd, 1);
        this._pixiTextMask.drawRect(
          textOffset,
          textOffset,
          width - 2 * textOffset,
          height - 2 * textOffset
        );
        this._pixiTextMask.endFill();

        const isTextArea =
          properties.get('inputType').getValue() === 'text area';

        this._pixiText.position.x = textOffset;
        this._pixiText.position.y = isTextArea
          ? textOffset
          : height / 2 - this._pixiText.height / 2;

        // Draw the background and border.
        const fillColor = properties.get('fillColor').getValue();
        const fillOpacity = parseFloat(
          properties.get('fillOpacity').getValue()
        );
        const borderColor = properties.get('borderColor').getValue();
        const borderOpacity = parseFloat(
          properties.get('borderOpacity').getValue()
        );

        this._pixiGraphics.clear();
        this._pixiGraphics.lineStyle(
          borderWidth,
          objectsRenderingService.rgbOrHexToHexNumber(borderColor),
          borderOpacity / 255
        );
        this._pixiGraphics.beginFill(
          objectsRenderingService.rgbOrHexToHexNumber(fillColor),
          fillOpacity / 255
        );
        this._pixiGraphics.drawRect(0, 0, width, height);
        this._pixiGraphics.endFill();
      }

      getDefaultWidth() {
        return DEFAULT_WIDTH;
      }

      getDefaultHeight() {
        return DEFAULT_HEIGHT;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'TextInput::TextInputObject',
      RenderedTextInputObjectInstance
    );
  },
};
