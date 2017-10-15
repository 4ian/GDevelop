import RenderedUnknownInstance from './Renderers/RenderedUnknownInstance';
import RenderedSpriteInstance from './Renderers/RenderedSpriteInstance';
import RenderedTiledSpriteInstance from './Renderers/RenderedTiledSpriteInstance';
import RenderedPanelSpriteInstance from './Renderers/RenderedPanelSpriteInstance';
import RenderedAdMobInstance from './Renderers/RenderedAdMobInstance';
import RenderedTextInstance from './Renderers/RenderedTextInstance';
import RenderedShapePainterInstance from './Renderers/RenderedShapePainterInstance';
import RenderedTextEntryInstance from './Renderers/RenderedTextEntryInstance';
import PixiResourcesLoader from './PixiResourcesLoader';
import ResourcesLoader from './ResourcesLoader';

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
    'AdMobObject::AdMob': RenderedAdMobInstance,
    'TextObject::Text': RenderedTextInstance,
    'PrimitiveDrawing::Drawer': RenderedShapePainterInstance,
    'TextEntryObject::TextEntry': RenderedTextEntryInstance,
  },
  getThumbnail: function(project, object) {
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
    project,
    layout,
    instance,
    associatedObject,
    pixiContainer
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
    else
      return new this.renderers['unknownObjectType'](
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        PixiResourcesLoader
      );
  },
  registerInstanceRenderer: function(objectType, renderFunction) {
    if (!this.renderers.hasOwnProperty(objectType)) {
      console.warn(
        'Tried to register renderer for object "' +
          objectType +
          '", but a renderer already exists.'
      );
      return;
    }

    this.renderers[objectType] = renderFunction;
  },
};
