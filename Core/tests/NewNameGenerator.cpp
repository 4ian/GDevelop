/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/NewNameGenerator.h"
#include "GDCore/String.h"
#include "catch.hpp"

TEST_CASE("NewNameGenerator", "[common]") {
  SECTION("Basics") {
    REQUIRE(gd::NewNameGenerator::Generate(
                "Test", "abc", [](const gd::String &) { return false; }) ==
            "Test");
    REQUIRE(gd::NewNameGenerator::Generate(
                "Test", "abc", [](const gd::String &name) {
                  return name == "Test";
                }) == "abcTest");
    REQUIRE(gd::NewNameGenerator::Generate(
                "Test", "abc", [](const gd::String &name) {
                  return name == "Test" || name == "abcTest";
                }) == "abcTest2");
    REQUIRE(gd::NewNameGenerator::Generate(
                "Test", "abc", [](const gd::String &name) {
                  return name == "Test" || name == "abcTest" ||
                         name == "abcTest2";
                }) == "abcTest3");
  }
}
