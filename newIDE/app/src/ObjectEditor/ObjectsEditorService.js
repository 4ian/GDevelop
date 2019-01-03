import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';
import PanelSpriteEditor from './Editors/PanelSpriteEditor';
import SpriteEditor from './Editors/SpriteEditor';
import EmptyEditor from './Editors/EmptyEditor';
import ShapePainterEditor from './Editors/ShapePainterEditor';
import ParticleEmitterEditor from './Editors/ParticleEmitterEditor';
const gd = global.gd;

/**
 * A service returning editor components for each object type.
 */
export default {
  getEditorConfiguration(objectType: string) {
    if (!this.editorConfigurations[objectType]) {
      console.warn(
        `Object with type ${objectType} has no editor configuration registered. Please use registerEditorConfiguration to register your editor.`
      );
    }

    return this.editorConfigurations[objectType];
  },
  registerEditorConfiguration: function(objectType, editorConfiguration) {
    if (!editorConfiguration.component) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "component" property is not defined.`
      );
      return;
    }
    if (!editorConfiguration.newObjectCreator) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "newObjectCreator" property is not defined.`
      );
      return;
    }
    if (!editorConfiguration.castToObjectType) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "castToObjectType" property is not defined.`
      );
      return;
    }

    if (!this.editorConfigurations.hasOwnProperty(objectType)) {
      console.warn(
        `Tried to register renderer for object "${objectType}", but an editor configuration already exists.`
      );
      return;
    }

    this.editorConfigurations[objectType] = editorConfiguration;
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
      helpPagePath: '/objects/panel_sprite',
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
    'ParticleSystem::ParticleEmitter': {
      component: ParticleEmitterEditor,
      newObjectCreator: () => new gd.ParticleEmitterObject(''),
      castToObjectType: object => gd.asParticleEmitterObject(object),
      helpPagePath: '/objects/particles_emitter',
    },
  },
};
