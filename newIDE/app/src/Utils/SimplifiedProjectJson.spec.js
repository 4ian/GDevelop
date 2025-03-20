// @flow
import { getSimplifiedProjectJson } from './SimplifiedProjectJson';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('SimplifiedProjectJson', () => {
  it('should create a simplified project JSON with global objects and scenes', () => {
    const { project } = makeTestProject(gd);
    const simplifiedJson = getSimplifiedProjectJson(project);

    expect(simplifiedJson).toMatchInlineSnapshot(`
        Object {
          "globalObjects": Array [
            Object {
              "behaviors": Array [],
              "objectName": "GlobalTiledSpriteObject",
              "objectType": "TiledSpriteObject::TiledSprite",
            },
            Object {
              "behaviors": Array [],
              "objectName": "GlobalTextObject",
              "objectType": "TextObject::Text",
            },
          ],
          "scenes": Array [
            Object {
              "objects": Array [
                Object {
                  "behaviors": Array [],
                  "objectName": "MySpriteObjectWithEffects",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MySpriteObjectWithoutEffect",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MySpriteObjectWithoutBehaviors",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [
                    Object {
                      "behaviorName": "Draggable",
                      "behaviorType": "DraggableBehavior::Draggable",
                    },
                    Object {
                      "behaviorName": "PlatformerObject",
                      "behaviorType": "PlatformBehavior::PlatformerObjectBehavior",
                    },
                  ],
                  "objectName": "MySpriteObjectWithBehaviors",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyEmptySpriteObject",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MySpriteObject",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyPanelSpriteObject",
                  "objectType": "PanelSpriteObject::PanelSprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "TextInputObject",
                  "objectType": "FakeTextInput::TextInput",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "CubeObject",
                  "objectType": "FakeScene3D::Cube3DObject",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyTiledSpriteObject",
                  "objectType": "TiledSpriteObject::TiledSprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyParticleEmitter",
                  "objectType": "ParticleSystem::ParticleEmitter",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyTextObject",
                  "objectType": "TextObject::Text",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyShapePainterObject",
                  "objectType": "PrimitiveDrawing::Drawer",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyButton",
                  "objectType": "Button::PanelSpriteButton",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "MyFakeObjectWithUnsupportedCapability",
                  "objectType": "FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls1",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls2",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls3",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls4",
                  "objectType": "Sprite",
                },
                Object {
                  "behaviors": Array [],
                  "objectName": "VirtualControls5",
                  "objectType": "Sprite",
                },
              ],
              "sceneName": "TestLayout",
            },
            Object {
              "objects": Array [],
              "sceneName": "EmptyLayout",
            },
            Object {
              "objects": Array [],
              "sceneName": "Layout with a very looooooooong naaaaame to test in the project manager",
            },
          ],
        }
      `);
  });
});
