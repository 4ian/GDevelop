/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include <string>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("Resources", "[common][resources]") {
  SECTION("Basics") {
    gd::ImageResource image;
    image.SetName("MyResourceName");

    REQUIRE(image.GetName() == "MyResourceName");
  }
  SECTION("Filename handling") {
    gd::ImageResource image;
    image.SetFile("MyResourceFile");
    REQUIRE(image.GetFile() == "MyResourceFile");
    image.SetFile("My/relative/ResourceFile");
    REQUIRE(image.GetFile() == "My/relative/ResourceFile");
    image.SetFile("..\\My\\windows\\style\\relative\\ResourceFile");
    REQUIRE(image.GetFile() == "../My/windows/style/relative/ResourceFile");
    image.SetFile("Lots\\\\Of\\\\\\..\\Backslashs");
    REQUIRE(image.GetFile() == "Lots//Of///../Backslashs");
  }
}
