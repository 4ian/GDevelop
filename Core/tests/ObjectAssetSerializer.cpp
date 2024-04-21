/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/ObjectAssetSerializer.h"

#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/CustomObjectConfiguration.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"
#include <string>

using namespace gd;

TEST_CASE("ObjectAssetSerializer", "[common]") {

  SECTION("Can serialize custom objects as assets") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
        "MyEventsBasedObject", 0);
    eventsBasedObject.SetFullName("My events based object");
    eventsBasedObject.SetDescription("An events based object for test");
    eventsBasedObject.InsertNewObject(project, "MyExtension::Sprite", "MyChild",
                                      0);

    auto &resourceManager = project.GetResourcesManager();
    gd::ImageResource imageResource;
    imageResource.SetName("assets/Idle.png");
    imageResource.SetFile("assets/Idle.png");
    imageResource.SetSmooth(true);
    resourceManager.AddResource(imageResource);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.InsertNewObject(
        project, "MyEventsExtension::MyEventsBasedObject", "MyObject", 0);
    auto &configuration = object.GetConfiguration();
    auto *customObjectConfiguration =
        dynamic_cast<gd::CustomObjectConfiguration *>(&configuration);
    auto *spriteConfiguration = dynamic_cast<gd::SpriteObject *>(
        &customObjectConfiguration->GetChildObjectConfiguration("MyChild"));
    REQUIRE(spriteConfiguration != nullptr);
    {
      gd::Animation animation;
      animation.SetName("Idle");
      animation.SetDirectionsCount(1);
      auto &direction = animation.GetDirection(0);
      gd::Sprite frame;
      frame.SetImageName("assets/Idle.png");
      direction.AddSprite(frame);

      spriteConfiguration->GetAnimations().AddAnimation(animation);
    }

    SerializerElement assetElement;
    std::vector<gd::String> usedResourceNames;
    ObjectAssetSerializer::SerializeTo(project, object, "My Object",
                                       assetElement, usedResourceNames);

    // This list is used to copy resource files.
    REQUIRE(usedResourceNames.size() == 1);
    REQUIRE(usedResourceNames[0] == "assets/Idle.png");

    // Check that the project is left untouched.
    REQUIRE(resourceManager.HasResource("assets/Idle.png"));
    REQUIRE(resourceManager.GetResource("assets/Idle.png").GetFile() ==
            "assets/Idle.png");
    REQUIRE(!resourceManager.HasResource("Idle.png"));

    REQUIRE(assetElement.HasChild("objectAssets"));
    auto &objectAssetsElement = assetElement.GetChild("objectAssets");
    objectAssetsElement.ConsiderAsArrayOf("objectAsset");
    REQUIRE(objectAssetsElement.GetChildrenCount() == 1);
    auto &objectAssetElement = objectAssetsElement.GetChild(0);

    REQUIRE(objectAssetElement.HasChild("requiredExtensions"));
    auto &requiredExtensionsElement =
        objectAssetElement.GetChild("requiredExtensions");
    requiredExtensionsElement.ConsiderAsArrayOf("requiredExtension");
    REQUIRE(requiredExtensionsElement.GetChildrenCount() == 1);
    auto &requiredExtensionElement = requiredExtensionsElement.GetChild(0);
    REQUIRE(requiredExtensionElement.GetStringAttribute("extensionName") ==
            "MyEventsExtension");

    // Resources are renamed according to asset script naming conventions.
    REQUIRE(objectAssetElement.HasChild("resources"));
    auto &resourcesElement = objectAssetElement.GetChild("resources");
    resourcesElement.ConsiderAsArrayOf("resource");
    REQUIRE(resourcesElement.GetChildrenCount() == 1);
    {
      auto &resourceElement = resourcesElement.GetChild(0);
      REQUIRE(resourceElement.GetStringAttribute("name") == "assets/Idle.png");
      REQUIRE(resourceElement.GetStringAttribute("file") == "assets/Idle.png");
      REQUIRE(resourceElement.GetStringAttribute("kind") == "image");
      REQUIRE(resourceElement.GetBoolAttribute("smoothed") == true);
    }

    // Resources used in object configuration are updated.
    REQUIRE(objectAssetElement.HasChild("object"));
    auto &objectElement = objectAssetElement.GetChild("object");
    REQUIRE(objectElement.GetStringAttribute("name") == "MyObject");
    REQUIRE(objectElement.GetStringAttribute("type") ==
            "MyEventsExtension::MyEventsBasedObject");
    auto &childrenContentElement = objectElement.GetChild("childrenContent");

    REQUIRE(childrenContentElement.HasChild("MyChild"));
    auto &childElement = childrenContentElement.GetChild("MyChild");
    REQUIRE(childElement.HasChild("animations"));
    auto &animationsElement = childElement.GetChild("animations");
    animationsElement.ConsiderAsArrayOf("animation");
    REQUIRE(animationsElement.GetChildrenCount() == 1);
    auto &animationElement = animationsElement.GetChild(0);

    REQUIRE(animationElement.GetStringAttribute("name") == "Idle");
    auto &directionsElement = animationElement.GetChild("directions");
    directionsElement.ConsiderAsArrayOf("direction");
    REQUIRE(directionsElement.GetChildrenCount() == 1);
    auto &directionElement = directionsElement.GetChild(0);
    auto &spritesElement = directionElement.GetChild("sprites");
    spritesElement.ConsiderAsArrayOf("sprite");
    REQUIRE(spritesElement.GetChildrenCount() == 1);
    auto &spriteElement = spritesElement.GetChild(0);
    REQUIRE(spriteElement.GetStringAttribute("image") == "assets/Idle.png");
  }
}
