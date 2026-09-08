// @flow
import { makeSimplifiedProjectBuilder } from './SimplifiedProject';
import { makeTestProject } from '../../fixtures/TestProject';
import { makeTestExtensions } from '../../fixtures/TestExtensions';
import { unserializeFromJSObject } from '../../Utils/Serializer';
import tankConfigurationExtensionJson from '../../fixtures/TankConfigurationExtension.json';

const gd: libGDevelop = global.gd;

describe('SimplifiedProject', () => {
  it('should create a simplified project JSON with global objects and scenes', () => {
    const { project } = makeTestProject(gd);
    const simplifiedJson = makeSimplifiedProjectBuilder(
      gd
    ).getSimplifiedProject(project, {});

    expect(simplifiedJson).toMatchInlineSnapshot(`
      Object {
        "extensions": Array [
          Object {
            "description": "My description",
            "extensionName": "My name",
            "freeFunctions": Array [
              Object {
                "eventsCount": 1,
                "functionName": "MyTestFunction",
                "functionType": "Action",
                "parameters": Array [
                  Object {
                    "label": "The first object to be used",
                    "name": "MyObjectWithoutType",
                    "type": "objectList",
                  },
                  Object {
                    "label": "Some number",
                    "name": "MyNumber",
                    "type": "expression",
                  },
                  Object {
                    "label": "Some string",
                    "name": "MyString",
                    "type": "string",
                  },
                  Object {
                    "label": "The second object to be used, a sprite",
                    "name": "MySpriteObject",
                    "type": "objectList",
                  },
                ],
              },
              Object {
                "eventsCount": 0,
                "functionName": "MyTestFunction2",
                "functionType": "Action",
                "parameters": Array [],
              },
              Object {
                "eventsCount": 0,
                "functionName": "MyPrivateTestFunction3",
                "functionType": "Action",
                "isPrivate": true,
                "parameters": Array [],
              },
            ],
            "fullName": "My descriptive name",
            "shortDescription": "",
            "version": "1.1",
          },
          Object {
            "extensionName": "SomeAlreadyInstalledExtension",
            "fullName": "Some fake already installed extension",
            "shortDescription": "",
            "version": "1.2.3",
          },
          Object {
            "customObjects": Array [
              Object {
                "area": Object {
                  "maxX": 64,
                  "maxY": 64,
                  "maxZ": 64,
                  "minX": 0,
                  "minY": 0,
                  "minZ": 0,
                },
                "childObjects": Array [
                  Object {
                    "objectName": "Button",
                    "objectType": "Button::PanelSpriteButton",
                  },
                ],
                "functions": Array [],
                "instancesDescription": "There are no instances of child objects placed in this variant of the custom object - it is empty.",
                "layers": Array [
                  Object {
                    "isBaseLayer": true,
                    "layerName": "",
                    "position": 0,
                  },
                ],
                "objectName": "ComposedEventBasedObject",
                "properties": Array [],
              },
              Object {
                "area": Object {
                  "maxX": 64,
                  "maxY": 64,
                  "maxZ": 64,
                  "minX": 0,
                  "minY": 0,
                  "minZ": 0,
                },
                "childObjects": Array [
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
                    "objectName": "Label",
                    "objectType": "TextObject::Text",
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
                    "objectName": "Idle",
                    "objectType": "PanelSpriteObject::PanelSprite",
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
                    "objectName": "Hovered",
                    "objectType": "PanelSpriteObject::PanelSprite",
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
                    "objectName": "Pressed",
                    "objectType": "PanelSpriteObject::PanelSprite",
                  },
                ],
                "functions": Array [
                  Object {
                    "eventsCount": 1,
                    "functionName": "MyTestFunction",
                    "functionType": "Action",
                    "parameters": Array [],
                  },
                ],
                "instancesDescription": "There are no instances of child objects placed in this variant of the custom object - it is empty.",
                "layers": Array [
                  Object {
                    "isBaseLayer": true,
                    "layerName": "",
                    "position": 0,
                  },
                ],
                "objectName": "PanelSpriteButton",
                "properties": Array [
                  Object {
                    "label": "Label offset on Y axis when pressed",
                    "propertyName": "PressedLabelOffsetY",
                    "type": "number",
                  },
                  Object {
                    "description": "The left padding of the button",
                    "group": "Padding",
                    "label": "Left padding",
                    "measurementUnit": "Pixel",
                    "propertyName": "LeftPadding",
                    "type": "number",
                  },
                  Object {
                    "group": "Padding",
                    "label": "Right padding",
                    "propertyName": "RightPadding",
                    "type": "number",
                  },
                  Object {
                    "group": "Padding",
                    "label": "Top padding",
                    "propertyName": "TopPadding",
                    "type": "number",
                  },
                  Object {
                    "group": "Padding",
                    "label": "Down padding",
                    "propertyName": "DownPadding",
                    "type": "number",
                  },
                ],
              },
            ],
            "extensionName": "Button",
            "fullName": "",
            "shortDescription": "",
            "version": "1.0.0",
          },
        ],
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
          "firstLayout": "",
          "gameResolutionHeight": 600,
          "gameResolutionWidth": 800,
          "name": "Project",
          "orientation": "landscape",
          "scaleMode": "linear",
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
                    "behaviorName": "Anchor",
                    "behaviorType": "AnchorBehavior::AnchorBehavior",
                  },
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
              Object {
                "behaviors": undefined,
                "objectGroupName": "EmptyGroup",
                "objectGroupType": "",
                "objectNames": Array [],
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
                    "behaviorName": "Anchor",
                    "behaviorType": "AnchorBehavior::AnchorBehavior",
                  },
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

  it('should include summaries of project specific extensions', () => {
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
            "dimension": "",
            "effects": Object {},
            "extensionFullName": "Fake extension with a fake behavior",
            "extensionName": "FakeBehavior",
            "freeActions": Array [],
            "freeConditions": Array [],
            "freeExpressions": Array [],
            "objects": Object {},
            "shortDescription": "Fake behavior with two properties",
          },
        ],
      }
    `);

    project.delete();
  });

  it('should include summaries of project specific extensions with events based objects', () => {
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
        "description": "Fake event-based object (long description)",
        "dimension": "2D",
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
        "shortDescription": "Fake event-based object",
      }
    `);

    project.delete();
  });

  describe('extensions', () => {
    // An authored extension covering every declaration kind of the contract.
    const makeProjectWithCombatExtension = (): gdProject => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const extension = project.insertNewEventsFunctionsExtension('Combat', 0);
      extension.setFullName('Combat');
      extension.setShortDescription('Combat helpers');
      extension.setDescription('Behaviors and objects for combat.');
      extension.setCategory('Game mechanic');
      extension.getTags().push_back('combat');
      extension.getTags().push_back('health');
      extension.setVersion('1.0.0');
      extension.setAuthor('Me');
      extension
        .getGlobalVariables()
        .insertNew('KillCount', 0)
        .setValue(0);
      extension
        .getSceneVariables()
        .insertNew('WaveIndex', 0)
        .setValue(1);
      const dependency = extension.addDependency();
      dependency.setName('SomeNpmPackage');
      dependency.setDependencyType('npm');
      dependency.setExportName('some-npm-package');
      dependency.setVersion('2.0.0');

      const behavior = extension
        .getEventsBasedBehaviors()
        .insertNew('Patrol', 0);
      behavior.setFullName('Patrol');
      behavior.setDescription('Moves between points.');
      behavior
        .getPropertyDescriptors()
        .insertNew('Speed', 0)
        .setType('Number')
        .setValue('100')
        .setLabel('Speed')
        .setDescription('Pixels per second');
      behavior
        .getPropertyDescriptors()
        .insertNew('Mode', 1)
        .setType('Choice')
        .setValue('Loop')
        .addChoice('Loop', 'Loop')
        .addChoice('Once', 'Once');
      behavior
        .getSharedPropertyDescriptors()
        .insertNew('DebugLayer', 0)
        .setType('Layer')
        .setLabel('Debug layer');
      behavior
        .getEventsFunctions()
        .insertNewEventsFunction('doStepPreEvents', 0);
      const patrolAction = behavior
        .getEventsFunctions()
        .insertNewEventsFunction('GoTo', 1);
      patrolAction.setFunctionType(gd.EventsFunction.Action);
      patrolAction.setFullName('Go to a point');
      patrolAction.setSentence('Move _PARAM0_ to _PARAM2_;_PARAM3_');
      gd.WholeProjectRefactorer.ensureBehaviorEventsFunctionsProperParameters(
        extension,
        behavior
      );
      patrolAction
        .getParameters()
        .insertNewParameter('TargetX', 2)
        .setType('expression')
        .setDescription('Target X');
      patrolAction
        .getParameters()
        .insertNewParameter('TargetY', 3)
        .setType('expression')
        .setDescription('Target Y')
        .setOptional(true);

      const healthBar = extension
        .getEventsBasedObjects()
        .insertNew('HealthBar', 0);
      healthBar.setFullName('Health bar');
      healthBar.setDefaultName('HealthBar');
      healthBar.setAreaMaxX(200);
      healthBar.setAreaMaxY(20);
      healthBar
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Background', 0);
      healthBar
        .getObjects()
        .insertNewObject(project, 'Sprite', 'Fill', 1)
        .getVariables()
        .insertNew('Ratio', 0)
        .setValue(1);
      const group = healthBar
        .getObjects()
        .getObjectGroups()
        .insertNew('Parts', 0);
      group.addObject('Background');
      group.addObject('Fill');
      healthBar
        .getPropertyDescriptors()
        .insertNew('MaxValue', 0)
        .setType('Number')
        .setValue('100')
        .setLabel('Maximum value');
      healthBar.getEventsFunctions().insertNewEventsFunction('onCreated', 0);
      const getValue = healthBar
        .getEventsFunctions()
        .insertNewEventsFunction('Value', 1);
      getValue.setFunctionType(gd.EventsFunction.ExpressionAndCondition);
      getValue.getExpressionType().setName('number');
      gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
        extension,
        healthBar
      );
      const instance = healthBar
        .getInitialInstances()
        .insertNewInitialInstance();
      instance.setObjectName('Background');
      const largeVariant = healthBar.getVariants().insertNewVariant('Large', 0);
      largeVariant.setAreaMaxX(400);
      largeVariant.setAreaMaxY(40);
      largeVariant.setAssetStoreAssetId('asset-id-1');
      gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
        project,
        healthBar
      );

      const computeDamage = extension
        .getEventsFunctions()
        .insertNewEventsFunction('ComputeDamage', 0);
      computeDamage.setFunctionType(gd.EventsFunction.Expression);
      computeDamage.getExpressionType().setName('number');
      computeDamage.setPrivate(true);
      computeDamage
        .getParameters()
        .insertNewParameter('BaseDamage', 0)
        .setType('expression');
      const waitForWave = extension
        .getEventsFunctions()
        .insertNewEventsFunction('WaitForWave', 1);
      waitForWave.setAsync(true);
      waitForWave.setDeprecated(true);
      extension
        .getEventsFunctions()
        .insertNewEventsFunction('onSceneLoaded', 2);
      extension
        .getTests()
        .insertNewTest('Health bar fills', 0)
        .setDescription('A test');

      return project;
    };

    it('serializes the declarations of an authored extension', () => {
      const project = makeProjectWithCombatExtension();
      const { extensions } = makeSimplifiedProjectBuilder(
        gd
      ).getSimplifiedProject(project, {});

      expect(extensions).toMatchInlineSnapshot(`
        Array [
          Object {
            "author": "Me",
            "category": "Game mechanic",
            "customBehaviors": Array [
              Object {
                "behaviorName": "Patrol",
                "description": "Moves between points.",
                "fullName": "Patrol",
                "functions": Array [
                  Object {
                    "eventsCount": 0,
                    "functionName": "doStepPreEvents",
                    "functionType": "Action",
                    "isLifecycle": true,
                    "parameters": Array [
                      Object {
                        "isImplicit": true,
                        "label": "Object",
                        "name": "Object",
                        "type": "object",
                      },
                      Object {
                        "extraInfo": "Combat::Patrol",
                        "isImplicit": true,
                        "label": "Behavior",
                        "name": "Behavior",
                        "type": "behavior",
                      },
                    ],
                  },
                  Object {
                    "eventsCount": 0,
                    "fullName": "Go to a point",
                    "functionName": "GoTo",
                    "functionType": "Action",
                    "parameters": Array [
                      Object {
                        "isImplicit": true,
                        "label": "Object",
                        "name": "Object",
                        "type": "object",
                      },
                      Object {
                        "extraInfo": "Combat::Patrol",
                        "isImplicit": true,
                        "label": "Behavior",
                        "name": "Behavior",
                        "type": "behavior",
                      },
                      Object {
                        "label": "Target X",
                        "name": "TargetX",
                        "type": "expression",
                      },
                      Object {
                        "label": "Target Y",
                        "name": "TargetY",
                        "optional": true,
                        "type": "expression",
                      },
                    ],
                    "sentence": "Move _PARAM0_ to _PARAM2_;_PARAM3_",
                  },
                ],
                "properties": Array [
                  Object {
                    "defaultValue": "100",
                    "description": "Pixels per second",
                    "label": "Speed",
                    "propertyName": "Speed",
                    "type": "Number",
                  },
                  Object {
                    "choices": Array [
                      Object {
                        "label": "Loop",
                        "value": "Loop",
                      },
                      Object {
                        "label": "Once",
                        "value": "Once",
                      },
                    ],
                    "defaultValue": "Loop",
                    "propertyName": "Mode",
                    "type": "Choice",
                  },
                ],
                "sharedProperties": Array [
                  Object {
                    "label": "Debug layer",
                    "propertyName": "DebugLayer",
                    "type": "Layer",
                  },
                ],
              },
            ],
            "customObjects": Array [
              Object {
                "area": Object {
                  "maxX": 200,
                  "maxY": 20,
                  "maxZ": 64,
                  "minX": 0,
                  "minY": 0,
                  "minZ": 0,
                },
                "childObjects": Array [
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
                    "objectName": "Background",
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
                    "objectName": "Fill",
                    "objectType": "Sprite",
                    "objectVariables": Array [
                      Object {
                        "type": "Number",
                        "value": "1",
                        "variableName": "Ratio",
                      },
                    ],
                  },
                ],
                "defaultName": "HealthBar",
                "fullName": "Health bar",
                "functions": Array [
                  Object {
                    "eventsCount": 0,
                    "functionName": "onCreated",
                    "functionType": "Action",
                    "isLifecycle": true,
                    "parameters": Array [
                      Object {
                        "extraInfo": "Combat::HealthBar",
                        "isImplicit": true,
                        "label": "Object",
                        "name": "Object",
                        "type": "object",
                      },
                    ],
                  },
                  Object {
                    "eventsCount": 0,
                    "expressionType": "number",
                    "functionName": "Value",
                    "functionType": "ExpressionAndCondition",
                    "parameters": Array [
                      Object {
                        "extraInfo": "Combat::HealthBar",
                        "isImplicit": true,
                        "label": "Object",
                        "name": "Object",
                        "type": "object",
                      },
                    ],
                  },
                ],
                "instancesDescription": "In this variant of the custom object, there are:
        - on base layer:
          - 1 Background

        Inspect instances of this variant to get more details if needed.",
                "layers": Array [
                  Object {
                    "isBaseLayer": true,
                    "layerName": "",
                    "position": 0,
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
                    "objectGroupName": "Parts",
                    "objectGroupType": "Sprite",
                    "objectNames": Array [
                      "Background",
                      "Fill",
                    ],
                    "variables": undefined,
                  },
                ],
                "objectName": "HealthBar",
                "properties": Array [
                  Object {
                    "defaultValue": "100",
                    "label": "Maximum value",
                    "propertyName": "MaxValue",
                    "type": "Number",
                  },
                ],
                "variants": Array [
                  Object {
                    "area": Object {
                      "maxX": 400,
                      "maxY": 40,
                      "maxZ": 64,
                      "minX": 0,
                      "minY": 0,
                      "minZ": 0,
                    },
                    "assetStoreAssetId": "asset-id-1",
                    "childObjects": Array [
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
                        "objectName": "Background",
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
                        "objectName": "Fill",
                        "objectType": "Sprite",
                        "objectVariables": Array [
                          Object {
                            "type": "Number",
                            "value": "1",
                            "variableName": "Ratio",
                          },
                        ],
                      },
                    ],
                    "instancesDescription": "There are no instances of child objects placed in this variant of the custom object - it is empty.",
                    "layers": Array [
                      Object {
                        "isBaseLayer": true,
                        "layerName": "",
                        "position": 0,
                      },
                    ],
                    "variantName": "Large",
                  },
                ],
              },
            ],
            "dependencies": Array [
              Object {
                "dependencyName": "SomeNpmPackage",
                "exportName": "some-npm-package",
                "type": "npm",
                "version": "2.0.0",
              },
            ],
            "description": "Behaviors and objects for combat.",
            "extensionName": "Combat",
            "freeFunctions": Array [
              Object {
                "eventsCount": 0,
                "expressionType": "number",
                "functionName": "ComputeDamage",
                "functionType": "Expression",
                "isPrivate": true,
                "parameters": Array [
                  Object {
                    "name": "BaseDamage",
                    "type": "expression",
                  },
                ],
              },
              Object {
                "eventsCount": 0,
                "functionName": "WaitForWave",
                "functionType": "Action",
                "isAsync": true,
                "isDeprecated": true,
                "parameters": Array [],
              },
              Object {
                "eventsCount": 0,
                "functionName": "onSceneLoaded",
                "functionType": "Action",
                "isLifecycle": true,
                "parameters": Array [],
              },
            ],
            "fullName": "Combat",
            "globalVariables": Array [
              Object {
                "type": "Number",
                "value": "0",
                "variableName": "KillCount",
              },
            ],
            "sceneVariables": Array [
              Object {
                "type": "Number",
                "value": "1",
                "variableName": "WaveIndex",
              },
            ],
            "shortDescription": "Combat helpers",
            "tags": "combat, health",
            "tests": Array [
              Object {
                "description": "A test",
                "testName": "Health bar fills",
                "type": "gameplay",
              },
            ],
            "version": "1.0.0",
          },
        ]
      `);

      project.delete();
    });

    it('marks store extensions and describes nested custom objects (TankConfiguration)', () => {
      const project = gd.ProjectHelper.createNewGDJSProject();
      const extension = project.insertNewEventsFunctionsExtension(
        'TankConfiguration',
        0
      );
      unserializeFromJSObject(
        extension,
        tankConfigurationExtensionJson,
        'unserializeFrom',
        project
      );
      const storeExtension = project.insertNewEventsFunctionsExtension(
        'CameraShake',
        1
      );
      storeExtension.setOrigin('gdevelop-extension-store', 'CameraShake');

      const { extensions } = makeSimplifiedProjectBuilder(
        gd
      ).getSimplifiedProject(project, {});

      const tankConfiguration = extensions.find(
        extension => extension.extensionName === 'TankConfiguration'
      );
      if (!tankConfiguration) throw new Error('TankConfiguration not found');
      expect(tankConfiguration.isFromStore).toBeUndefined();
      const combinedTank = (tankConfiguration.customObjects || []).find(
        object => object.objectName === 'CombinedTank'
      );
      if (!combinedTank) throw new Error('CombinedTank not found');
      expect(combinedTank.childObjects[1].objectType).toBe(
        'TankConfiguration::TankTop'
      );
      expect(combinedTank.isRenderedIn3D).toBe(true);
      expect(combinedTank.area).toEqual({
        minX: 0,
        minY: 0,
        minZ: 0,
        maxX: 95,
        maxY: 65,
        maxZ: 69,
      });
      const setTopRotation = combinedTank.functions.find(
        eventsFunction => eventsFunction.functionName === 'SetTopRotation'
      );
      if (!setTopRotation) throw new Error('SetTopRotation not found');
      expect(setTopRotation.functionType).toBe('ActionWithOperator');
      expect(setTopRotation.getterName).toBe('TopRotation');
      expect(setTopRotation.parameters[0].isImplicit).toBe(true);
      expect(setTopRotation.parameters[0].extraInfo).toBe(
        'TankConfiguration::CombinedTank'
      );
      expect(setTopRotation.eventsCount).toBe(1);
      expect(combinedTank.instancesDescription).toContain('1 TankTop_Combined');

      const cameraShake = extensions.find(
        extension => extension.extensionName === 'CameraShake'
      );
      if (!cameraShake) throw new Error('CameraShake not found');
      expect(cameraShake.isFromStore).toBe(true);
      expect(cameraShake.originIdentifier).toBe('CameraShake');

      project.delete();
    });
  });
});
