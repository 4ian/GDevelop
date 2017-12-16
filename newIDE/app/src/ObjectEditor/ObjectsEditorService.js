import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';
import PanelSpriteEditor from './Editors/PanelSpriteEditor';
import SpriteEditor from './Editors/SpriteEditor';
import EmptyEditor from './Editors/EmptyEditor';
import ShapePainterEditor from './Editors/ShapePainterEditor';
import AdMobEditor from './Editors/AdMobEditor';
const gd = global.gd;

/**
 * A service returning editor components for each object type.
 */
export default {
  getEditorConfiguration(type: string) {
    return this.editorConfigurations[type];
  },
  editorConfigurations: {
    Sprite: {
      component: SpriteEditor,
      newObjectCreator: () => new gd.SpriteObject(''),
      castToObjectType: object => gd.asSpriteObject(object),
      helpPagePath: '/objects/sprite',
    },
    'TiledSpriteObject::TiledSprite': {
      component: TiledSpriteEditor,
      newObjectCreator: () => new gd.TiledSpriteObject(''),
      castToObjectType: object => gd.asTiledSpriteObject(object),
      helpPagePath: '/objects/tiled_sprite',
    },
    'PanelSpriteObject::PanelSprite': {
      component: PanelSpriteEditor,
      newObjectCreator: () => new gd.PanelSpriteObject(''),
      castToObjectType: object => gd.asPanelSpriteObject(object),
    },
    'AdMobObject::AdMob': {
      component: AdMobEditor,
      newObjectCreator: () => new gd.AdMobObject(''),
      castToObjectType: object => gd.asAdMobObject(object),
    },
    'TextObject::Text': {
      component: TextEditor,
      newObjectCreator: () => new gd.TextObject(''),
      castToObjectType: object => gd.asTextObject(object),
      helpPagePath: '/objects/text',
    },
    'PrimitiveDrawing::Drawer': {
      component: ShapePainterEditor,
      newObjectCreator: () => new gd.ShapePainterObject(''),
      castToObjectType: object => gd.asShapePainterObject(object),
      helpPagePath: '/objects/shape_painter',
    },
    'TextEntryObject::TextEntry': {
      component: EmptyEditor,
      newObjectCreator: () => new gd.TextEntryObject(''),
      castToObjectType: object => gd.asTextEntryObject(object),
      helpPagePath: '/objects/text_entry',
    },
  },
};
