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
        'BBCode Text Object',
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
      if (propertyName === 'fontFamily') {
        objectContent.fontFamily = newValue;
        return true;
      }
      if (propertyName === 'visible') {
        objectContent.visible = newValue === '1';
        return true;
      }
      if (propertyName === 'fontSize') {
        objectContent.fontSize = String(newValue);
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

    // Single array approach to add all Setters/Getters, so we don't have to deal with SO much boilerplate repetition
    // Could be useful for other extensions... Thinking of making an online tool to generate this file from json data some day
    // 0 function name, 1 description, 2 icon name, 3 param property type, 4 hasModifier
    [
      [
        'BBText',
        'BBCode formatted text',
        'textAlign24',
        'string',
        'BBCode text',
      ],
      ['Color', 'base color', 'color24', 'color', 'Color (Hex)'],
      ['Opacity', 'base opacity', 'opacity24', 'number', 'Opacity (0-255)'],
      ['FontSize', 'base font size', 'characterSize24', 'number', 'Font size'],
      ['FontFamily', 'base font family', 'font24', 'string', 'Font family'],
      [
        'Alignment',
        'text alignment',
        'textAlign24',
        'stringWithSelector',
        'Alignment',
        `["left", "right", "center"]`,
      ],
      [
        'WrappingWidth',
        'wrapping width',
        'scaleWidth24',
        'number',
        'Wrapping width',
      ],
    ].forEach(p => {
      // Add all the generic GETTERS
      if (p[3] === 'number') {
        object
          .addExpression(
            `Get${p[0]}`,
            _(`Get ${p[1]}`),
            _(`Get ${p[1]}`),
            _(''),
            '',
            `res/actions/${p[2]}.png`,
            `res/actions/${p[2]}.png`
          )
          .addParameter('object', _('BBText object'), 'BBText', false)
          .getCodeExtraInformation()
          .setFunctionName(`get${p[0]}`);
      } else {
        object
          .addStrExpression(
            `Get${p[0]}`,
            _(`Get ${p[1]}`),
            _(`Get ${p[1]}`),
            _(''),
            '',
            `res/actions/${p[2]}.png`,
            `res/actions/${p[2]}.png`
          )
          .addParameter('object', _('BBText object'), 'BBText', false)
          .getCodeExtraInformation()
          .setFunctionName(`get${p[0]}`);
      }

      // Add all the generic SETTERS
      if (p[3] === 'number' || p[3] === 'string') {
        object
          .addAction(
            `Set${p[0]}`,
            _(`Set ${p[1]}`),
            _(`Set ${p[1]}`),
            _(`Set ${p[1]} of _PARAM0_ to _PARAM1_ _PARAM2_`),
            '',
            `res/actions/${p[2]}.png`,
            `res/actions/${p[2]}.png`
          )
          .addParameter('object', _('BBText object'), 'BBText', false)
          .addParameter('operator', _("Modification's sign"), '', false)
          .addParameter(
            p[3] === 'number' ? 'expression' : 'string',
            _(p[4]),
            '',
            false
          )
          .getCodeExtraInformation()
          .setFunctionName(`set${p[0]}`)
          .setManipulatedType(p[3])
          .setGetter(`get${p[0]}`);
      } else {
        // Setter doesnt have a modifier (Color, alignment, etc)
        object
          .addAction(
            `Set${p[0]}`,
            _(`Set ${p[1]}`),
            _(`Set ${p[1]}`),
            _(`Set ${p[1]} of _PARAM0_ to _PARAM1_`),
            '',
            `res/actions/${p[2]}.png`,
            `res/actions/${p[2]}.png`
          )
          .addParameter('object', _('BBText object'), 'BBText', false)
          .addParameter(p[3], _(p[4]), p.length === 6 ? p[5] : '', false)
          .getCodeExtraInformation()
          .setFunctionName(`set${p[0]}`)
          .setGetter(`get${p[0]}`);
      }
    });

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
          tagStyle: ['[', ']'],
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
