/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include <algorithm>
#include <initializer_list>
#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/VariablesContainer.h"
#include "catch.hpp"

TEST_CASE("Variable", "[common][variables]") {
  SECTION("Basics") {
    gd::Variable variable;
    variable.SetValue(50);
    REQUIRE(variable.GetValue() == 50);
    REQUIRE(variable == 50);
    REQUIRE(variable.GetType() == gd::Variable::Type::Number);

    variable.SetString("MyString");
    REQUIRE(variable.GetString() == "MyString");
    REQUIRE(variable == "MyString");
    REQUIRE(variable.GetType() == gd::Variable::Type::String);

    variable.SetBool(false);
    REQUIRE(variable.GetBool() == false);
    REQUIRE(variable == false);
    REQUIRE(variable.GetType() == gd::Variable::Type::Boolean);
  }
  SECTION("Conversions") {
    gd::Variable variable;
    variable.SetValue(50);
    variable.CastTo(gd::Variable::Type::String);
    REQUIRE(variable.GetType() == gd::Variable::Type::String);
    REQUIRE(variable.GetString() == "50");

    variable.SetString("MyString");
    variable.CastTo(gd::Variable::Type::Number);
    REQUIRE(variable.GetType() == gd::Variable::Type::Number);
    REQUIRE(variable.GetValue() == 0);
  }
  SECTION("Use with int and string like semantics") {
    gd::Variable variable;
    variable = 50;
    REQUIRE(variable.GetValue() == 50);
    REQUIRE(variable.GetType() == gd::Variable::Type::Number);

    variable = "MyString";
    REQUIRE(variable.GetString() == "MyString");
    REQUIRE(variable.GetType() == gd::Variable::Type::String);

    variable = "MyRealStdString";
    REQUIRE(variable.GetString() == "MyRealStdString");
    REQUIRE(variable.GetType() == gd::Variable::Type::String);
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
