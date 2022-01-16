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
    extension.setExtensionInformation(
      'TextInput',
      _('Text Input'),
      _('A text field the player can type text in to.'),
      'Florian Rival',
      'MIT'
    );

    const textInputObject = new gd.ObjectJsImplementation();
    // $FlowExpectedError - ignore Flow warning as we're creating an object
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
      }

      return false;
    };
    // $FlowExpectedError - ignore Flow warning as we're creating an object
    textInputObject.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('initialValue')
        .setValue(objectContent.initialValue)
        .setType('string')
        .setLabel(_('Initial value'));

      objectProperties
        .getOrCreate('placeholder')
        .setValue(objectContent.placeholder)
        .setType('string')
        .setLabel(_('Placeholder'));

      objectProperties
        .getOrCreate('fontResourceName')
        .setValue(objectContent.fontResourceName || '')
        .setType('resource')
        .addExtraInfo('font')
        .setLabel(_('Font'));

      objectProperties
        .getOrCreate('fontSize')
        .setValue((objectContent.fontSize || 20).toString())
        .setType('number')
        .setLabel(_('Font size (px)'));

      objectProperties
        .getOrCreate('inputType')
        .setValue(objectContent.inputType || '')
        .setType('choice')
        .addExtraInfo('text')
        .addExtraInfo('email')
        .addExtraInfo('password')
        .addExtraInfo('number')
        .addExtraInfo('telephone number')
        .addExtraInfo('url')
        .addExtraInfo('search')
        // .addExtraInfo('text area') // TODO
        .setLabel(_('Input type'));

      objectProperties
        .getOrCreate('textColor')
        .setValue(objectContent.textColor || '0;0;0')
        .setType('color')
        .setLabel(_('Text color'));

      objectProperties
        .getOrCreate('fillColor')
        .setValue(objectContent.fillColor || '255;255;255')
        .setType('color')
        .setLabel(_('Fill color'));

      objectProperties
        .getOrCreate('fillOpacity')
        .setValue((objectContent.fillOpacity || 255).toString())
        .setType('number')
        .setLabel(_('Fill opacity'));

      objectProperties
        .getOrCreate('borderColor')
        .setValue(objectContent.borderColor || '0;0;0')
        .setType('color')
        .setLabel(_('Border color'));

      objectProperties
        .getOrCreate('borderOpacity')
        .setValue((objectContent.borderOpacity || 255).toString())
        .setType('number')
        .setLabel(_('Border opacity'));

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
        fillOpacity: 1,
        borderColor: '0;0;0',
        borderOpacity: 1,
      })
    );

    // $FlowExpectedError - ignore Flow warning as we're creating an object
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
    // $FlowExpectedError - ignore Flow warning as we're creating an object
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
        'CppPlatform/Extensions/texticon24.png', // TODO
        textInputObject
      )
      .setIncludeFile('Extensions/TextInput/textinputruntimeobject.js')
      .addIncludeFile(
        'Extensions/TextInput/textinputruntimeobject-pixi-renderer.js'
      );

    // Properties expressions/conditions/actions:
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
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('string')
      .setFunctionName('setValue')
      .setGetter('getValue');

    object
      .addExpressionAndConditionAndAction(
        'string',
        'Placeholder',
        _('Placeholder'),
        _('the placeholder'),
        _('the placeholder'),
        '',
        'res/conditions/text24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('string')
      .setFunctionName('setPlaceholder')
      .setGetter('getPlaceholder');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Font size',
        _('Font size'),
        _('the font size'),
        _('the font size'),
        '',
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('number')
      .setFunctionName('setFontSize')
      .setGetter('getFontSize');

    object
      .addExpressionAndCondition(
        'string',
        'FontResourceName',
        _('Font name'),
        _('the font name'),
        _('the font name'),
        '',
        'res/conditions/font24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('string')
      .setFunctionName('getFontResourceName');

    // TODO: could this be merged with the previous expression and condition?
    object
      .addScopedAction(
        'SetFontResourceName',
        _('Font name'),
        _('Set the font of the object.'),
        _('Set the font of _PARAM0_ to _PARAM1_'),
        '',
        'res/actions/font24.png',
        'res/actions/font.png'
      )
      .addParameter('object', _('Bitmap text'), 'TextInputObject', false)
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
        '',
        'res/conditions/text24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('string') // TODO: stringWithSelector?
      .setFunctionName('setInputType')
      .setGetter('getInputType');

    object
      .addScopedAction(
        'SetTextColor',
        _('Text color'),
        _('Set the text color of the object.'),
        _('Set the text color of _PARAM0_ to _PARAM1_'),
        '',
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
        '',
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
        '',
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('number')
      .setFunctionName('setFillOpacity')
      .setGetter('getFillOpacity');

    object
      .addScopedAction(
        'SetBorderColor',
        _('Border color'),
        _('Set the border color of the object.'),
        _('Set the border color of _PARAM0_ to _PARAM1_'),
        '',
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
        '',
        'res/conditions/opacity24.png'
      )
      .addParameter('object', _('Text input'), 'TextInputObject', false)
      .useStandardParameters('number')
      .setFunctionName('setBorderOpacity')
      .setGetter('getBorderOpacity');

    // TODO: expressions for color

    // Other expressions/conditions/actions:
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
      .useStandardParameters('number')
      .setFunctionName('setOpacity')
      .setGetter('getOpacity');

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
      'TextInput::TextInputObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/extensions/extend-gdevelop', // TODO
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

    const defaultWidth = 300;
    const defaultHeight = 30;
    const textMaskBorder = 2;

    class RenderedTextInputObjectInstance extends RenderedInstance {
      _pixiText;
      _pixiTextMask;
      _pixiGraphics;
      _fontResourceName = '';

      constructor(
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          layout,
          instance,
          associatedObject,
          pixiContainer,
          pixiResourcesLoader
        );

        //Setup the PIXI object:
        this._pixiGraphics = new PIXI.Graphics();
        this._pixiTextMask = new PIXI.Graphics();
        this._pixiText = new PIXI.Text(' ', {
          align: 'left',
          fontSize: 20,
        });
        this._pixiText.mask = this._pixiTextMask;
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this._pixiGraphics);
        this._pixiObject.addChild(this._pixiTextMask);
        this._pixiObject.addChild(this._pixiText);
        this._pixiContainer.addChild(this._pixiObject);
        this.update();
      }

      static getThumbnail(project, resourcesLoader, object) {
        return 'CppPlatform/Extensions/texticon24.png'; // TODO: icon
      }

      update() {
        const instance = this._instance;
        const properties = this._associatedObject.getProperties();

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
        if (this._pixiText.style.fill !== finalTextColor) {
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
              // Once the font is loaded, we can use the given fontFamily.
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

        this._pixiObject.position.x = instance.getX();
        this._pixiObject.position.y = instance.getY();

        let width = defaultWidth;
        let height = defaultHeight;
        if (instance.hasCustomSize()) {
          width = instance.getCustomWidth();
          height = instance.getCustomHeight();
        }

        this._pixiTextMask.clear();
        this._pixiTextMask.drawRect(
          textMaskBorder,
          textMaskBorder,
          width - 2 * textMaskBorder,
          height - 2 * textMaskBorder
        );

        this._pixiText.position.y = height / 2 - this._pixiText.height / 2;

        const fillColor = properties.get('fillColor').getValue();
        const fillOpacity = properties.get('fillOpacity').getValue();
        const borderColor = properties.get('borderColor').getValue();
        const borderOpacity = properties.get('borderOpacity').getValue();

        this._pixiGraphics.clear();
        this._pixiGraphics.lineStyle(
          1,
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
        return defaultWidth;
      }

      getDefaultHeight() {
        return defaultHeight;
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'TextInput::TextInputObject',
      RenderedTextInputObjectInstance
    );
  },
};
