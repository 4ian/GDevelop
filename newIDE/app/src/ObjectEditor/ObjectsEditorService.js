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
import Cube3DEditor from './Editors/Cube3DEditor';
import Model3DEditor from './Editors/Model3DEditor';
import SpineEditor from './Editors/SpineEditor';

const gd: libGDevelop = global.gd;

/**
 * A service returning editor components for each object type.
 */
const ObjectsEditorService = {
  getEditorConfiguration(project: gdProject, objectType: string) {
    if (this.editorConfigurations[objectType]) {
      return this.editorConfigurations[objectType];
    }
    if (project.hasEventsBasedObject(objectType)) {
      const objectMetadata = gd.MetadataProvider.getObjectMetadata(
        gd.JsPlatform.get(),
        objectType
      );
      return this.getCustomObjectPropertiesEditor({
        helpPagePath: objectMetadata.getHelpPath(),
      });
    }
    console.warn(
      `Object with type ${objectType} has no editor configuration registered. Please use registerEditorConfiguration to register your editor.`
    );
    return this.getDefaultObjectJsImplementationPropertiesEditor({
      helpPagePath: '',
    });
  },
  registerEditorConfiguration: function(
    objectType: string,
    editorConfiguration: any
  ) {
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
  getDefaultObjectJsImplementationPropertiesEditor(options: {
    helpPagePath: string,
  }) {
    return {
      component: ObjectPropertiesEditor,
      createNewObject: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectConfiguration =>
        gd
          .asObjectJsImplementation(objectConfiguration)
          .clone()
          .release(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectJsImplementation =>
        gd.asObjectJsImplementation(objectConfiguration),
      helpPagePath: options.helpPagePath,
    };
  },
  getCustomObjectPropertiesEditor(options: { helpPagePath: string }) {
    return {
      component: CustomObjectPropertiesEditor,
      createNewObject: (
        objectConfiguration: gdObjectConfiguration
      ): gdCustomObjectConfiguration =>
        gd.asCustomObjectConfiguration(
          gd
            .asCustomObjectConfiguration(objectConfiguration)
            .clone()
            .release()
        ),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdCustomObjectConfiguration =>
        gd.asCustomObjectConfiguration(objectConfiguration),
      helpPagePath: options.helpPagePath,
    };
  },
  editorConfigurations: {
    Sprite: {
      component: SpriteEditor,
      createNewObject: (): gdSpriteObject => new gd.SpriteObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdSpriteObject => gd.asSpriteConfiguration(objectConfiguration),
      helpPagePath: '/objects/sprite',
    },
    'Scene3D::Cube3DObject': {
      component: Cube3DEditor,
      createNewObject: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectConfiguration =>
        gd
          .asObjectJsImplementation(objectConfiguration)
          .clone()
          .release(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectJsImplementation =>
        gd.asObjectJsImplementation(objectConfiguration),
      helpPagePath: '/objects/3d-box',
    },
    'Scene3D::Model3DObject': {
      component: Model3DEditor,
      createNewObject: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectConfiguration =>
        gd
          .asObjectJsImplementation(objectConfiguration)
          .clone()
          .release(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectJsImplementation =>
        gd.asObjectJsImplementation(objectConfiguration),
      helpPagePath: '/objects/3d-model',
    },
    'SpineObject::SpineObject': {
      component: SpineEditor,
      createNewObject: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectConfiguration =>
        gd
          .asObjectJsImplementation(objectConfiguration)
          .clone()
          .release(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdObjectJsImplementation =>
        gd.asObjectJsImplementation(objectConfiguration),
      helpPagePath: '/objects/spine',
    },
    'TiledSpriteObject::TiledSprite': {
      component: TiledSpriteEditor,
      createNewObject: (): gdTiledSpriteObject => new gd.TiledSpriteObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdTiledSpriteObject =>
        gd.asTiledSpriteConfiguration(objectConfiguration),
      helpPagePath: '/objects/tiled_sprite',
    },
    'PanelSpriteObject::PanelSprite': {
      component: PanelSpriteEditor,
      createNewObject: (): gdPanelSpriteObject => new gd.PanelSpriteObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdPanelSpriteObject =>
        gd.asPanelSpriteConfiguration(objectConfiguration),
      helpPagePath: '/objects/panel_sprite',
    },
    'TextObject::Text': {
      component: TextEditor,
      createNewObject: (): gdTextObject => new gd.TextObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdTextObject => gd.asTextObjectConfiguration(objectConfiguration),
      helpPagePath: '/objects/text',
    },
    'PrimitiveDrawing::Drawer': {
      component: ShapePainterEditor,
      createNewObject: (): gdShapePainterObject => new gd.ShapePainterObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdShapePainterObject =>
        gd.asShapePainterConfiguration(objectConfiguration),
      helpPagePath: '/objects/shape_painter',
    },
    'TextEntryObject::TextEntry': {
      component: EmptyEditor,
      createNewObject: (): gdTextEntryObject => new gd.TextEntryObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdTextEntryObject => gd.asTextEntryConfiguration(objectConfiguration),
      helpPagePath: '/objects/text_entry',
    },
    'ParticleSystem::ParticleEmitter': {
      component: ParticleEmitterEditor,
      createNewObject: (): gdParticleEmitterObject =>
        new gd.ParticleEmitterObject(),
      castToObjectType: (
        objectConfiguration: gdObjectConfiguration
      ): gdParticleEmitterObject =>
        gd.asParticleEmitterConfiguration(objectConfiguration),
      helpPagePath: '/objects/particles_emitter',
    },
  },
};

export default ObjectsEditorService;
