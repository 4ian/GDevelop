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
        'BBText',
        _('BBCode Text Object'),
        _(
          'Displays a rich text label using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).'
        ),
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/bbtext');

    var objectBBText = new gd.ObjectJsImplementation();
    // $FlowExpectedError
    objectBBText.updateProperty = function (
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
    objectBBText.getProperties = function (objectContent) {
      const objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties
        .getOrCreate('text')
        .setValue(objectContent.text)
        .setType('textarea')
        .setLabel(_('BBCode text'));

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
    objectBBText.setRawJSONContent(
      JSON.stringify({
        text:
          '[b]bold[/b] [i]italic[/i] [size=15]smaller[/size] [font=times]times[/font] font\n[spacing=12]spaced out[/spacing]\n[outline=yellow]outlined[/outline] [shadow=red]DropShadow[/shadow] ',
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
    objectBBText.updateInitialInstanceProperty = function (
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
    objectBBText.getInitialInstanceProperties = function (
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
        _(
          'Displays a rich text label using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).'
        ),
        'JsPlatform/Extensions/bbcode32.png',
        objectBBText
      )
      .setIncludeFile('Extensions/BBText/bbtextruntimeobject.js')
      .addIncludeFile('Extensions/BBText/bbtextruntimeobject-pixi-renderer.js')
      .addIncludeFile(
        'Extensions/BBText/pixi-multistyle-text/dist/pixi-multistyle-text.umd.js'
      );

    /**
     * Utility function to add both a setter and a getter to a property from a list.
     * Useful for setting multiple generic properties.
     */
    const addSettersAndGettersToObject = (gdObject, properties, objectName) => {
      properties.forEach((property) => {
        const parameterType =
          property.type === 'boolean' ? 'yesorno' : property.type;

        // Add the expression
        if (parameterType === 'number') {
          gdObject
            .addExpression(
              `Get${property.functionName}`,
              property.expressionLabel,
              property.expressionDescription,
              '',
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        } else if (parameterType === 'string') {
          gdObject
            .addStrExpression(
              `Get${property.functionName}`,
              property.expressionLabel,
              property.expressionDescription,
              '',
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }

        // Add the action
        if (parameterType === 'number' || parameterType === 'string') {
          const expressionType =
            parameterType === 'number' ? 'expression' : 'string';
          gdObject
            .addAction(
              `Set${property.functionName}`,
              property.paramLabel,
              property.actionDescription,
              property.actionSentence,
              '',
              property.iconPath,
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .useStandardOperatorParameters(parameterType)
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setGetter(`get${property.functionName}`);
        } else {
          gdObject
            .addAction(
              `Set${property.functionName}`,
              property.paramLabel,
              property.actionDescription,
              property.actionSentence,
              '',
              property.iconPath,
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .addParameter(
              parameterType,
              property.paramLabel,
              property.options
                ? '["' + property.options.join('", "') + '"]'
                : '',
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setGetter(`get${property.functionName}`);
        }

        // Add condition
        if (parameterType === 'string' || parameterType === 'number') {
          const propExpressionType =
            parameterType === 'string' ? 'string' : 'expression';
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.paramLabel,
              property.conditionDescription,
              property.conditionSentence,
              '',
              property.iconPath,
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .useStandardRelationalOperatorParameters(parameterType)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        } else if (parameterType === 'yesorno') {
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.paramLabel,
              property.conditionDescription,
              property.conditionSentence,
              '',
              property.iconPath,
              property.iconPath
            )
            .addParameter('object', objectName, objectName, false)
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }
      });
    };

    const setterAndGetterProperties = [
      {
        functionName: 'BBText',
        iconPath: 'res/actions/text24.png',
        type: 'string',
        paramLabel: _('BBCode text'),
        conditionDescription: _('Compare the value of the BBCode text.'),
        conditionSentence: _('the BBCode text'),
        actionDescription: _('Set BBCode text'),
        actionSentence: _('the BBCode text'),
        expressionLabel: _('Get BBCode text'),
        expressionDescription: _('Get BBCode text'),
      },
      {
        functionName: 'Color',
        iconPath: 'res/actions/color24.png',
        type: 'color',
        paramLabel: _('Color'),
        conditionDescription: '', // No conditions for a "color" property
        conditionSentence: '', // No conditions for a "color" property
        actionDescription: _('Set base color'),
        actionSentence: _('Set base color of _PARAM0_ to _PARAM1_'),
        expressionLabel: '', // No expression for a "color" property
        expressionDescription: '', // No expression for a "color" property
      },
      {
        functionName: 'Opacity',
        iconPath: 'res/actions/opacity24.png',
        type: 'number',
        paramLabel: _('Opacity'),
        conditionDescription: _(
          'Compare the value of the base opacity of the text.'
        ),
        conditionSentence: _('the base opacity'),
        actionDescription: _('Set base opacity'),
        actionSentence: _('the base opacity'),
        expressionLabel: _('Get the base opacity'),
        expressionDescription: _('Get the base opacity'),
      },
      {
        functionName: 'FontSize',
        iconPath: 'res/actions/characterSize24.png',
        type: 'number',
        paramLabel: _('Font size'),
        conditionDescription: _('Compare the base font size of the text.'),
        conditionSentence: _('the base font size'),
        actionDescription: _('Set base font size'),
        actionSentence: _('the base font size'),
        expressionLabel: _('Get the base font size'),
        expressionDescription: _('Get the base font size'),
      },
      {
        functionName: 'FontFamily',
        iconPath: 'res/actions/font24.png',
        type: 'string',
        paramLabel: _('Font family'),
        conditionDescription: _('Compare the value of font family'),
        conditionSentence: _('the base font family'),
        actionDescription: _('Set font family'),
        actionSentence: _('the base font family'),
        expressionLabel: _('Get the base font family'),
        expressionDescription: _('Get the base font family'),
      },
      {
        functionName: 'Alignment',
        iconPath: 'res/actions/textAlign24.png',
        type: 'stringWithSelector',
        paramLabel: _('Alignment'),
        options: ['left', 'right', 'center'],
        conditionDescription: _('Check the current text alignment'),
        conditionSentence: _('The text alignment of _PARAM0_ is _PARAM1_'),
        actionDescription: _('Change the alignment of the text.'),
        actionSentence: _('Set text alignment of _PARAM0_ to _PARAM1_'),
        expressionLabel: _('Get the text alignment'),
        expressionDescription: _('Get the text alignment'),
      },
      {
        functionName: 'WordWrap',
        iconPath: 'res/actions/scaleWidth24.png',
        type: 'boolean',
        paramLabel: _('Word wrap'),
        conditionDescription: _('Check if word wrap is enabled'),
        conditionSentence: _('Word wrap is enabled'),
        actionDescription: _('Set word wrap'),
        actionSentence: _('Activate word wrap for _PARAM0_: _PARAM1_'),
        expressionLabel: '',
        expressionDescription: '',
      },
      {
        functionName: 'WrappingWidth',
        iconPath: 'res/actions/scaleWidth24.png',
        type: 'number',
        paramLabel: _('Wrapping width'),
        conditionDescription: _(
          'Compare the width, in pixels, after which the text is wrapped on next line.'
        ),
        conditionSentence: _('the wrapping width'),
        actionDescription: _(
          'Change the width, in pixels, after which the text is wrapped on next line.'
        ),
        actionSentence: _('the wrapping width'),
        expressionLabel: _('Get the wrapping width'),
        expressionDescription: _('Get the wrapping width'),
      },
    ];

    addSettersAndGettersToObject(object, setterAndGetterProperties, 'BBText');

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
      'BBText::BBText',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/bbtext',
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
    const MultiStyleText = objectsRenderingService.requireModule(
      __dirname,
      'pixi-multistyle-text/dist/pixi-multistyle-text.umd'
    );

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

      const bbTextStyles = {
        default: {
          // Use a default font family the time for the resource font to be loaded.
          fontFamily: 'Arial',
          fontSize: '24px',
          fill: '#cccccc',
          tagStyle: 'bbcode',
          wordWrap: true,
          wordWrapWidth: 250, // This value is the default wrapping width of the runtime object.
          align: 'left',
        },
      };

      this._pixiObject = new MultiStyleText('', bbTextStyles);

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
    RenderedBBTextInstance.getThumbnail = function (
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/bbcode24.png';
    };

    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedBBTextInstance.prototype.update = function () {
      const properties = this._associatedObject.getProperties();

      const rawText = properties.get('text').getValue();
      if (rawText !== this._pixiObject.text) {
        this._pixiObject.text = rawText;
      }

      const opacity = properties.get('opacity').getValue();
      this._pixiObject.alpha = opacity / 255;

      const color = properties.get('color').getValue();
      this._pixiObject.textStyles.default.fill = color;

      const fontSize = properties.get('fontSize').getValue();
      this._pixiObject.textStyles.default.fontSize = `${fontSize}px`;

      const fontResourceName = properties.get('fontFamily').getValue();

      if (this._fontResourceName !== fontResourceName) {
        this._fontResourceName = fontResourceName;

        this._pixiResourcesLoader
          .loadFontFamily(this._project, fontResourceName)
          .then((fontFamily) => {
            // Once the font is loaded, we can use the given fontFamily.
            this._pixiObject.textStyles.default.fontFamily = fontFamily;
            this._pixiObject.dirty = true;
          })
          .catch((err) => {
            // Ignore errors
            console.warn(
              'Unable to load font family for RenderedBBTextInstance',
              err
            );
          });
      }

      const wordWrap = properties.get('wordWrap').getValue() === 'true';
      if (wordWrap !== this._pixiObject._style.wordWrap) {
        this._pixiObject._style.wordWrap = wordWrap;
        this._pixiObject.dirty = true;
      }

      const align = properties.get('align').getValue();
      if (align !== this._pixiObject._style.align) {
        this._pixiObject._style.align = align;
        this._pixiObject.dirty = true;
      }

      this._pixiObject.position.x =
        this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.position.y =
        this._instance.getY() + this._pixiObject.height / 2;
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );

      if (this._instance.hasCustomSize() && this._pixiObject) {
        const customWidth = this._instance.getCustomWidth();
        if (
          this._pixiObject &&
          this._pixiObject._style.wordWrapWidth !== customWidth
        ) {
          this._pixiObject._style.wordWrapWidth = customWidth;
          this._pixiObject.dirty = true;
        }
      }
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedBBTextInstance.prototype.getDefaultWidth = function () {
      return this._pixiObject.width;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedBBTextInstance.prototype.getDefaultHeight = function () {
      return this._pixiObject.height;
    };

    objectsRenderingService.registerInstanceRenderer(
      'BBText::BBText',
      RenderedBBTextInstance
    );
  },
};
