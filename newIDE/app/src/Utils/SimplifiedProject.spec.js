// @flow
import { getSimplifiedProject } from './SimplifiedProject';
import { makeTestProject } from '../fixtures/TestProject';

const gd: libGDevelop = global.gd;

describe('SimplifiedProject', () => {
  it('should create a simplified project JSON with global objects and scenes', () => {
    const { project } = makeTestProject(gd);
    const simplifiedJson = getSimplifiedProject(project, {});

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
        "scenes": Array [
          Object {
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
            "objectGroups": Array [],
            "objects": Array [],
            "sceneName": "EmptyLayout",
            "sceneVariables": Array [],
          },
          Object {
            "objectGroups": Array [],
            "objects": Array [],
            "sceneName": "Layout with a very looooooooong naaaaame to test in the project manager",
            "sceneVariables": Array [],
          },
        ],
      }
    `);
  });
});
