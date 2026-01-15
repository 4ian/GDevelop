// @ts-check
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
          'Display and smoothly animate a 2D object with skeletal animations made with Spine. Use files exported from Spine (json, atlas and image).'
        ),
        'JsPlatform/Extensions/spine.svg',
        new gd.SpineObjectConfiguration()
      )
      .addDefaultBehavior('EffectCapability::EffectBehavior')
      .addDefaultBehavior('ResizableCapability::ResizableBehavior')
      .addDefaultBehavior('ScalableCapability::ScalableBehavior')
      .addDefaultBehavior('FlippableCapability::FlippableBehavior')
      .addDefaultBehavior('OpacityCapability::OpacityBehavior')
      .addDefaultBehavior('AnimatableCapability::AnimatableBehavior')
      .setIncludeFile('Extensions/Spine/spineruntimeobject.js')
      .addIncludeFile('Extensions/Spine/spineruntimeobject-pixi-renderer.js')
      .addIncludeFile('Extensions/Spine/pixi-spine/pixi-spine.js')
      .addIncludeFile('Extensions/Spine/managers/pixi-spine-atlas-manager.js')
      .addIncludeFile('Extensions/Spine/managers/pixi-spine-manager.js')
      .setCategoryFullName(_('Advanced'))
      .setOpenFullEditorLabel(_('Edit animations'));

    object
      .addExpressionAndConditionAndAction(
        'number',
        'Animation',
        _('Animation mixing duration'),
        _(
          'the duration of the smooth transition between 2 animations (in second)'
        ),
        _('the animation mixing duration'),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('setAnimationMixingDuration')
      .setGetter('getAnimationMixingDuration');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentX',
        _('Point attachment X position'),
        _('x position of spine point attachment'),
        _('x position of spine _PARAM1_ point attachment for _PARAM2_ slot'),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentX');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentY',
        _('Point attachment Y position'),
        _('y position of spine point attachment'),
        _('y position of spine _PARAM1_ point attachment for _PARAM2_ slot'),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentY');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentScaleXWorld',
        _('Point attachment scale world X position'),
        _('world x position of spine point attachment scale'),
        _(
          'world x position of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentScaleXWorld');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentScaleXLocal',
        _('Point attachment scale local X position'),
        _('local x position of spine point attachment scale'),
        _(
          'local x position of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentScaleXLocal');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentScaleYWorld',
        _('Point attachment scale world Y position'),
        _('world y position of spine point attachment scale'),
        _(
          'world y position of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentScaleYWorld');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentScaleYLocal',
        _('Point attachment scale local Y position'),
        _('local y position of spine point attachment scale'),
        _(
          'local y position of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentScaleYLocal');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentRotationWorld',
        _('Point attachment world rotation'),
        _('world rotation of spine point attachment'),
        _(
          'world rotation of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentRotationWorld');

    object
      .addExpressionAndCondition(
        'number',
        'PointAttachmentRotationLocal',
        _('Point attachment local rotation'),
        _('local rotation of spine point attachment'),
        _(
          'local rotation of spine _PARAM1_ point attachment for _PARAM2_ slot'
        ),
        _('Animations and images'),
        'JsPlatform/Extensions/spine.svg'
      )
      .addParameter('object', _('Spine'), 'SpineObject')
      .addParameter('string', _('Attachment name'))
      .addParameter('string', _('Slot name (use "" if names are the same)'))
      .useStandardParameters('number', gd.ParameterOptions.makeNewOptions())
      .setFunctionName('getPointAttachmentRotationLocal');

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
  registerEditorConfigurations: function (objectsEditorService) {},
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function (objectsRenderingService) {
    const { PIXI, RenderedInstance, gd } = objectsRenderingService;

    class RenderedSpineInstance extends RenderedInstance {
      /** @type {pixi_spine.Spine | null} */
      _spine = null;
      /** @type {PIXI.Sprite} */
      _placeholder;
      _initialWidth = 256;
      _initialHeight = 256;
      _animationIndex = -1;
      _spineOriginOffsetX = 0;
      _spineOriginOffsetY = 0;

      constructor(
        project,
        instance,
        associatedObjectConfiguration,
        pixiContainer,
        pixiResourcesLoader
      ) {
        super(
          project,
          instance,
          associatedObjectConfiguration,
          pixiContainer,
          pixiResourcesLoader
        );

        // there is issue with spine selection. mouse events are not triggering during interaction.
        // create the invisible background rectangle to fill spine range.
        this._placeholder = new PIXI.Sprite(
          this._pixiResourcesLoader.getInvalidPIXITexture()
        );
        this._placeholder.alpha = 0;
        this._pixiObject = new PIXI.Container();
        this._pixiObject.addChild(this._placeholder);
        this._pixiContainer.addChild(this._pixiObject);

        this._loadSpine();
      }

      static getThumbnail(project, resourcesLoader, objectConfiguration) {
        return 'JsPlatform/Extensions/spine.svg';
      }

      update() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.SpineObjectConfiguration
        );

        const spineResourceName = object.getSpineResourceName();
        if (this._spineResourceName !== spineResourceName) {
          this._spineResourceName = spineResourceName;
          this._loadSpine();
        }

        this._pixiObject.position.set(
          this._instance.getX(),
          this._instance.getY()
        );
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );

        // Do not hide completely an object so it can still be manipulated
        const alphaForDisplay = Math.max(
          this._instance.getOpacity() / 255,
          0.5
        );
        this._pixiObject.alpha = alphaForDisplay;
        // Scale is already handled below, so we just apply the flip here.
        this._pixiObject.scale.x =
          Math.abs(this._pixiObject.scale.x) *
          (this._instance.isFlippedX() ? -1 : 1);
        this._pixiObject.scale.y =
          Math.abs(this._pixiObject.scale.y) *
          (this._instance.isFlippedY() ? -1 : 1);

        this.setAnimation(this._instance.getRawDoubleProperty('animation'));

        const scale = object.getScale() || 1;

        const spine = this._spine;
        if (spine) {
          const localBounds = spine.getLocalBounds(undefined, true);
          this._initialWidth = localBounds.width * scale;
          this._initialHeight = localBounds.height * scale;
        } else {
          this._initialWidth = 256;
          this._initialHeight = 256;
        }

        const width = this.getWidth();
        const height = this.getHeight();
        if (spine) {
          spine.width = width;
          spine.height = height;
          const localBounds = spine.getLocalBounds(undefined, true);

          this._spineOriginOffsetX = localBounds.x * spine.scale.x;
          this._spineOriginOffsetY = localBounds.y * spine.scale.y;
        } else {
          this._spineOriginOffsetX = -width / 2;
          this._spineOriginOffsetY = -height / 2;
        }
        this._placeholder.position.set(
          this._spineOriginOffsetX,
          this._spineOriginOffsetY
        );
        const frame = this._placeholder.texture.frame;
        this._placeholder.scale.x = width / frame.width;
        this._placeholder.scale.y = height / frame.height;
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

      getCenterX() {
        return this.getOriginX();
      }

      getCenterY() {
        return this.getOriginY();
      }

      /**
       * @param {number} index - animation index
       */
      setAnimation(index) {
        const { _spine: spine } = this;
        const configuration = gd.asSpineConfiguration(
          this._associatedObjectConfiguration
        );

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

        // reset scale to track new animation range
        // if custom size is set it will be reinitialized in update method
        spine.scale.set(1, 1);
        spine.state.setAnimation(0, source, shouldLoop);
        spine.state.tracks[0].trackTime = 0;
        spine.update(0);
        spine.autoUpdate = false;
      }

      /**
       * @returns {number} default width
       */
      getDefaultWidth() {
        return this._initialWidth;
      }

      /**
       * @returns {number} default height
       */
      getDefaultHeight() {
        return this._initialHeight;
      }

      onRemovedFromScene() {
        super.onRemovedFromScene();
        this._pixiObject.destroy({ children: true });
      }

      _loadSpine() {
        const object = gd.castObject(
          this._associatedObjectConfiguration,
          gd.SpineObjectConfiguration
        );
        this._pixiResourcesLoader
          .getSpineData(this._project, object.getSpineResourceName())
          .then((spineDataOrLoadingError) => {
            if (this._wasDestroyed) return;
            if (this._spine) this._pixiObject.removeChild(this._spine);

            if (!spineDataOrLoadingError.skeleton) {
              console.error(
                'Unable to load Spine (' +
                  (spineDataOrLoadingError.loadingErrorReason ||
                    'Unknown reason') +
                  ')',
                spineDataOrLoadingError.loadingError
              );
              this._spine = null;
              this._placeholder.alpha = 255;
              return;
            }

            try {
              this._spine = new PIXI.Spine(spineDataOrLoadingError.skeleton);
              this._pixiObject.addChild(this._spine);
              this._placeholder.alpha = 0;
            } catch (error) {
              console.error('Exception while loading Spine.', error);
              this._spine = null;
              this._placeholder.alpha = 255;
              return;
            }
          });
      }
    }

    objectsRenderingService.registerInstanceRenderer(
      'SpineObject::SpineObject',
      RenderedSpineInstance
    );
  },
};
