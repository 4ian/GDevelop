// @flow
import { makeSimplifiedProjectBuilder } from './SimplifiedProject';
import { makeTestProject } from '../../fixtures/TestProject';
import { makeTestExtensions } from '../../fixtures/TestExtensions';
const initializeGDevelopJs = require('libGD.js-for-tests-only');

describe('SimplifiedProject', () => {
  it('should create a simplified project JSON with global objects and scenes', async () => {
    const gd = await initializeGDevelopJs();
    const { project } = makeTestProject(gd);
    const simplifiedJson = makeSimplifiedProjectBuilder(
      gd
    ).getSimplifiedProject(project, {});

    expect(simplifiedJson).toMatchInlineSnapshot(`
      Object {
        "globalObjectGroups": Array [],
        "globalObjects": Array [
          Object {
            "behaviors": Array [
              Object {
                "behaviorName": "Effect",
                "behaviorType": "EffectCapability::EffectBehavior",
              },
              Object {
                "behaviorName": "Opacity",
                "behaviorType": "OpacityCapability::OpacityBehavior",
              },
              Object {
                "behaviorName": "Resizable",
                "behaviorType": "ResizableCapability::ResizableBehavior",
              },
            ],
            "objectName": "GlobalTiledSpriteObject",
            "objectType": "TiledSpriteObject::TiledSprite",
          },
          Object {
            "behaviors": Array [
              Object {
                "behaviorName": "Effect",
                "behaviorType": "EffectCapability::EffectBehavior",
              },
              Object {
                "behaviorName": "Opacity",
                "behaviorType": "OpacityCapability::OpacityBehavior",
              },
              Object {
                "behaviorName": "Scale",
                "behaviorType": "ScalableCapability::ScalableBehavior",
              },
              Object {
                "behaviorName": "Text",
                "behaviorType": "TextContainerCapability::TextContainerBehavior",
              },
            ],
            "objectName": "GlobalTextObject",
            "objectType": "TextObject::Text",
          },
        ],
        "globalVariables": Array [],
        "properties": Object {
          "gameResolutionHeight": 600,
          "gameResolutionWidth": 800,
        },
        "scenes": Array [
          Object {
            "instancesOnSceneDescription": "On the scene, there are:
      - on layer \\"GUI\\":
        - Nothing (no instances)
      - on layer \\"OtherLayer\\":
        - Nothing (no instances)
      - on base layer:
        - 1 CubeObject
        - 1 TextInputObject
        - 1 MySpriteObject

      Inspect instances on the scene to get more details if needed.",
            "objectGroups": Array [
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectGroupName": "GroupOfSprites",
                "objectGroupType": "Sprite",
                "objectNames": Array [
                  "MySpriteObject",
                ],
                "variables": Array [
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
                        "variableChildren": Array [
                          Object {
                            "type": "Number",
                            "value": "856.5",
                            "variableName": "0",
                          },
                        ],
                        "variableName": "ObjectChild4",
                      },
                    ],
                    "variableName": "OtherObjectVariable",
                  },
                ],
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectGroupName": "GroupOfObjects",
                "objectGroupType": "",
                "objectNames": Array [
                  "MySpriteObject",
                  "MyTextObject",
                ],
                "variables": undefined,
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Draggable",
                    "behaviorType": "DraggableBehavior::Draggable",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "PlatformerObject",
                    "behaviorType": "PlatformBehavior::PlatformerObjectBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectGroupName": "GroupOfSpriteObjectsWithBehaviors",
                "objectGroupType": "Sprite",
                "objectNames": Array [
                  "MySpriteObjectWithBehaviors",
                ],
                "variables": undefined,
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectGroupName": "MyGroupWithObjectsHavingLongName",
                "objectGroupType": "Sprite",
                "objectNames": Array [
                  "MySpriteObject",
                  "MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name",
                  "MySpriteObjectWithoutBehaviors",
                ],
                "variables": undefined,
              },
            ],
            "objects": Array [
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MySpriteObjectWithEffects",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MySpriteObjectWithoutEffect",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MySpriteObjectWithoutBehaviors",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Draggable",
                    "behaviorType": "DraggableBehavior::Draggable",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "PlatformerObject",
                    "behaviorType": "PlatformBehavior::PlatformerObjectBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MySpriteObjectWithBehaviors",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MyEmptySpriteObject",
                "objectType": "Sprite",
              },
              Object {
                "animationNames": "My animation, My other animation, (animation without name, animation index is: 2)",
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
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
                        "variableChildren": Array [
                          Object {
                            "type": "Number",
                            "value": "856.5",
                            "variableName": "0",
                          },
                        ],
                        "variableName": "ObjectChild4",
                      },
                    ],
                    "variableName": "OtherObjectVariable",
                  },
                ],
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                ],
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
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                ],
                "objectName": "MyTiledSpriteObject",
                "objectType": "TiledSpriteObject::TiledSprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                ],
                "objectName": "MyParticleEmitter",
                "objectType": "ParticleSystem::ParticleEmitter",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                  Object {
                    "behaviorName": "Text",
                    "behaviorType": "TextContainerCapability::TextContainerBehavior",
                  },
                ],
                "objectName": "MyTextObject",
                "objectType": "TextObject::Text",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MyShapePainterObject",
                "objectType": "PrimitiveDrawing::Drawer",
              },
              Object {
                "objectName": "MyButton",
                "objectType": "Button::PanelSpriteButton",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "MySpriteObject_With_A_Veeeerrryyyyyyyyy_Looooooooooooong_Name",
                "objectType": "Sprite",
              },
              Object {
                "objectName": "MyFakeObjectWithUnsupportedCapability",
                "objectType": "FakeObjectWithUnsupportedCapability::FakeObjectWithUnsupportedCapability",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "VirtualControls",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "VirtualControls1",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "VirtualControls2",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "VirtualControls3",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
                "objectName": "VirtualControls4",
                "objectType": "Sprite",
              },
              Object {
                "behaviors": Array [
                  Object {
                    "behaviorName": "Animation",
                    "behaviorType": "AnimatableCapability::AnimatableBehavior",
                  },
                  Object {
                    "behaviorName": "Effect",
                    "behaviorType": "EffectCapability::EffectBehavior",
                  },
                  Object {
                    "behaviorName": "Flippable",
                    "behaviorType": "FlippableCapability::FlippableBehavior",
                  },
                  Object {
                    "behaviorName": "Opacity",
                    "behaviorType": "OpacityCapability::OpacityBehavior",
                  },
                  Object {
                    "behaviorName": "Resizable",
                    "behaviorType": "ResizableCapability::ResizableBehavior",
                  },
                  Object {
                    "behaviorName": "Scale",
                    "behaviorType": "ScalableCapability::ScalableBehavior",
                  },
                ],
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
                    "variableChildren": Array [
                      Object {
                        "type": "String",
                        "value": "Hello
      Multiline
      World",
                        "variableName": "SubChild1",
                      },
                    ],
                    "variableName": "FoldedChild",
                  },
                ],
                "variableName": "Variable3",
              },
              Object {
                "type": "Array",
                "variableChildren": Array [
                  Object {
                    "type": "String",
                    "value": "String value
      with Multiline",
                    "variableName": "0",
                  },
                  Object {
                    "type": "Number",
                    "value": "4539.42",
                    "variableName": "1",
                  },
                  Object {
                    "type": "Boolean",
                    "value": "True",
                    "variableName": "2",
                  },
                ],
                "variableName": "FoldedArray",
              },
              Object {
                "type": "Array",
                "variableChildren": Array [
                  Object {
                    "type": "String",
                    "value": "PlayerName",
                    "variableName": "0",
                  },
                  Object {
                    "type": "Number",
                    "value": "25",
                    "variableName": "1",
                  },
                  Object {
                    "type": "Boolean",
                    "value": "False",
                    "variableName": "2",
                  },
                ],
                "variableName": "OtherArray",
              },
            ],
          },
          Object {
            "instancesOnSceneDescription": "There are no instances of objects placed on the scene - the scene is empty.",
            "objectGroups": Array [],
            "objects": Array [],
            "sceneName": "EmptyLayout",
            "sceneVariables": Array [],
          },
          Object {
            "instancesOnSceneDescription": "There are no instances of objects placed on the scene - the scene is empty.",
            "objectGroups": Array [],
            "objects": Array [],
            "sceneName": "Layout with a very looooooooong naaaaame to test in the project manager",
            "sceneVariables": Array [],
          },
        ],
      }
    `);
  });

  it('should include summaries of project specific extensions', async () => {
    const gd = await initializeGDevelopJs();
    makeTestExtensions(gd);

    const project = gd.ProjectHelper.createNewGDJSProject();
    // Mimic the test extension "FakeBehavior" was created from a project extension:
    project.insertNewEventsFunctionsExtension('FakeBehavior', 0);

    const projectSpecificExtensionsSummary = makeSimplifiedProjectBuilder(
      gd
    ).getProjectSpecificExtensionsSummary(project);

    expect(projectSpecificExtensionsSummary).toMatchInlineSnapshot(`
      Object {
        "extensionSummaries": Array [
          Object {
            "behaviors": Object {
              "FakeBehavior::FakeBehavior": Object {
                "actions": Array [],
                "conditions": Array [],
                "description": "A fake behavior with two properties.",
                "expressions": Array [
                  Object {
                    "description": "Some expression returning a number",
                    "parameters": Array [
                      Object {
                        "description": "First parameter (number)",
                        "type": "number",
                      },
                    ],
                    "type": "SomethingReturningNumberWith1NumberParam",
                  },
                  Object {
                    "description": "Some expression returning a string",
                    "parameters": Array [
                      Object {
                        "description": "First parameter (number)",
                        "type": "number",
                      },
                    ],
                    "type": "SomethingReturningStringWith1NumberParam",
                  },
                ],
                "fullName": "Fake behavior with two properties",
                "name": "FakeBehavior::FakeBehavior",
              },
            },
            "description": "A fake extension with a fake behavior containing 2 properties.",
            "effects": Object {},
            "extensionFullName": "Fake extension with a fake behavior",
            "extensionName": "FakeBehavior",
            "freeActions": Array [],
            "freeConditions": Array [],
            "freeExpressions": Array [],
            "objects": Object {},
          },
        ],
      }
    `);

    project.delete();
  });
});
