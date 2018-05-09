/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/AbstractFileSystem.h"
#include "catch.hpp"

TEST_CASE("AbstractFileSystem", "[common]") {
  SECTION("Basics") {
    REQUIRE(gd::AbstractFileSystem::NormalizeSeparator(u8"C:\\Test\\Test2\\") ==
            u8"C:/Test/Test2/");
    REQUIRE(gd::AbstractFileSystem::NormalizeSeparator(
                u8"C:\\TestԘ\\Test2\\") == u8"C:/TestԘ/Test2/");
    REQUIRE(gd::AbstractFileSystem::NormalizeSeparator(u8"/TestԘ/Test2") ==
            u8"/TestԘ/Test2");
  }
}
