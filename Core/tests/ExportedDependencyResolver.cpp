/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering gd::ExportedDependencyResolver.
 */
#include "GDCore/IDE/ExportedDependencyResolver.h"

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExportedDependencyResolver", "[common]") {
  SECTION("Ignores used extensions that are not loaded in the platform") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    // The list of used extensions can contain names of extensions that are
    // not loaded in the platform (for example, the empty name coming from
    // an unknown object/behavior/instruction type, or an events-based
    // extension that failed to be generated). This must not crash.
    auto dependencies = gd::ExportedDependencyResolver::GetDependenciesFor(
        project, {"", "NotExistingExtension"}, "cordova");
    REQUIRE(dependencies.size() == 0);
  }
}
