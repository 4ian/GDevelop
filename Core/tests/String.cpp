/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering String class of GDevelop Core.
 */
#include "GDCore/String.h"

#include <algorithm>
#include <initializer_list>
#include <map>

#include "GDCore/CommonTools.h"
#include "catch.hpp"

TEST_CASE("String", "[common]") {
  SECTION("ReplaceConsecutiveOccurrences") {
    gd::String str = "        ";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), ' ') ==
            " ");
    str = "L'opacité de NewSprite = \"    \"";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), ' ') ==
            "L'opacité de NewSprite = \" \"");
    str = "ccccccccc";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), 'c') ==
            "c");
    str = "c";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), 'c') ==
            "c");
    str = "";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), ' ') ==
            "");
    str = "Set animation of     NewSprite to    ";
    REQUIRE(str.RemoveConsecutiveOccurrences(str.begin(), str.end(), ' ') ==
            "Set animation of NewSprite to ");
  }
}