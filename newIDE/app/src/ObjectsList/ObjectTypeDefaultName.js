// @flow

const objectTypeToDefaultName = {
  Sprite: 'NewSprite',
  'TiledSpriteObject::TiledSprite': 'NewTiledSprite',
  'ParticleSystem::ParticleEmitter': 'NewParticlesEmitter',
  'PanelSpriteObject::PanelSprite': 'NewPanelSprite',
  'PrimitiveDrawing::Drawer': 'NewShapePainter',
  'TextObject::Text': 'NewText',
  'BBText::BBText': 'NewBBText',
  'BitmapText::BitmapTextObject': 'NewBitmapText',
  'TextEntryObject::TextEntry': 'NewTextEntry',
  'TileMap::SimpleTileMap': 'NewTileMap',
  'TileMap::TileMap': 'NewExternalTileMap',
  'TileMap::CollisionMask': 'NewExternalTileMapMask',
  'MyDummyExtension::DummyObject': 'NewDummyObject',
  'Lighting::LightObject': 'NewLight',
  'TextInput::TextInputObject': 'NewTextInput',
  'Scene3D::Model3DObject': 'New3DModel',
  'Scene3D::Cube3DObject': 'New3DBox',
  'SpineObject::SpineObject': 'NewSpine',
  'Video::VideoObject': 'NewVideo',
};

export const getDefaultObjectNameForType = (objectType: string): string =>
  // $FlowFixMe[invalid-computed-prop]
  objectTypeToDefaultName[objectType] || 'NewObject';
