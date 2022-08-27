// @flow
import TextEditor from './Editors/TextEditor';
import TiledSpriteEditor from './Editors/TiledSpriteEditor';
import PanelSpriteEditor from './Editors/PanelSpriteEditor';
import SpriteEditor from './Editors/SpriteEditor';
import EmptyEditor from './Editors/EmptyEditor';
import ShapePainterEditor from './Editors/ShapePainterEditor';
import ParticleEmitterEditor from './Editors/ParticleEmitterEditor';
import ObjectPropertiesEditor from './Editors/ObjectPropertiesEditor';
import CustomObjectPropertiesEditor from './Editors/CustomObjectPropertiesEditor';

const gd: libGDevelop = global.gd;

type ObjectsEditorServiceType = {|
  getEditorConfiguration: (project: gdProject, objectType: string) => any,
  registerEditorConfiguration: (
    objectType: string,
    editorConfiguration: any
  ) => void,
  getDefaultObjectJsImplementationPropertiesEditor: (options: {
    helpPagePath: string,
  }) => {|
    component: any,
    createNewObject: (object: gdObjectConfiguration) => gdObjectConfiguration,
    castToObjectType: (
      object: gdObjectConfiguration
    ) => gdObjectJsImplementation,
    helpPagePath: string,
  |},
  getCustomObjectPropertiesEditor: (options: {
    helpPagePath: string,
  }) => {|
    component: any,
    createNewObject: (
      object: gdObjectConfiguration
    ) => gdCustomObjectConfiguration,
    castToObjectType: (
      object: gdObjectConfiguration
    ) => gdCustomObjectConfiguration,
    helpPagePath: string,
  |},
  editorConfigurations: {
    Sprite: {|
      component: any,
      createNewObject: () => gdSpriteObject,
      castToObjectType: (object: gdObjectConfiguration) => gdSpriteObject,
      helpPagePath: string,
    |},
    'TiledSpriteObject::TiledSprite': {|
      component: any,
      createNewObject: () => gdTiledSpriteObject,
      castToObjectType: (object: gdObjectConfiguration) => gdTiledSpriteObject,
      helpPagePath: string,
    |},
    'PanelSpriteObject::PanelSprite': {|
      component: any,
      createNewObject: () => gdPanelSpriteObject,
      castToObjectType: (object: gdObjectConfiguration) => gdPanelSpriteObject,
      helpPagePath: string,
    |},
    'TextObject::Text': {|
      component: any,
      createNewObject: () => gdTextObject,
      castToObjectType: (object: gdObjectConfiguration) => gdTextObject,
      helpPagePath: string,
    |},
    'PrimitiveDrawing::Drawer': {|
      component: any,
      createNewObject: () => gdShapePainterObject,
      castToObjectType: (object: gdObjectConfiguration) => gdShapePainterObject,
      helpPagePath: string,
    |},
    'TextEntryObject::TextEntry': {|
      component: any,
      createNewObject: () => gdTextEntryObject,
      castToObjectType: (object: gdObjectConfiguration) => gdTextEntryObject,
      helpPagePath: string,
    |},
    'ParticleSystem::ParticleEmitter': {|
      component: any,
      createNewObject: () => gdParticleEmitterObject,
      castToObjectType: (
        object: gdObjectConfiguration
      ) => gdParticleEmitterObject,
      helpPagePath: string,
    |},
  },
|};

/**
 * A service returning editor components for each object type.
 */
const ObjectsEditorService: ObjectsEditorServiceType = {
  getEditorConfiguration(project: gdProject, objectType: string) {
    if (this.editorConfigurations[objectType]) {
      return this.editorConfigurations[objectType];
    }
    if (project.hasEventsBasedObject(objectType)) {
      return this.getCustomObjectPropertiesEditor({
        // TODO EBO Add the help page
        helpPagePath: '',
      });
    }
    console.warn(
      `Object with type ${objectType} has no editor configuration registered. Please use registerEditorConfiguration to register your editor.`
    );
    return this.getDefaultObjectJsImplementationPropertiesEditor({
      helpPagePath: '',
    });
  },
  registerEditorConfiguration: function(objectType, editorConfiguration) {
    if (!editorConfiguration.component) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "component" property is not defined.`
      );
      return;
    }
    if (!editorConfiguration.createNewObject) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "createNewObject" property is not defined.`
      );
      return;
    }
    if (!editorConfiguration.castToObjectType) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but "castToObjectType" property is not defined.`
      );
      return;
    }

    if (this.editorConfigurations.hasOwnProperty(objectType)) {
      console.warn(
        `Tried to register editor configuration for object "${objectType}", but an editor configuration already exists.`
      );
      return;
    }

    this.editorConfigurations[objectType] = editorConfiguration;
  },
  getDefaultObjectJsImplementationPropertiesEditor(options) {
    return {
      component: ObjectPropertiesEditor,
      createNewObject: object =>
        gd
          .asObjectJsImplementation(object)
          .clone()
          .release(),
      castToObjectType: object => gd.asObjectJsImplementation(object),
      helpPagePath: options.helpPagePath,
    };
  },
  getCustomObjectPropertiesEditor(options) {
    return {
      component: CustomObjectPropertiesEditor,
      createNewObject: object =>
        gd.asCustomObjectConfiguration(
          gd
            .asCustomObjectConfiguration(object)
            .clone()
            .release()
        ),
      castToObjectType: object => gd.asCustomObjectConfiguration(object),
      helpPagePath: options.helpPagePath,
    };
  },
  editorConfigurations: {
    Sprite: {
      component: SpriteEditor,
      createNewObject: () => new gd.SpriteObject(),
      castToObjectType: object => gd.asSpriteObject(object),
      helpPagePath: '/objects/sprite',
    },
    'TiledSpriteObject::TiledSprite': {
      component: TiledSpriteEditor,
      createNewObject: () => new gd.TiledSpriteObject(),
      castToObjectType: object => gd.asTiledSpriteObject(object),
      helpPagePath: '/objects/tiled_sprite',
    },
    'PanelSpriteObject::PanelSprite': {
      component: PanelSpriteEditor,
      createNewObject: () => new gd.PanelSpriteObject(),
      castToObjectType: object => gd.asPanelSpriteObject(object),
      helpPagePath: '/objects/panel_sprite',
    },
    'TextObject::Text': {
      component: TextEditor,
      createNewObject: () => new gd.TextObject(),
      castToObjectType: object => gd.asTextObject(object),
      helpPagePath: '/objects/text',
    },
    'PrimitiveDrawing::Drawer': {
      component: ShapePainterEditor,
      createNewObject: () => new gd.ShapePainterObject(),
      castToObjectType: object => gd.asShapePainterObject(object),
      helpPagePath: '/objects/shape_painter',
    },
    'TextEntryObject::TextEntry': {
      component: EmptyEditor,
      createNewObject: () => new gd.TextEntryObject(),
      castToObjectType: object => gd.asTextEntryObject(object),
      helpPagePath: '/objects/text_entry',
    },
    'ParticleSystem::ParticleEmitter': {
      component: ParticleEmitterEditor,
      createNewObject: () => new gd.ParticleEmitterObject(),
      castToObjectType: object => gd.asParticleEmitterObject(object),
      helpPagePath: '/objects/particles_emitter',
    },
  },
};

export default ObjectsEditorService;
