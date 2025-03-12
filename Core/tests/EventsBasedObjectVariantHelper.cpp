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
#include "GDCore/IDE/EventsBasedObjectVariantHelper.h"

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

gd::InitialInstance *
GetFirstInstanceOf(const gd::String objectName,
                   gd::InitialInstancesContainer &initialInstances) {
  gd::InitialInstance *variantInstance = nullptr;
  initialInstances.IterateOverInstances(
      [&variantInstance, &objectName](gd::InitialInstance &instance) {
        if (instance.GetObjectName() == objectName) {
          variantInstance = &instance;
          return true;
        }
        return false;
      });
  return variantInstance;
}

gd::EventsBasedObject &SetupEventsBasedObject(gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
  auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
      "MyEventsBasedObject", 0);
  auto &object = eventsBasedObject.GetObjects().InsertNewObject(
      project, "MyExtension::Sprite", "MyChildObject", 0);
  object.GetVariables().InsertNew("MyVariable").SetValue(123);
  object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
  auto &instance =
      eventsBasedObject.GetInitialInstances().InsertNewInitialInstance();
  instance.SetObjectName("MyChildObject");
  instance.GetVariables().InsertNew("MyVariable").SetValue(456);
  return eventsBasedObject;
}

TEST_CASE("EventsBasedObjectVariantHelper", "[common]") {
  SECTION("Can add missing objects") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    gd::InitialInstance *variantInstance = GetFirstInstanceOf(
        "MyChildObject", eventsBasedObject.GetInitialInstances());

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject2", 0);
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject3", 0);

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyOtherObject2"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyOtherObject3"));
  }

  SECTION("Can remove missing objects") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);

    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject2", 0);
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject3", 0);

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    gd::InitialInstance *variantInstance = GetFirstInstanceOf(
        "MyChildObject", eventsBasedObject.GetInitialInstances());

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject2");
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject2") == false);
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject3") == false);
  }

  SECTION("Can change object type") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    gd::InitialInstance *variantInstance = GetFirstInstanceOf(
        "MyChildObject", eventsBasedObject.GetInitialInstances());

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject");
    std::cout << "InsertNewObject" << std::endl;
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::FakeObjectWithDefaultBehavior", "MyChildObject",
        0);

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().GetObject("MyChildObject").GetType() ==
            "MyExtension::FakeObjectWithDefaultBehavior");
  }

  SECTION("Can add missing behaviors") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    auto &object = eventsBasedObject.GetObjects().GetObject("MyObject");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior2");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior"));
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior2"));
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior3"));
  }

  SECTION("Can remove missing behaviors") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);

    auto &object = eventsBasedObject.GetObjects().GetObject("MyObject");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior2");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior3");

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    object.RemoveBehavior("MyBehavior2");
    object.RemoveBehavior("MyBehavior3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior"));
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior2") == false);
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior3") == false);
  }

  SECTION("Can change behavior type") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    auto &object = eventsBasedObject.GetObjects().GetObject("MyObject");
    object.RemoveBehavior("MyBehavior");
    object.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                          "MyBehavior");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.HasBehaviorNamed("MyBehavior"));
    REQUIRE(variantObject.GetBehavior("MyBehavior").GetTypeName() ==
            "MyExtension::MyOtherBehavior");
  }
}
