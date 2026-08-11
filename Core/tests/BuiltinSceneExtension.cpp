/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "catch.hpp"

TEST_CASE("Builtin scene extension", "[common]") {
  gd::PlatformExtension extension;
  gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(extension);

  SECTION("Legacy SignalReceived metadata is retained but hidden") {
    const auto &conditions = extension.GetAllConditions();
    const auto signalReceived = conditions.find("SignalReceived");

    REQUIRE(signalReceived != conditions.end());
    REQUIRE(signalReceived->second.IsHidden());
  }
}
