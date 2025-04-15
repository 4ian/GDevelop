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
            "objectName": "GlobalTiledSpriteObject",
            "objectType": "TiledSpriteObject::TiledSprite",
          },
          Object {
            "objectName": "GlobalTextObject",
            "objectType": "TextObject::Text",
          },
        ],
        "globalVariables": Array [],
        "scenes": Array [
          Object {
            "objects": Array [
              Object {
                "objectName": "MySpriteObjectWithEffects",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "MySpriteObjectWithoutEffect",
                "objectType": "Sprite",
              },
              Object {
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
                "objectName": "MyEmptySpriteObject",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "MySpriteObject",
                "objectType": "Sprite",
                "objectVariables": Array [
                  Object {
                    "type": "String",
                    "value": "A multiline
      str value",
                    "variableName": "ObjectVariable",
                  },
                  Object {
                    "type": "Structure",
                    "variableChildren": Array [
                      Object {
                        "type": "Number",
                        "value": "564",
                        "variableName": "ObjectChild1",
                      },
                      Object {
                        "type": "String",
                        "value": "Guttentag",
                        "variableName": "ObjectChild2",
                      },
                      Object {
                        "type": "Boolean",
                        "value": "True",
                        "variableName": "ObjectChild3",
                      },
                      Object {
                        "type": "Array",
                        "variableName": "ObjectChild4",
                      },
                    ],
                    "variableName": "OtherObjectVariable",
                  },
                ],
              },
              Object {
                "objectName": "MyPanelSpriteObject",
                "objectType": "PanelSpriteObject::PanelSprite",
              },
              Object {
                "objectName": "TextInputObject",
                "objectType": "FakeTextInput::TextInput",
              },
              Object {
                "objectName": "CubeObject",
                "objectType": "FakeScene3D::Cube3DObject",
              },
              Object {
                "objectName": "MyTiledSpriteObject",
                "objectType": "TiledSpriteObject::TiledSprite",
              },
              Object {
                "objectName": "MyParticleEmitter",
                "objectType": "ParticleSystem::ParticleEmitter",
              },
              Object {
                "objectName": "MyTextObject",
                "objectType": "TextObject::Text",
              },
              Object {
                "objectName": "MyShapePainterObject",
                "objectType": "PrimitiveDrawing::Drawer",
              },
              Object {
                "objectName": "MyButton",
                "objectType": "Button::PanelSpriteButton",
              },
              Object {
                "objectName": "MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "MyFakeObjectWithUnsupportedCapability",
                "objectType": "FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability",
              },
              Object {
                "objectName": "VirtualControls",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "VirtualControls1",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "VirtualControls2",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "VirtualControls3",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "VirtualControls4",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "VirtualControls5",
                "objectType": "Sprite",
              },
            ],
            "sceneName": "TestLayout",
            "sceneVariables": Array [
              Object {
                "type": "String",
                "value": "A multiline
      str value",
                "variableName": "Variable1",
              },
              Object {
                "type": "String",
                "value": "123456",
                "variableName": "Variable2",
              },
              Object {
                "type": "Structure",
                "variableChildren": Array [
                  Object {
                    "type": "String",
                    "value": "Child1 str value",
                    "variableName": "Child1",
                  },
                  Object {
                    "type": "String",
                    "value": "7891011",
                    "variableName": "Child2",
                  },
                  Object {
                    "type": "Structure",
                    "variableName": "FoldedChild",
                  },
                ],
                "variableName": "Variable3",
              },
              Object {
                "type": "Array",
                "variableName": "FoldedArray",
              },
              Object {
                "type": "Array",
                "variableName": "OtherArray",
              },
            ],
          },
          Object {
            "objects": Array [],
            "sceneName": "EmptyLayout",
            "sceneVariables": Array [],
          },
          Object {
            "objects": Array [],
            "sceneName": "Layout with a very looooooooong naaaaame to test in the project manager",
            "sceneVariables": Array [],
          },
        ],
      }
    `);
  });
});
