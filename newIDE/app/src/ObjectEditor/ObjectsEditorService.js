import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';

/**
 * A service returning editor components for each object type.
 */
export default {
  getEditor(type: string) {
    return this.editors[type];
  },
  editors: {
    unknownObjectType: undefined,
    Sprite: undefined,
    'TiledSpriteObject::TiledSprite': TiledSpriteEditor,
    'PanelSpriteObject::PanelSprite': undefined,
    'AdMobObject::AdMob': undefined,
    'TextObject::Text': TextEditor,
    'PrimitiveDrawing::Drawer': undefined,
    'TextEntryObject::TextEntry': undefined,
  },
};
