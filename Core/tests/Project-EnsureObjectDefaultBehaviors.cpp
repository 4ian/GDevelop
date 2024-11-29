/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/Project/Project.h"

#include <algorithm>

#include "DummyPlatform.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/String.h"
#include "catch.hpp"

TEST_CASE("Project::EnsureObjectDefaultBehaviors", "[common]") {
  SECTION("Check that default behaviors are added to an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    auto myObject = project.CreateObject("MyExtension::Sprite", "MyObject");
    REQUIRE(myObject->GetType() == "MyExtension::Sprite");
    REQUIRE(myObject->GetAllBehaviorNames().size() == 0);

    project.EnsureObjectDefaultBehaviors(*myObject);
    REQUIRE(myObject->GetAllBehaviorNames().size() == 0);

    // Modify the "Sprite" extension to add a default behavior to the object.
    const auto& allExtensions = platform.GetAllPlatformExtensions();
    auto spriteExtensionIt = std::find_if(
        allExtensions.begin(),
        allExtensions.end(),
        [&](const std::shared_ptr<gd::PlatformExtension>& extension) {
          return extension->GetName() == "MyExtension";
        });
    REQUIRE(spriteExtensionIt != allExtensions.end());
    auto spriteExtension = *spriteExtensionIt;

    auto& spriteObjectMetadata =
        spriteExtension->GetObjectMetadata("MyExtension::Sprite");
    REQUIRE(gd::MetadataProvider::IsBadObjectMetadata(spriteObjectMetadata) ==
            false);

    spriteObjectMetadata.AddDefaultBehavior(
        "FlippableCapability::FlippableBehavior");

    // Ensure the default behavior is added.
    project.EnsureObjectDefaultBehaviors(*myObject);
    REQUIRE(myObject->GetAllBehaviorNames().size() == 1);
    REQUIRE(myObject->GetAllBehaviorNames()[0] == "Flippable");
    REQUIRE(myObject->GetBehavior("Flippable").GetTypeName() == "FlippableCapability::FlippableBehavior");

    // Ensure default behaviors are adapted if the object default behaviors are modified.
    // While this can not happen with pre-coded extensions, it can happen with custom objects.
    spriteObjectMetadata.ResetDefaultBehaviorsJustForTesting();
    spriteObjectMetadata.AddDefaultBehavior(
        "ResizableCapability::ResizableBehavior");
    spriteObjectMetadata.AddDefaultBehavior(
        "ScalableCapability::ScalableBehavior");

    project.EnsureObjectDefaultBehaviors(*myObject);
    REQUIRE(myObject->GetAllBehaviorNames().size() == 2);
    REQUIRE(myObject->GetAllBehaviorNames()[0] == "Resizable");
    REQUIRE(myObject->GetAllBehaviorNames()[1] == "Scale");
    REQUIRE(myObject->GetBehavior("Resizable").GetTypeName() == "ResizableCapability::ResizableBehavior");
    REQUIRE(myObject->GetBehavior("Scale").GetTypeName() == "ScalableCapability::ScalableBehavior");
  }
}
