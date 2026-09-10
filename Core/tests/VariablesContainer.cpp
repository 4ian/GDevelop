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
  SECTION("Insert clears the editor-only mixed values marker") {
    gd::Variable mixedValuesVariable;
    mixedValuesVariable.SetValue(123);
    mixedValuesVariable.MarkAsMixedValues();

    gd::Variable mixedTypesVariable;
    mixedTypesVariable.SetValue(456);
    mixedTypesVariable.CastTo(gd::Variable::Type::MixedTypes);

    gd::VariablesContainer container;
    auto& insertedMixedValuesVariable =
        container.Insert("MyMixedValuesVariable", mixedValuesVariable, 0);
    auto& insertedMixedTypesVariable =
        container.Insert("MyMixedTypesVariable", mixedTypesVariable, 1);

    // The inserted copies have an actual value: the marker used to display
    // "Mixed values" in the editor is not kept.
    REQUIRE(insertedMixedValuesVariable.HasMixedValues() == false);
    REQUIRE(insertedMixedValuesVariable.GetType() ==
            gd::Variable::Type::Number);
    REQUIRE(insertedMixedValuesVariable.GetValue() == 123);
    REQUIRE(insertedMixedTypesVariable.HasMixedValues() == false);
    REQUIRE(insertedMixedTypesVariable.GetType() ==
            gd::Variable::Type::Number);

    // The original variables are left untouched.
    REQUIRE(mixedValuesVariable.HasMixedValues() == true);
    REQUIRE(mixedTypesVariable.GetType() == gd::Variable::Type::MixedTypes);
  }
  SECTION("EnsurePersistentUuids sets missing UUIDs and preserves existing ones") {
    gd::VariablesContainer container;
    container.InsertNew("Variable1", 0).SetString("Hello World");

    REQUIRE(container.GetPersistentUuid() == "");
    REQUIRE(container.Get("Variable1").GetPersistentUuid() == "");

    container.EnsurePersistentUuids();

    const gd::String containerUuid = container.GetPersistentUuid();
    const gd::String variable1Uuid =
        container.Get("Variable1").GetPersistentUuid();
    REQUIRE(containerUuid != "");
    REQUIRE(variable1Uuid != "");

    // A new variable, without a UUID, is added.
    container.InsertNew("Variable2", 1).SetValue(42);
    REQUIRE(container.Get("Variable2").GetPersistentUuid() == "");

    container.EnsurePersistentUuids();

    // Existing UUIDs are preserved, the new variable got one.
    REQUIRE(container.GetPersistentUuid() == containerUuid);
    REQUIRE(container.Get("Variable1").GetPersistentUuid() == variable1Uuid);
    REQUIRE(container.Get("Variable2").GetPersistentUuid() != "");

    // Contrary to ResetPersistentUuid, which regenerates everything.
    container.ResetPersistentUuid();
    REQUIRE(container.GetPersistentUuid() != containerUuid);
    REQUIRE(container.Get("Variable1").GetPersistentUuid() != variable1Uuid);
  }
}
