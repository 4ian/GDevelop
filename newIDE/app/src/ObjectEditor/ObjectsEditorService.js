import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';
import PanelSpriteEditor from './Editors/PanelSpriteEditor';
import SpriteEditor from './Editors/SpriteEditor';

/**
 * A service returning editor components for each object type.
 */
export default {
  getEditor(type: string) {
    return this.editors[type];
  },
  editors: {
    Sprite: SpriteEditor,
    'TiledSpriteObject::TiledSprite': TiledSpriteEditor,
    'PanelSpriteObject::PanelSprite': PanelSpriteEditor,
    'AdMobObject::AdMob': undefined,
    'TextObject::Text': TextEditor,
    'PrimitiveDrawing::Drawer': undefined,
    'TextEntryObject::TextEntry': undefined,
  },
};
