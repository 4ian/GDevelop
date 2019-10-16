// @flow
import RenderedUnknownInstance from './Renderers/RenderedUnknownInstance';
import RenderedSpriteInstance from './Renderers/RenderedSpriteInstance';
import RenderedTiledSpriteInstance from './Renderers/RenderedTiledSpriteInstance';
import RenderedPanelSpriteInstance from './Renderers/RenderedPanelSpriteInstance';
import RenderedTextInstance from './Renderers/RenderedTextInstance';
import RenderedShapePainterInstance from './Renderers/RenderedShapePainterInstance';
import RenderedTextEntryInstance from './Renderers/RenderedTextEntryInstance';
import RenderedParticleEmitterInstance from './Renderers/RenderedParticleEmitterInstance';
import RenderedSkeletonInstance from './Renderers/RenderedSkeletonInstance';
import PixiResourcesLoader from './PixiResourcesLoader';
import ResourcesLoader from '../ResourcesLoader';
import RenderedInstance from './Renderers/RenderedInstance';
import * as PIXI from 'pixi.js';
const gd = global.gd;

/**
 * A service containing functions that are called to render instances
 * of objects in a PIXI.Container.
 */
export default {
  renderers: {
    unknownObjectType: RenderedUnknownInstance,
    Sprite: RenderedSpriteInstance,
    'TiledSpriteObject::TiledSprite': RenderedTiledSpriteInstance,
    'PanelSpriteObject::PanelSprite': RenderedPanelSpriteInstance,
    'TextObject::Text': RenderedTextInstance,
    'PrimitiveDrawing::Drawer': RenderedShapePainterInstance,
    'TextEntryObject::TextEntry': RenderedTextEntryInstance,
    'ParticleSystem::ParticleEmitter': RenderedParticleEmitterInstance,
    'SkeletonObject::Skeleton': RenderedSkeletonInstance,
  },
  getThumbnail: function(project: gdProject, object: gdObject) {
    var objectType = object.getType();
    if (this.renderers.hasOwnProperty(objectType))
      return this.renderers[objectType].getThumbnail(
        project,
        ResourcesLoader,
        object
      );
    else
      return this.renderers['unknownObjectType'].getThumbnail(
        project,
        ResourcesLoader,
        object
      );
  },
  createNewInstanceRenderer: function(
    project: gdProject,
    layout: gdLayout,
    instance: gdInitialInstance,
    associatedObject: gdObject,
    pixiContainer: any
  ) {
    var objectType = associatedObject.getType();
    if (this.renderers.hasOwnProperty(objectType))
      return new this.renderers[objectType](
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        PixiResourcesLoader
      );
    else {
      console.warn(
        `Object with type ${objectType} has no instance renderer registered. Please use registerInstanceRenderer to register your renderer.`
      );
      return new this.renderers['unknownObjectType'](
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        PixiResourcesLoader
      );
    }
  },
  registerInstanceRenderer: function(objectType: string, renderer: any) {
    if (!renderer.getThumbnail) {
      console.warn(
        `Tried to register renderer for object "${objectType}", but getThumbnail is not defined.`
      );
      return;
    }

    if (this.renderers.hasOwnProperty(objectType)) {
      console.warn(
        `Tried to register renderer for object "${objectType}", but a renderer already exists.`
      );
      return;
    }

    console.info(`Properly registered renderer for object "${objectType}".`);
    this.renderers[objectType] = renderer;
  },
  gd, // Expose gd so that it can be used by renderers
  PIXI, // Expose PIXI so that it can be used by renderers
  RenderedInstance, // Expose the base class for renderers so that it can be used by renderers
};
