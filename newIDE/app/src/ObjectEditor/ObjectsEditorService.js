import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';
import PanelSpriteEditor from './Editors/PanelSpriteEditor';
import SpriteEditor from './Editors/SpriteEditor';
import EmptyEditor from './Editors/EmptyEditor';
import ShapePainterEditor from './Editors/ShapePainterEditor';
import AdMobEditor from './Editors/AdMobEditor';

/**
 * A service returning editor components for each object type.
 */
export default {
  getEditor(type: string) {
    return this.editors[type];
  },
  editors: {
    Sprite: { component: SpriteEditor },
    'TiledSpriteObject::TiledSprite': { component: TiledSpriteEditor },
    'PanelSpriteObject::PanelSprite': { component: PanelSpriteEditor },
    'AdMobObject::AdMob': {component: AdMobEditor},
    'TextObject::Text': {
      component: TextEditor,
    },
    'PrimitiveDrawing::Drawer': {component: ShapePainterEditor},
    'TextEntryObject::TextEntry': {component: EmptyEditor},
  },
};
