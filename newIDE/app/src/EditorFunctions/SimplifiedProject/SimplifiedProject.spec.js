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
        "resources": Array [
          Object {
            "file": "fake-image1.png",
            "metadata": undefined,
            "name": "fake-image1.png",
            "type": "image",
          },
          Object {
            "file": "fake-image2.png",
            "metadata": undefined,
            "name": "fake-image2.png",
            "type": "image",
          },
          Object {
            "file": "res/icon128.png",
            "metadata": undefined,
            "name": "icon128.png",
            "type": "image",
          },
          Object {
            "file": "res/powered-pixijs.png",
            "metadata": undefined,
            "name": "pixi",
            "type": "image",
          },
          Object {
            "file": "fake-audio1.mp3",
            "metadata": undefined,
            "name": "fake-audio1.mp3",
            "type": "audio",
          },
          Object {
            "file": "fake-video1.mp4",
            "metadata": undefined,
            "name": "fake-video1.mp4",
            "type": "video",
          },
          Object {
            "file": "fake-video2.mp4",
            "metadata": undefined,
            "name": "fake-video2.mp4",
            "type": "video",
          },
          Object {
            "file": "font.ttf",
            "metadata": undefined,
            "name": "font.ttf",
            "type": "font",
          },
          Object {
            "file": "bmfont.xml",
            "metadata": undefined,
            "name": "bmfont.xml",
            "type": "bitmapFont",
          },
          Object {
            "file": "super-font.fnt",
            "metadata": undefined,
            "name": "super-font.fnt",
            "type": "bitmapFont",
          },
          Object {
            "file": "levelData.json",
            "metadata": undefined,
            "name": "levelData.json",
            "type": "json",
          },
          Object {
            "file": "InventoryData.json",
            "metadata": undefined,
            "name": "InventoryData.json",
            "type": "json",
          },
          Object {
            "file": "text-data.json",
            "metadata": undefined,
            "name": "text-data.json",
            "type": "json",
          },
        ],
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
            "layers": Array [
              Object {
                "isBaseLayer": undefined,
                "layerName": "GUI",
                "position": 0,
              },
              Object {
                "isBaseLayer": undefined,
                "layerName": "OtherLayer",
                "position": 1,
              },
              Object {
                "isBaseLayer": true,
                "layerName": "",
                "position": 2,
              },
            ],
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
            "layers": Array [
              Object {
                "isBaseLayer": true,
                "layerName": "",
                "position": 0,
              },
            ],
            "objectGroups": Array [],
            "objects": Array [],
            "sceneName": "EmptyLayout",
            "sceneVariables": Array [],
          },
          Object {
            "instancesOnSceneDescription": "There are no instances of objects placed on the scene - the scene is empty.",
            "layers": Array [
              Object {
                "isBaseLayer": true,
                "layerName": "",
                "position": 0,
              },
            ],
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
                "properties": Array [
                  Object {
                    "description": "",
                    "label": "Property 1",
                    "name": "property1",
                    "type": "",
                  },
                  Object {
                    "description": "A description for property 2",
                    "name": "property2",
                    "type": "Boolean",
                  },
                ],
                "sharedProperties": Array [],
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

  it('should include summaries of project specific extensions with events based objects', async () => {
    const gd = await initializeGDevelopJs();
    makeTestExtensions(gd);

    const { project } = makeTestProject(gd);

    const projectSpecificExtensionsSummary = makeSimplifiedProjectBuilder(
      gd
    ).getProjectSpecificExtensionsSummary(project);

    const buttonExtensionSummary = projectSpecificExtensionsSummary.extensionSummaries.find(
      extensionSummary => extensionSummary.extensionName === 'Button'
    );

    expect(buttonExtensionSummary).toMatchInlineSnapshot(`
      Object {
        "behaviors": Object {},
        "description": "Fake event-based object",
        "effects": Object {},
        "extensionFullName": "Fake event-based object",
        "extensionName": "Button",
        "freeActions": Array [],
        "freeConditions": Array [],
        "freeExpressions": Array [],
        "objects": Object {
          "Button::PanelSpriteButton": Object {
            "actions": Array [],
            "conditions": Array [],
            "description": "A fake button made with a panel sprite and events.",
            "expressions": Array [],
            "fullName": "PanelSpriteButton",
            "name": "Button::PanelSpriteButton",
            "properties": Array [
              Object {
                "description": "",
                "label": "Label offset on Y axis when pressed",
                "name": "PressedLabelOffsetY",
                "type": "number",
              },
              Object {
                "description": "The left padding of the button",
                "group": "Padding",
                "label": "Left padding",
                "measurementUnit": Object {
                  "name": "Pixel",
                },
                "name": "LeftPadding",
                "type": "number",
              },
              Object {
                "description": "",
                "group": "Padding",
                "label": "Right padding",
                "name": "RightPadding",
                "type": "number",
              },
              Object {
                "description": "",
                "group": "Padding",
                "label": "Top padding",
                "name": "TopPadding",
                "type": "number",
              },
              Object {
                "description": "",
                "group": "Padding",
                "label": "Down padding",
                "name": "DownPadding",
                "type": "number",
              },
            ],
          },
        },
      }
    `);

    project.delete();
  });
});
