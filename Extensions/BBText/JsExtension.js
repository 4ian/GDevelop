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
module.exports = {
  createExtension: function(_, gd) {
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
      .setExtensionHelpPath('/objects/bbtext_object');

    var objectBBText = new gd.ObjectJsImplementation();
    objectBBText.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName in objectContent) {
        if (typeof objectContent[propertyName] === 'boolean')
          objectContent[propertyName] = newValue === '1';
        else objectContent[propertyName] = newValue;
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
        'fontSize',
        new gd.PropertyDescriptor(objectContent.fontSize)
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
        'fontFamily',
        new gd.PropertyDescriptor(objectContent.fontFamily)
          .setType('string')
          .setLabel(_('Base font family'))
      );

      objectProperties.set(
        'wordWrap',
        new gd.PropertyDescriptor(objectContent.wordWrap ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Word wrapping'))
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
        fontSize: '20',
        visible: true,
        color: '#000000',
        fontFamily: 'Arial',
        align: 'left',
        wordWrap: true,
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
        _(
          'Displays a rich text label using BBCode markup (allowing to set parts of the text as bold, italic, use different colors and shadows).'
        ),
        'JsPlatform/Extensions/bbcode32.png',
        objectBBText
      )
      .setIncludeFile('Extensions/BBText/bbtextruntimeobject.js')
      .addIncludeFile('Extensions/BBText/bbtextruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/BBText/dist/pixi-multistyle-text.umd.js');

    // Utility function to add both a setter and a getter to a property from a list. Useful for setting multiple generic properties
    const addSettersAndGettersToObjectHelper = (
      gdObject,
      properties,
      objectName
    ) => {
      properties.forEach(property => {
        const parameterType =
          property.type === 'boolean' ? 'yesorno' : property.type;

        // Add all the generic GETTERS
        if (parameterType === 'number') {
          gdObject
            .addExpression(
              `Get${property.functionName}`,
              _('Get ') + property.description,
              _('Get ') + property.description,
              _(''),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        } else {
          gdObject
            .addStrExpression(
              `Get${property.functionName}`,
              _('Get ') + property.description,
              _('Get ') + property.description,
              _(''),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }

        // Add all the generic SETTERS
        if (parameterType === 'number' || parameterType === 'string') {
          gdObject
            .addAction(
              `Set${property.functionName}`,
              _('Set ') + property.description,
              _('Set ') + property.description,
              _('Do _PARAM1__PARAM2_ to the ') +
                property.description +
                _(' of _PARAM0_'),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .addParameter('operator', _("Modification's sign"), '', false)
            .addParameter(parameterType, _(property.paramLabel), '', false)
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setManipulatedType(parameterType)
            .setGetter(`get${property.functionName}`);
        } else {
          // Setter doesnt have a +- modifier (Color, alignment, etc)
          gdObject
            .addAction(
              `Set${property.functionName}`,
              _('Set ') + property.description,
              _('Set ') + property.description,
              _('Set ') + property.description + _(' of _PARAM0_ to _PARAM1_'),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .addParameter(
              parameterType,
              _(property.paramLabel),
              property.options ? property.options : '',
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`set${property.functionName}`)
            .setGetter(`get${property.functionName}`);
        }

        // Add compare Conditions via getters
        if (parameterType === 'string' || parameterType === 'number') {
          const propExpressionType =
            parameterType === 'string' ? 'string' : 'expression';
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.description,
              _('Check if the ') + property.description + _(' equals a value'),
              _('The ') +
                property.paramLabel +
                _(' of _PARAM0_ is _PARAM1__PARAM2_'),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .addParameter(
              'relationalOperator',
              _('Sign of the test'),
              '',
              false
            )
            .addParameter(
              propExpressionType,
              _(`${parameterType} value`),
              '',
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`)
            .setManipulatedType(parameterType);
        } else if (parameterType === 'yesorno') {
          gdObject
            .addCondition(
              `Is${property.functionName}`,
              property.description + _(' is enabled'),
              _('Check if the') + property.description + _(' is enabled'),
              property.paramLabel + _(' of _PARAM0_ is enabled'),
              '',
              `${property.iconPath}.png`,
              `${property.iconPath}.png`
            )
            .addParameter(
              'object',
              _(`${objectName} object`),
              objectName,
              false
            )
            .getCodeExtraInformation()
            .setFunctionName(`get${property.functionName}`);
        }
      });
    };

    const setterAndGetterProperties = [
      {
        functionName: 'BBText',
        description: _('BBCode formatted text'),
        iconPath: 'res/actions/textAlign24',
        type: 'string',
        paramLabel: _('BBCode text'),
      },
      {
        functionName: 'Color',
        description: _('base color'),
        iconPath: 'res/actions/color24',
        type: 'color',
        paramLabel: _('Color (Hex)'),
      },
      {
        functionName: 'Opacity',
        description: _('base opacity'),
        iconPath: 'res/actions/opacity24',
        type: 'number',
        paramLabel: _('Opacity (0-255)'),
      },
      {
        functionName: 'FontSize',
        description: _('base font size'),
        iconPath: 'res/actions/characterSize24',
        type: 'number',
        paramLabel: _('Font size'),
      },
      {
        functionName: 'FontFamily',
        description: _('base font family'),
        iconPath: 'res/actions/font24',
        type: 'string',
        paramLabel: _('Font family'),
      },
      {
        functionName: 'Alignment',
        description: _('text alignment'),
        iconPath: 'res/actions/textAlign24',
        type: 'stringWithSelector',
        paramLabel: _('Alignment'),
        options: `["left", "right", "center"]`,
      },
      {
        functionName: 'WordWrap',
        description: _('word wrap'),
        iconPath: 'res/actions/scaleWidth24',
        type: 'boolean',
        paramLabel: _('Word wrap'),
      },
      {
        functionName: 'WrappingWidth',
        description: _('wrapping width'),
        iconPath: 'res/actions/scaleWidth24',
        type: 'number',
        paramLabel: _('Wrapping width'),
      },
    ];

    addSettersAndGettersToObjectHelper(
      object,
      setterAndGetterProperties,
      'BBText'
    );

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
        helpPagePath: '/objects/bbtext_object',
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
          tagStyle: 'bbcode',
          wordWrap: true,
          wordWrapWidth: 250,
          align: 'left',
        },
      };

      this._pixiObject = new MultiStyleText('', BBTextStyles);

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
      const rawText = this._associatedObject
        .getProperties(this.project)
        .get('text')
        .getValue();
      if (rawText !== this._pixiObject.text) {
        this._pixiObject.setText(rawText);
      }

      const opacity = this._associatedObject
        .getProperties(this.project)
        .get('opacity')
        .getValue();
      this._pixiObject.alpha = opacity / 255;

      const color = this._associatedObject
        .getProperties(this.project)
        .get('color')
        .getValue();
      this._pixiObject.textStyles.default.fill = color;

      const fontSize = this._associatedObject
        .getProperties(this.project)
        .get('fontSize')
        .getValue();
      this._pixiObject.textStyles.default.fontSize = `${fontSize}px`;

      const fontFamily = this._associatedObject
        .getProperties(this.project)
        .get('fontFamily')
        .getValue();
      this._pixiObject.textStyles.default.fontFamily = fontFamily;

      const wordWrap = this._associatedObject
        .getProperties(this.project)
        .get('wordWrap')
        .getValue();
      if (wordWrap !== this._pixiObject._style.wordWrap) {
        this._pixiObject._style.wordWrap = wordWrap === 'true';
        this._pixiObject.dirty = true;
      }

      const align = this._associatedObject
        .getProperties(this.project)
        .get('align')
        .getValue();
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
