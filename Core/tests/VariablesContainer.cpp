/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"

#include <algorithm>
#include <initializer_list>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/VariablesContainer.h"

TEST_CASE("VariablesContainer", "[common][variables]") {
  SECTION("Copy and assignment") {
    gd::VariablesContainer container1;
    gd::VariablesContainer container2;

    container1.InsertNew("Variable1", 0).SetString("Hello World");
    container1.InsertNew("Variable2", 0).SetValue(42);

    gd::VariablesContainer container3(container1);
    container2 = container1;

    REQUIRE(container2.Has("Variable1") == true);
    REQUIRE(container2.Has("Variable2") == true);
    REQUIRE(container3.Has("Variable1") == true);
    REQUIRE(container3.Has("Variable2") == true);
    REQUIRE(container1.Get("Variable1").GetString() == "Hello World");
    REQUIRE(container1.Get("Variable2").GetValue() == 42);
    REQUIRE(container2.Get("Variable1").GetString() == "Hello World");
    REQUIRE(container2.Get("Variable2").GetValue() == 42);
    REQUIRE(container3.Get("Variable1").GetString() == "Hello World");
    REQUIRE(container3.Get("Variable2").GetValue() == 42);

    container2.Get("Variable1").SetString("Hello copied World");
    container2.Get("Variable2").SetValue(43);
    container3.Get("Variable1").SetString("Hello second copied World");
    container3.Get("Variable2").SetValue(44);
    REQUIRE(container1.Get("Variable1").GetString() == "Hello World");
    REQUIRE(container1.Get("Variable2").GetValue() == 42);
    REQUIRE(container2.Get("Variable1").GetString() == "Hello copied World");
    REQUIRE(container2.Get("Variable2").GetValue() == 43);
    REQUIRE(container3.Get("Variable1").GetString() ==
            "Hello second copied World");
    REQUIRE(container3.Get("Variable2").GetValue() == 44);
  }
}
