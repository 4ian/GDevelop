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
        'SpineObject',
        _('Spine'),
        _('Displays a Spine animation.'),
        'Vladyslav Pohorielov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/spine')
      .setCategory('General');

    extension
      .addInstructionOrExpressionGroupMetadata(_('Spine'))
      .setIcon('CppPlatform/Extensions/spriteicon.png');

    const object = extension
      .addObject(
        'SpineObject',
        _('Spine'),
        _(
          'Display and animate Spine skeleton. Select Spine files (json, atlas, image).'
        ),
        'CppPlatform/Extensions/spriteicon.png',
        new gd.SpineObjectConfiguration()
      )
      .setIncludeFile('Extensions/Spine/spineruntimeobject.js')
      .addIncludeFile('Extensions/Spine/spineruntimeobject-pixi-renderer.js')
      .setCategoryFullName(_('General'));

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
      .addParameter('object', _('Spine'), 'SpineObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Opacity (0-255)')
        )
      )
      .setFunctionName('setOpacity')
      .setGetter('getOpacity');

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
      .addParameter('object', _('Spine'), 'SpineObject', false)
      .useStandardParameters(
        'number',
        gd.ParameterOptions.makeNewOptions().setDescription(
          _('Scale (1 by default)')
        )
      )
      .setFunctionName('setScale')
      .setGetter('getScale');

    object
      .addCondition(
        'isAnimationComplete',
        _('Animation complete'),
        _(
          'Check if the animation being played by the Spine object is complete.'
        ),
        _('The animation of _PARAM0_ is complete'),
        _('Animations and images'),
        'res/conditions/animation24.png',
        'res/conditions/animation.png'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .markAsSimple()
      .setFunctionName('isAnimationComplete');

    object
      .addExpressionAndConditionAndAction(
        'boolean',
        'Updatable',
        _('Updatable'),
        _('an animation is updatable'),
        _('Updatable'),
        '',
        'res/conditions/animation.png'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters('boolean', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setIsUpdatable')
      .setGetter('isUpdatable');

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Animation',
        _('Animation (by number)'),
        _(
          'the number of the animation played by the object (the number from the animations list)'
        ),
        _('the number of the animation'),
        _('Animations and images'),
        'res/actions/animation24.png'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .markAsSimple()
      .setFunctionName('setAnimationIndex')
      .setGetter('getCurrentAnimationIndex');

    object
      .addExpressionAndConditionAndAction(
        'string',
        'AnimationName',
        _('Animation (by name)'),
        _('the animation played by the object'),
        _('the animation'),
        _('Animations and images'),
        'res/actions/animation24.png'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters(
        'objectAnimationName',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Animation name'))
      )
      .markAsAdvanced()
      .setFunctionName('setAnimationName')
      .setGetter('getAnimationName');

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
      'SpineObject::SpineObject',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/spine',
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
    const { PIXI, RenderedInstance, gd } = objectsRenderingService;

    class RenderedSpineInstance extends RenderedInstance {
      _spine;
      _rect = new PIXI.Graphics();
      _initialWidth;
      _initialHeight;
      _animationIndex;

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

        // there is issue with spine selection. mouse events are not triggering during interaction.
        // create the invisible background rectangle to fill spine range.
        this._rect.alpha = 0;
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this._rect);
        this._pixiContainer.addChild(this._pixiObject);

        this.loadSpine();
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'CppPlatform/Extensions/spriteicon.png';
      }

      loadSpine() {
        const jsonResourceName = this.properties
          .get('jsonResourceName')
          .getValue();
        const imageResourceName = this.properties
          .get('imageResourceName')
          .getValue();
        const atlasResourceName = this.properties
          .get('atlasResourceName')
          .getValue();

        this._pixiResourcesLoader
          .getSpineData(
            this._project,
            jsonResourceName,
            imageResourceName,
            atlasResourceName
          )
          .then((spineData) => {
            if (!spineData) return;

            this._spine = new PIXI.Spine(spineData);
            this._pixiObject.addChild(this._spine);
            this.update();
          });
      }

      update() {
        this._pixiObject.position.set(
          this._instance.getX(),
          this._instance.getY()
        );

        this.setAnimation(this._instance.getRawDoubleProperty('animation'));

        const width = this.getWidth();
        const height = this.getHeight();

        this._rect.clear();
        this._rect.beginFill(0xffffff);
        this._rect.lineStyle(0, 0xffffff);
        this._rect.drawRect(0, 0, width, height);

        const s = this._spine;
        if (s) {
          s.width = width;
          s.height = height;
          s.alpha = this.properties.get('opacity').getValue() / 255;
          const localBounds = s.getLocalBounds(undefined, true);
          s.position.set(
            -localBounds.x * s.scale.x,
            -localBounds.y * s.scale.y
          );
        }

        this._pixiObject.calculateBounds();
      }

      /**
       * @param {number} index - animation index
       */
      setAnimation(index) {
        const { configuration, _spine: s } = this;

        if (
          !s ||
          configuration.hasNoAnimations() ||
          index === this._animationIndex
        ) {
          return;
        }

        if (!Number.isInteger(index) || index < 0) {
          index = 0;
        } else if (configuration.getAnimationsCount() <= index) {
          index = configuration.getAnimationsCount() - 1;
        }

        this._animationIndex = index;
        const animation = configuration.getAnimation(index);
        const source = animation.getSource();
        const shouldLoop = animation.shouldLoop();

        // reset scale to track new animation range
        // if custom size is set it will be reinitialized in update method
        s.scale.set(1, 1);
        s.state.setAnimation(0, source, shouldLoop);
        s.state.tracks[0].trackTime = 0;
        s.update(0);
        s.autoUpdate = false;
        this._initialWidth = s.width;
        this._initialHeight = s.height;
      }

      /**
       * @returns {number} default width
       */
      getDefaultWidth() {
        const scale = Number(this.properties.get('scale').getValue()) || 1;

        return typeof this._initialWidth === 'number'
          ? this._initialWidth * scale
          : 256;
      }

      /**
       * @returns {number} default height
       */
      getDefaultHeight() {
        const scale = Number(this.properties.get('scale').getValue()) || 1;

        return typeof this._initialHeight === 'number'
          ? this._initialHeight * scale
          : 256;
      }

      get configuration() {
        return gd.asSpineConfiguration(this._associatedObjectConfiguration);
      }

      get properties() {
        return this._associatedObjectConfiguration.getProperties();
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'SpineObject::SpineObject',
      RenderedSpineInstance
    );
  },
};
