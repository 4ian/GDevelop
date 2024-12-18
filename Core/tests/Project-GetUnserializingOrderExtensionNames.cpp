/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include <algorithm>

#include "DummyPlatform.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "catch.hpp"

TEST_CASE("Project::GetUnserializingOrderExtensionNames", "[common]") {
  SECTION("Unserialization order is correct when nothing to load") {
    gd::SerializerElement emptyElement;

    std::vector<gd::String> orderedNames =
        gd::Project::GetUnserializingOrderExtensionNames(emptyElement);
    REQUIRE(orderedNames.size() == 0);
  }
  SECTION("One extension with no dependencies") {
    gd::SerializerElement extensionsElement = gd::Serializer::FromJSON(
        R"([
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension1",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": []
        }
      ])");

    std::vector<gd::String> orderedNames =
        gd::Project::GetUnserializingOrderExtensionNames(extensionsElement);
    REQUIRE(orderedNames.size() == 1);
    REQUIRE(orderedNames[0] == "Extension1");
  }

  SECTION("One extension with a dependency outside the loaded extensions") {
    gd::SerializerElement extensionsElement = gd::Serializer::FromJSON(
        R"([
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension1DependsOtherExtension",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": [
            {
              "areaMaxX": 64,
              "areaMaxY": 64,
              "areaMaxZ": 64,
              "areaMinX": 0,
              "areaMinY": 0,
              "areaMinZ": 0,
              "defaultName": "Joystick",
              "description": "Joystick for touchscreens.",
              "fullName": "Multitouch Joystick",
              "name": "SpriteMultitouchJoystick",
              "eventsFunctions": [],
              "propertyDescriptors": [],
              "objects": [
                {
                  "name": "Thumb",
                  "type": "OtherExtension::Whatever"
                }
              ],
              "objectsFolderStructure": {
                "folderName": "__ROOT",
                "children": []
              },
              "objectsGroups": [],
              "layers": [],
              "instances": []
            }
          ]
        }
      ])");

    std::vector<gd::String> orderedNames =
        gd::Project::GetUnserializingOrderExtensionNames(extensionsElement);
    REQUIRE(orderedNames.size() == 1);
    REQUIRE(orderedNames[0] == "Extension1DependsOtherExtension");
  }

  SECTION("4 extensions with dependencies on each others") {
    gd::SerializerElement extensionsElement = gd::Serializer::FromJSON(
        R"([
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension4DependsOn1And3",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": [
            {
              "areaMaxX": 64,
              "areaMaxY": 64,
              "areaMaxZ": 64,
              "areaMinX": 0,
              "areaMinY": 0,
              "areaMinZ": 0,
              "defaultName": "Joystick",
              "description": "Joystick for touchscreens.",
              "fullName": "Multitouch Joystick",
              "name": "SpriteMultitouchJoystick",
              "eventsFunctions": [],
              "propertyDescriptors": [],
              "objects": [
                {
                  "name": "Thumb",
                  "type": "OtherExtension::Whatever"
                },
                {
                  "name": "Thumb2",
                  "type": "Extension1DependsNothing::Whatever"
                }
              ],
              "objectsFolderStructure": {
                "folderName": "__ROOT",
                "children": []
              },
              "objectsGroups": [],
              "layers": [],
              "instances": []
            },
            {
              "areaMaxX": 64,
              "areaMaxY": 64,
              "areaMaxZ": 64,
              "areaMinX": 0,
              "areaMinY": 0,
              "areaMinZ": 0,
              "defaultName": "Joystick",
              "description": "Joystick for touchscreens.",
              "fullName": "Multitouch Joystick",
              "name": "SpriteMultitouchJoystick",
              "eventsFunctions": [],
              "propertyDescriptors": [],
              "objects": [
                {
                  "name": "Thumb",
                  "type": "OtherExtension::Whatever"
                },
                {
                  "name": "Thumb2",
                  "type": "Extension3DependingOn2::Whatever"
                }
              ],
              "objectsFolderStructure": {
                "folderName": "__ROOT",
                "children": []
              },
              "objectsGroups": [],
              "layers": [],
              "instances": []
            }
          ]
        },
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension3DependingOn2",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": [
            {
              "areaMaxX": 64,
              "areaMaxY": 64,
              "areaMaxZ": 64,
              "areaMinX": 0,
              "areaMinY": 0,
              "areaMinZ": 0,
              "defaultName": "Joystick",
              "description": "Joystick for touchscreens.",
              "fullName": "Multitouch Joystick",
              "name": "SpriteMultitouchJoystick",
              "eventsFunctions": [],
              "propertyDescriptors": [],
              "objects": [
                {
                  "name": "Thumb",
                  "type": "OtherExtension::Whatever"
                },
                {
                  "name": "Thumb2",
                  "type": "Extension2DependsNothing::Whatever"
                }
              ],
              "objectsFolderStructure": {
                "folderName": "__ROOT",
                "children": []
              },
              "objectsGroups": [],
              "layers": [],
              "instances": []
            }
          ]
        },
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension2DependsNothing",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": []
        },
        {
          "author": "",
          "category": "Input",
          "extensionNamespace": "",
          "fullName": "3D character keyboard mapper",
          "helpPath": "",
          "iconUrl": "fake-icon-url",
          "name": "Extension1DependsNothing",
          "previewIconUrl": "fake-preview-icon-url",
          "shortDescription": "3D platformer and 3D shooter keyboard controls.",
          "version": "1.0.0",
          "description": "3D platformer and 3D shooter keyboard controls.",
          "tags": [],
          "authorIds": [],
          "dependencies": [],
          "globalVariables": [],
          "sceneVariables": [],
          "eventsFunctions": [],
          "eventsBasedBehaviors": [],
          "eventsBasedObjects": []
        }
      ])");

    std::vector<gd::String> orderedNames =
        gd::Project::GetUnserializingOrderExtensionNames(extensionsElement);
    REQUIRE(orderedNames.size() == 4);
    REQUIRE(orderedNames[0] == "Extension2DependsNothing");
    REQUIRE(orderedNames[1] == "Extension1DependsNothing");
    REQUIRE(orderedNames[2] == "Extension3DependingOn2");
    REQUIRE(orderedNames[3] == "Extension4DependsOn1And3");
  }
}
