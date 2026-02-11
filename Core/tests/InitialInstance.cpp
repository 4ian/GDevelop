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

#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/VersionWrapper.h"

TEST_CASE("InitialInstance", "[common][instances]") {

  SECTION("GetRawDoubleProperty") {
    gd::InitialInstance instance;
    REQUIRE(instance.GetRawDoubleProperty("NotExistingProperty") == 0);
  }

  SECTION("GetRawStringProperty") {
    gd::InitialInstance instance;
    REQUIRE(instance.GetRawStringProperty("NotExistingProperty") == "");
  }

  SECTION("Can create an instance without behavior property overriding") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::FakeObjectWithDefaultBehavior", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    REQUIRE(object.HasBehaviorNamed("MyBehavior") == true);
    gd::Behavior &behavior = object.GetBehavior("MyBehavior");

    gd::InitialInstance instance;
    instance.SetObjectName("MyObject");
    REQUIRE(instance.HasAnyOverriddenProperty(object) == false);
    REQUIRE(instance.HasAnyOverriddenPropertyForBehavior(behavior) == false);
    REQUIRE(instance.HasBehaviorOverridingNamed("MyBehavior") == false);
  }

  SECTION("Can add and remove behavior property overridings on an instance") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::FakeObjectWithDefaultBehavior", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    REQUIRE(object.HasBehaviorNamed("MyBehavior") == true);
    gd::Behavior &behavior = object.GetBehavior("MyBehavior");

    gd::InitialInstance instance;
    instance.SetObjectName("MyObject");
    instance.AddNewBehaviorOverriding(project, "MyExtension::MyBehavior",
                                      "MyBehavior");
    REQUIRE(instance.HasBehaviorOverridingNamed("MyBehavior") == true);
    gd::Behavior &behaviorOverriding =
        instance.GetBehaviorOverriding("MyBehavior");

    // The behavior overriding is empty by default.
    REQUIRE(instance.HasAnyOverriddenProperty(object) == false);
    REQUIRE(instance.HasAnyOverriddenPropertyForBehavior(behavior) == false);
    REQUIRE(behaviorOverriding.HasPropertyValue("numberProperty") == false);
    REQUIRE(behaviorOverriding.HasPropertyValue("stringProperty") == false);
    REQUIRE(behaviorOverriding.HasPropertyValue("booleanProperty") == false);

    // Add some behavior property overridings
    behaviorOverriding.UpdateProperty("numberProperty", "456");
    REQUIRE(
        behaviorOverriding.GetProperties().at("numberProperty").GetValue() ==
        "456");
    REQUIRE(behaviorOverriding.HasPropertyValue("numberProperty") == true);
    REQUIRE(instance.HasAnyOverriddenProperty(object) == true);
    REQUIRE(instance.HasAnyOverriddenPropertyForBehavior(behavior) == true);

    behaviorOverriding.UpdateProperty("stringProperty", "DEF");
    REQUIRE(
        behaviorOverriding.GetProperties().at("stringProperty").GetValue() ==
        "DEF");
    REQUIRE(behaviorOverriding.HasPropertyValue("stringProperty") == true);

    behaviorOverriding.UpdateProperty("booleanProperty", "false");
    REQUIRE(behaviorOverriding.HasPropertyValue("booleanProperty") == true);
    REQUIRE(
        behaviorOverriding.GetProperties().at("booleanProperty").GetValue() ==
        "false");

    // The user set back original values from the object behavior.
    // The IDE removes the behavior property overridings accordingly.
    behaviorOverriding.RemoveProperty("numberProperty");
    REQUIRE(behaviorOverriding.HasPropertyValue("numberProperty") == false);
    behaviorOverriding.RemoveProperty("stringProperty");
    REQUIRE(behaviorOverriding.HasPropertyValue("stringProperty") == false);
    behaviorOverriding.RemoveProperty("booleanProperty");
    REQUIRE(behaviorOverriding.HasPropertyValue("booleanProperty") == false);

    // No more property is overriden
    REQUIRE(instance.HasAnyOverriddenPropertyForBehavior(behavior) == false);
    REQUIRE(instance.HasAnyOverriddenProperty(object) == false);

    // The IDE removes the behavior overriding accordingly.
    instance.RemoveBehaviorOverriding("MyBehavior");
  }
}
