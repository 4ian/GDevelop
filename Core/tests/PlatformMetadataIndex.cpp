/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests for gd::MetadataProvider lookups, which are backed by
 * gd::PlatformMetadataIndex (constant-time index of a platform's metadata).
 */
#include "DummyPlatform.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

using namespace gd;

TEST_CASE("PlatformMetadataIndex (via MetadataProvider)", "[common]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);

  SECTION("It resolves every kind of metadata declared by an extension") {
    REQUIRE_FALSE(MetadataProvider::IsBadObjectMetadata(
        MetadataProvider::GetObjectMetadata(platform, "MyExtension::Sprite")));
    REQUIRE_FALSE(MetadataProvider::IsBadBehaviorMetadata(
        MetadataProvider::GetBehaviorMetadata(platform,
                                              "MyExtension::MyBehavior")));
    REQUIRE_FALSE(MetadataProvider::IsBadInstructionMetadata(
        MetadataProvider::GetActionMetadata(platform, "MyExtension::DoSomething")));
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetExpressionMetadata(platform, "MyExtension::GetNumber")));
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetStrExpressionMetadata(platform, "MyExtension::ToString")));
  }

  SECTION("Behavior actions are indexed alongside free/object actions") {
    REQUIRE_FALSE(MetadataProvider::IsBadInstructionMetadata(
        MetadataProvider::GetActionMetadata(
            platform, "MyExtension::BehaviorDoSomething")));
  }

  SECTION("It resolves object/behavior expressions on their own type") {
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetObjectExpressionMetadata(
            platform, "MyExtension::Sprite", "GetObjectNumber")));
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetObjectStrExpressionMetadata(
            platform, "MyExtension::Sprite", "GetObjectStringWith1Param")));
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetBehaviorExpressionMetadata(
            platform, "MyExtension::MyBehavior", "GetBehaviorNumberWith1Param")));
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetBehaviorStrExpressionMetadata(
            platform, "MyExtension::MyBehavior", "GetBehaviorStringWith1Param")));
  }

  SECTION("Object expressions fall back to the base object type") {
    // "GetFromBaseExpression" is declared on the base object (""), not on
    // Sprite, so it must be resolved through the base-type fallback.
    const auto& fromBase = MetadataProvider::GetObjectExpressionMetadata(
        platform, "MyExtension::Sprite", "GetFromBaseExpression");
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(fromBase));

    // It must also be found for an object type that is not declared by any
    // extension (still resolved via the base object).
    REQUIRE_FALSE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetObjectExpressionMetadata(
            platform, "UnknownObjectType", "GetFromBaseExpression")));
  }

  SECTION("Unknown types resolve to the bad metadata") {
    REQUIRE(MetadataProvider::IsBadObjectMetadata(
        MetadataProvider::GetObjectMetadata(platform, "MyExtension::DoesNotExist")));
    REQUIRE(MetadataProvider::IsBadBehaviorMetadata(
        MetadataProvider::GetBehaviorMetadata(platform, "Does::NotExist")));
    REQUIRE(MetadataProvider::IsBadInstructionMetadata(
        MetadataProvider::GetActionMetadata(platform, "Does::NotExist")));
    REQUIRE(MetadataProvider::IsBadInstructionMetadata(
        MetadataProvider::GetConditionMetadata(platform, "Does::NotExist")));
    REQUIRE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetExpressionMetadata(platform, "Does::NotExist")));
    REQUIRE(MetadataProvider::IsBadExpressionMetadata(
        MetadataProvider::GetObjectExpressionMetadata(
            platform, "MyExtension::Sprite", "DoesNotExist")));
  }

  SECTION("It returns the extension that declares the metadata") {
    auto extensionAndMetadata =
        MetadataProvider::GetExtensionAndObjectMetadata(platform,
                                                        "MyExtension::Sprite");
    REQUIRE(extensionAndMetadata.GetExtension().GetName() == "MyExtension");

    auto badExtensionAndMetadata =
        MetadataProvider::GetExtensionAndObjectMetadata(platform,
                                                        "MyExtension::DoesNotExist");
    REQUIRE(badExtensionAndMetadata.GetExtension().GetName().empty());
  }

  SECTION("The index is rebuilt after the platform's extensions change") {
    REQUIRE_FALSE(MetadataProvider::IsBadObjectMetadata(
        MetadataProvider::GetObjectMetadata(platform, "MyExtension::Sprite")));

    platform.RemoveExtension("MyExtension");
    REQUIRE(MetadataProvider::IsBadObjectMetadata(
        MetadataProvider::GetObjectMetadata(platform, "MyExtension::Sprite")));
  }
}
