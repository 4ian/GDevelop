/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Project/ResourcesRenamer.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ResourcesRenamer", "[common]") {
  SECTION("It renames resources that are exposed") {
    std::map<gd::String, gd::String> renamings = {
        {"Resource1", "RenamedResource1"}};
    gd::ResourcesRenamer resourcesRenamer(renamings);

    gd::Project project;
    project.GetPlatformSpecificAssets().Set(
        "android", "some-icon", "Resource1");
    project.GetPlatformSpecificAssets().Set(
        "android", "some-other-icon", "Resource2");

    project.ExposeResources(resourcesRenamer);
    REQUIRE(project.GetPlatformSpecificAssets().Get("android", "some-icon") ==
            "RenamedResource1");
    REQUIRE(project.GetPlatformSpecificAssets().Get(
                "android", "some-other-icon") == "Resource2");
  }
}
