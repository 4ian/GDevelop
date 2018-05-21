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

TEST_CASE("Variable", "[common][variables]") {
  SECTION("Basics") {
    gd::Variable variable;
    variable.SetValue(50);
    REQUIRE(variable.GetValue() == 50);
    REQUIRE(variable == 50);
    REQUIRE(variable.IsNumber() == true);
    REQUIRE(variable.IsStructure() == false);

    variable.SetString("MyString");
    REQUIRE(variable.GetString() == "MyString");
    REQUIRE(variable == "MyString");
    REQUIRE(variable.IsNumber() == false);
    REQUIRE(variable.IsStructure() == false);
  }
  SECTION("Conversions") {
    gd::Variable variable;
    variable.SetValue(50);
    REQUIRE(variable.GetString() == "50");  // Used as a string...
    REQUIRE(variable.IsNumber() == false);  //...so consider as a string

    variable.SetString("MyString");
    REQUIRE(variable.GetValue() == 0);     // Used as a number...
    REQUIRE(variable.IsNumber() == true);  //...so consider as a number
  }
  SECTION("Use with int and string like semantics") {
    gd::Variable variable;
    variable = 50;
    REQUIRE(variable.GetValue() == 50);
    REQUIRE(variable.IsNumber() == true);

    variable = "MyString";
    REQUIRE(variable.GetString() == "MyString");
    REQUIRE(variable.IsNumber() == false);

    variable = "MyRealStdString";
    REQUIRE(variable.GetString() == "MyRealStdString");
    REQUIRE(variable.IsNumber() == false);
  }
  SECTION("Copy and assignment") {
    gd::Variable variable1;
    gd::Variable variable2;

    variable1.GetChild("Child1").SetString("Hello World");
    variable1.GetChild("Child2").SetValue(42);

    gd::Variable variable3(variable1);
    variable2 = variable1;

    REQUIRE(variable2.HasChild("Child1") == true);
    REQUIRE(variable2.HasChild("Child2") == true);
    REQUIRE(variable3.HasChild("Child1") == true);
    REQUIRE(variable3.HasChild("Child2") == true);
    REQUIRE(variable1.GetChild("Child1").GetString() == "Hello World");
    REQUIRE(variable1.GetChild("Child2").GetValue() == 42);
    REQUIRE(variable2.GetChild("Child1").GetString() == "Hello World");
    REQUIRE(variable2.GetChild("Child2").GetValue() == 42);
    REQUIRE(variable3.GetChild("Child1").GetString() == "Hello World");
    REQUIRE(variable3.GetChild("Child2").GetValue() == 42);

    variable2.GetChild("Child1").SetString("Hello copied World");
    variable2.GetChild("Child2").SetValue(43);
    variable3.GetChild("Child1").SetString("Hello second copied World");
    variable3.GetChild("Child2").SetValue(44);
    REQUIRE(variable1.GetChild("Child1").GetString() == "Hello World");
    REQUIRE(variable1.GetChild("Child2").GetValue() == 42);
    REQUIRE(variable2.GetChild("Child1").GetString() == "Hello copied World");
    REQUIRE(variable2.GetChild("Child2").GetValue() == 43);
    REQUIRE(variable3.GetChild("Child1").GetString() ==
            "Hello second copied World");
    REQUIRE(variable3.GetChild("Child2").GetValue() == 44);
  }
}
