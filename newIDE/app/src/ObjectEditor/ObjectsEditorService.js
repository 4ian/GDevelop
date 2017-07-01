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
    Sprite: { component: SpriteEditor, containerProps: { noMargin: true } },
    'TiledSpriteObject::TiledSprite': { component: TiledSpriteEditor },
    'PanelSpriteObject::PanelSprite': { component: PanelSpriteEditor },
    'AdMobObject::AdMob': undefined,
    'TextObject::Text': {
      component: TextEditor,
      containerProps: { noMargin: true },
    },
    'PrimitiveDrawing::Drawer': undefined,
    'TextEntryObject::TextEntry': undefined,
  },
};
