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
#include "GDCore/Serialization/SerializerElement.h"
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
  SECTION("Enum variables use string-backed semantics") {
    gd::Variable variable;
    variable.SetString("Idle");
    variable.CastTo(gd::Variable::Type::Enum);
    variable.SetEnumValues({"Idle", "Running"});
    REQUIRE(variable.GetType() == gd::Variable::Type::Enum);
    REQUIRE(variable.GetString() == "Idle");
    REQUIRE(variable.GetEnumValues().size() == 2);
    REQUIRE(variable.GetEnumValues()[0] == "Idle");
    REQUIRE(variable.GetEnumValues()[1] == "Running");
    REQUIRE(variable.IsValidEnumValue("Running") == true);
    REQUIRE(variable.IsValidEnumValue("Jumping") == false);
    REQUIRE(variable.GetBool() == true);
    REQUIRE(gd::Variable::IsPrimitive(variable.GetType()) == true);
    REQUIRE(gd::Variable::TypeAsString(variable.GetType()) == "enum");

    variable.SetString("Running");
    REQUIRE(variable.GetType() == gd::Variable::Type::Enum);
    REQUIRE(variable.GetString() == "Running");

    variable.SetString("Jumping");
    REQUIRE(variable.GetType() == gd::Variable::Type::Enum);
    REQUIRE(variable.GetString() == "Idle");

    variable.CastTo(gd::Variable::Type::String);
    REQUIRE(variable.GetType() == gd::Variable::Type::String);
    REQUIRE(variable.GetString() == "Idle");
    REQUIRE(variable.GetEnumValues().empty());

    variable.CastTo(gd::Variable::Type::Enum);
    variable.SetEnumValues({"Idle", "Running"});
    variable.SetString("Running");
    gd::SerializerElement element;
    variable.SerializeTo(element);
    REQUIRE(element.GetStringAttribute("type") == "enum");
    REQUIRE(element.GetStringAttribute("value") == "Running");
    REQUIRE(element.GetChild("values").GetChildrenCount() == 2);
    REQUIRE(element.GetChild("values").GetChild(0).GetStringValue() == "Idle");
    REQUIRE(element.GetChild("values").GetChild(1).GetStringValue() ==
            "Running");

    gd::Variable unserializedVariable;
    unserializedVariable.UnserializeFrom(element);
    REQUIRE(unserializedVariable.GetType() == gd::Variable::Type::Enum);
    REQUIRE(unserializedVariable.GetString() == "Running");
    REQUIRE(unserializedVariable.GetEnumValues().size() == 2);
    REQUIRE(unserializedVariable.GetEnumValues()[0] == "Idle");
    REQUIRE(unserializedVariable.GetEnumValues()[1] == "Running");
    REQUIRE(unserializedVariable == variable);

    unserializedVariable.RemoveEnumValueAt(1);
    REQUIRE(unserializedVariable.GetString() == "Idle");
    REQUIRE(unserializedVariable != variable);

    gd::Variable unrestrictedEnum;
    unrestrictedEnum.CastTo(gd::Variable::Type::Enum);
    unrestrictedEnum.SetString("AnyString");
    REQUIRE(unrestrictedEnum.GetString() == "AnyString");

    gd::Variable enumArray;
    enumArray.GetAtIndex(0).CastTo(gd::Variable::Type::Enum);
    enumArray.GetAtIndex(0).SetEnumValues({"Idle", "Running"});
    enumArray.GetAtIndex(0).SetString("Idle");
    gd::Variable& newEnumChild = enumArray.PushNew();
    REQUIRE(newEnumChild.GetType() == gd::Variable::Type::Enum);
    REQUIRE(newEnumChild.GetString() == "Idle");
    REQUIRE(newEnumChild.GetEnumValues().size() == 2);
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
  SECTION("Can find identical number variables") {
    gd::Variable variable;
    variable.SetValue(123);

    gd::Variable otherVariable;
    otherVariable.SetValue(123);

    REQUIRE(variable == otherVariable);
  }
  SECTION("Can find different number variables") {
    gd::Variable variable;
    variable.SetValue(123);

    gd::Variable otherVariable;
    otherVariable.SetValue(456);

    REQUIRE(variable != otherVariable);
  }
  SECTION("Can find identical structure variables") {
    gd::Variable variable;
    variable.GetChild("MyChild").SetValue(123);

    gd::Variable otherVariable;
    otherVariable.GetChild("MyChild").SetValue(123);

    REQUIRE(variable == otherVariable);
  }
  SECTION("Can find structure with different child value") {
    gd::Variable variable;
    variable.GetChild("MyChild").SetValue(123);

    gd::Variable otherVariable;
    otherVariable.GetChild("MyChild").SetValue(456);

    REQUIRE(variable != otherVariable);
  }
  SECTION("Can find structure with different child name") {
    gd::Variable variable;
    variable.GetChild("MyChild").SetValue(123);

    gd::Variable otherVariable;
    otherVariable.GetChild("MyOtherChild").SetValue(123);

    REQUIRE(variable != otherVariable);
  }
}
