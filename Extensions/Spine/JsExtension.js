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
        _('Spine (experimental)'),
        _('Displays a Spine animation.'),
        'Vladyslav Pohorielov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/spine')
      .setCategory('Advanced');

    extension
      .addInstructionOrExpressionGroupMetadata(_('Spine'))
      .setIcon('JsPlatform/Extensions/spine.svg');

    const object = extension
      .addObject(
        'SpineObject',
        _('Spine (experimental)'),
        _(
          'Display and animate Spine skeleton. Select Spine files (json, atlas, image).'
        ),
        'JsPlatform/Extensions/spine.svg',
        new gd.SpineObjectConfiguration()
      )
      .setIncludeFile('Extensions/Spine/spineruntimeobject.js')
      .addIncludeFile('Extensions/Spine/spineruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/Spine/pixi-spine/pixi-spine.js')
      .addIncludeFile('Extensions/Spine/managers/pixi-spine-atlas-manager.js')
      .addIncludeFile('Extensions/Spine/managers/pixi-spine-manager.js')
      .setCategoryFullName(_('Advanced'));

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
        'JsPlatform/Extensions/spine.svg',
        'JsPlatform/Extensions/spine.svg'
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
        'JsPlatform/Extensions/spine.svg'
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
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .addParameter('number', _('Mixing duration'), '', false)
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
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters(
        'objectAnimationName',
        gd.ParameterOptions.makeNewOptions().setDescription(_('Animation name'))
      )
      .addParameter('number', _('Mixing duration'), '', false)
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
  ) {},
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
      _spine = null;
      _rect = new PIXI.Graphics();
      _initialWidth = null;
      _initialHeight = null;
      _animationIndex = -1;
      _spineOriginOffsetX = 0;
      _spineOriginOffsetY = 0;

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

        this._loadSpine();
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/spine.svg';
      }

      update() {
        this._pixiObject.position.set(
          this._instance.getX(),
          this._instance.getY()
        );

        this.setAnimation(this._instance.getRawDoubleProperty('animation'));

        const width = this.getWidth();
        const height = this.getHeight();
        const { _spine: spine } = this;

        if (spine) {
          spine.width = width;
          spine.height = height;
          spine.alpha = this._getProperties().get('opacity').getValue() / 255;
          const localBounds = spine.getLocalBounds(undefined, true);

          this._spineOriginOffsetX = localBounds.x * spine.scale.x;
          this._spineOriginOffsetY = localBounds.y * spine.scale.y;
          this._rect.position.set(
            this._spineOriginOffsetX,
            this._spineOriginOffsetY
          );
        }

        this._rect.clear();
        this._rect.beginFill(0xffffff);
        this._rect.lineStyle(1, 0xff0000);
        this._rect.drawRect(0, 0, width, height);
      }

      /**
       * @returns x coordinate of this spine origin offset
       */
      getOriginX() {
        return -this._spineOriginOffsetX;
      }

      /**
       * @returns y coordinate of this spine origin offset
       */
      getOriginY() {
        return -this._spineOriginOffsetY;
      }

      /**
       * @param {number} index - animation index
       */
      setAnimation(index) {
        const { _spine: spine } = this;
        const configuration = this._getConfiguration();

        if (
          !spine ||
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
        const scale = this.getScale();

        // reset scale to track new animation range
        // if custom size is set it will be reinitialized in update method
        spine.scale.set(1, 1);
        spine.state.setAnimation(0, source, shouldLoop);
        spine.state.tracks[0].trackTime = 0;
        spine.update(0);
        spine.autoUpdate = false;
        this._initialWidth = spine.width * this.getScale();
        this._initialHeight = spine.height * this.getScale();
      }

      /**
       * @returns {number} default width
       */
      getDefaultWidth() {
        return this._initialWidth !== null ? this._initialWidth : 256;
      }

      /**
       * @returns {number} default height
       */
      getDefaultHeight() {
        return this._initialHeight !== null ? this._initialHeight : 256;
      }

      /**
       * @returns {number} defined scale
       */
      getScale() {
        return Number(this._getProperties().get('scale').getValue()) || 1;
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy({ children: true });
      }

      /**
       * @returns this spine object configuration
       */
      _getConfiguration() {
        return gd.asSpineConfiguration(this._associatedObjectConfiguration);
      }

      /**
       * @returns this object properties container
       */
      _getProperties() {
        return this._associatedObjectConfiguration.getProperties();
      }

      _loadSpine() {
        const properties = this._getProperties();
        const spineResourceName = properties
          .get('spineResourceName')
          .getValue();

        this._pixiResourcesLoader
          .getSpineData(this._project, spineResourceName)
          .then((spineDataOrLoadingError) => {
            if (!spineDataOrLoadingError.skeleton) {
              console.error(
                'Unable to load Spine (' +
                  (spineDataOrLoadingError.loadingErrorReason ||
                    'Unknown reason') +
                  ')',
                spineDataOrLoadingError.loadingError
              );
              this._spine = null;
              return;
            }

            try {
              this._spine = new PIXI.Spine(spineDataOrLoadingError.skeleton);
            } catch (error) {
              console.error('Exception while loading Spine.', error);
              this._spine = null;
              return;
            }
            this._pixiObject.addChild(this._spine);
            this.update();
          });
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'SpineObject::SpineObject',
      RenderedSpineInstance
    );
  },
};
