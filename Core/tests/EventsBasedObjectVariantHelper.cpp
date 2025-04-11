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
  instance.GetVariables().InsertNew("MyVariable").SetValue(111);
  auto &objectGroup =
      eventsBasedObject.GetObjects().GetObjectGroups().InsertNew(
          "MyObjectGroup");
  objectGroup.AddObject("MyChildObject");
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

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject2", 0);
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject3", 0);

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject2"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject3"));
  }

  SECTION("Can remove objects") {
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
    variant.GetInitialInstances().InsertNewInitialInstance().SetObjectName(
        "MyChildObject2");
    REQUIRE(variant.GetInitialInstances().HasInstancesOfObject(
                "MyChildObject2") == true);

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject2");
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject2") == false);
    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject3") == false);
    REQUIRE(variant.GetInitialInstances().HasInstancesOfObject(
                "MyChildObject2") == false);
  }

  SECTION("Can change object type") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().RemoveObject("MyChildObject");
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::FakeObjectWithDefaultBehavior", "MyChildObject",
        0);

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    REQUIRE(variant.GetObjects().GetObject("MyChildObject").GetType() ==
            "MyExtension::FakeObjectWithDefaultBehavior");
    REQUIRE(variant.GetInitialInstances().GetInstancesCount() == 1);
  }

  SECTION("Can add missing object groups") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().GetObjectGroups().InsertNew("MyObjectGroup2",
                                                               0);
    eventsBasedObject.GetObjects()
        .GetObjectGroups()
        .InsertNew("MyObjectGroup3", 0)
        .AddObject("MyChildObject");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    auto &variantObjectGroups = variant.GetObjects().GetObjectGroups();
    REQUIRE(variantObjectGroups.Has("MyObjectGroup"));
    REQUIRE(variantObjectGroups.Has("MyObjectGroup2"));
    REQUIRE(variantObjectGroups.Has("MyObjectGroup3"));
    REQUIRE(
        variantObjectGroups.Get("MyObjectGroup").GetAllObjectsNames().size() ==
        1);
    REQUIRE(
        variantObjectGroups.Get("MyObjectGroup2").GetAllObjectsNames().size() ==
        0);
    REQUIRE(
        variantObjectGroups.Get("MyObjectGroup3").GetAllObjectsNames().size() ==
        1);
  }

  SECTION("Can remove object groups") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);

    // Do the changes and launch the refactoring.
    eventsBasedObject.GetObjects().GetObjectGroups().InsertNew("MyObjectGroup2",
                                                               0);
    eventsBasedObject.GetObjects().GetObjectGroups().InsertNew("MyObjectGroup3",
                                                               0);

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    eventsBasedObject.GetObjects().GetObjectGroups().Remove("MyObjectGroup2");
    eventsBasedObject.GetObjects().GetObjectGroups().Remove("MyObjectGroup3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    auto &variantObjectGroups = variant.GetObjects().GetObjectGroups();
    REQUIRE(variantObjectGroups.Has("MyObjectGroup"));
    REQUIRE(variantObjectGroups.Has("MyObjectGroup2") == false);
    REQUIRE(variantObjectGroups.Has("MyObjectGroup3") == false);
  }

  SECTION("Can add objects to groups") {
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

    // Do the changes and launch the refactoring.
    auto &objectGroup =
        eventsBasedObject.GetObjects().GetObjectGroups().Get("MyObjectGroup");
    objectGroup.AddObject("MyChildObject2");
    objectGroup.AddObject("MyChildObject3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    auto &variantObjectGroups = variant.GetObjects().GetObjectGroups();
    REQUIRE(variantObjectGroups.Has("MyObjectGroup"));
    REQUIRE(
        variantObjectGroups.Get("MyObjectGroup").GetAllObjectsNames().size() ==
        3);
  }

  SECTION("Can remove objects from groups") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject2", 0);
    eventsBasedObject.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyChildObject3", 0);
    auto &objectGroup =
        eventsBasedObject.GetObjects().GetObjectGroups().Get("MyObjectGroup");
    objectGroup.AddObject("MyChildObject2");
    objectGroup.AddObject("MyChildObject3");

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    objectGroup.RemoveObject("MyChildObject2");
    objectGroup.RemoveObject("MyChildObject3");

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    auto &variantObjectGroups = variant.GetObjects().GetObjectGroups();
    REQUIRE(variantObjectGroups.Has("MyObjectGroup"));
    REQUIRE(
        variantObjectGroups.Get("MyObjectGroup").GetAllObjectsNames().size() ==
        1);
  }

  SECTION("Can add missing behaviors") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
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

    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
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
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
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

  SECTION("Can add missing variables") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
    object.GetVariables().InsertNew("MyVariable2", 1).SetValue(456);
    object.GetVariables().InsertNew("MyVariable3", 2).SetValue(789);

    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.GetVariables().Get("MyVariable").GetValue() == 123);
    REQUIRE(variantObject.GetVariables().Get("MyVariable2").GetValue() == 456);
    REQUIRE(variantObject.GetVariables().Get("MyVariable3").GetValue() == 789);
    {
      auto *objectInstance =
          GetFirstInstanceOf("MyChildObject", variant.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      REQUIRE(objectInstance->GetVariables().Has("MyVariable"));
      REQUIRE(objectInstance->GetVariables().Has("MyVariable2") == false);
      REQUIRE(objectInstance->GetVariables().Has("MyVariable3") == false);
    }
  }

  SECTION("Can keep variable value") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");

    // Do the changes and launch the refactoring.
    object.GetVariables().Get("MyVariable").SetValue(456);
    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.GetVariables().Get("MyVariable").GetValue() == 123);
    {
      auto *objectInstance =
          GetFirstInstanceOf("MyChildObject", variant.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      REQUIRE(objectInstance->GetVariables().Get("MyVariable").GetValue() ==
              111);
    }
  }

  SECTION("Must not propagate instance variable value changes") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    {
      auto *objectInstance = GetFirstInstanceOf(
          "MyChildObject", eventsBasedObject.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      objectInstance->GetVariables().Get("MyVariable").SetValue(222);
    }
    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    {
      auto *objectInstance =
          GetFirstInstanceOf("MyChildObject", variant.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      REQUIRE(objectInstance->GetVariables().Get("MyVariable").GetValue() ==
              111);
    }
  }

  SECTION("Can move variables") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
    object.GetVariables().InsertNew("MyVariable2", 1).SetValue(456);
    object.GetVariables().InsertNew("MyVariable3", 2).SetValue(789);
    {
      auto *objectInstance = GetFirstInstanceOf(
          "MyChildObject", eventsBasedObject.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      objectInstance->GetVariables().Get("MyVariable2").SetValue(222);
      objectInstance->GetVariables().Get("MyVariable3").SetValue(333);
    }

    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);

    // Do the changes and launch the refactoring.
    object.GetVariables().Move(2, 0);
    object.GetVariables().Get("MyVariable").SetValue(111);
    object.GetVariables().Get("MyVariable2").SetValue(222);
    object.GetVariables().Get("MyVariable3").SetValue(333);
    REQUIRE(object.GetVariables().GetNameAt(0) == "MyVariable3");
    REQUIRE(object.GetVariables().GetNameAt(1) == "MyVariable");
    REQUIRE(object.GetVariables().GetNameAt(2) == "MyVariable2");
    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.GetVariables().Get("MyVariable").GetValue() == 123);
    REQUIRE(variantObject.GetVariables().Get("MyVariable2").GetValue() == 456);
    REQUIRE(variantObject.GetVariables().Get("MyVariable3").GetValue() == 789);
    REQUIRE(variantObject.GetVariables().GetNameAt(0) == "MyVariable3");
    REQUIRE(variantObject.GetVariables().GetNameAt(1) == "MyVariable");
    REQUIRE(variantObject.GetVariables().GetNameAt(2) == "MyVariable2");
  }

  SECTION("Can remove variables") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");
    object.GetVariables().InsertNew("MyVariable2", 1).SetValue(456);
    object.GetVariables().InsertNew("MyVariable3", 2).SetValue(789);
    {
      auto *objectInstance = GetFirstInstanceOf(
          "MyChildObject", eventsBasedObject.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      objectInstance->GetVariables().Get("MyVariable2").SetValue(222);
      objectInstance->GetVariables().Get("MyVariable3").SetValue(333);
    }

    // Do the changes and launch the refactoring.
    object.GetVariables().Remove("MyVariable2");
    object.GetVariables().Remove("MyVariable3");
    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.GetVariables().Has("MyVariable"));
    REQUIRE(variantObject.GetVariables().Has("MyVariable2") == false);
    REQUIRE(variantObject.GetVariables().Has("MyVariable3") == false);
    {
      auto *objectInstance =
          GetFirstInstanceOf("MyChildObject", variant.GetInitialInstances());
      REQUIRE(objectInstance != nullptr);
      REQUIRE(objectInstance->GetVariables().Has("MyVariable"));
      REQUIRE(objectInstance->GetVariables().Has("MyVariable2") == false);
      REQUIRE(objectInstance->GetVariables().Has("MyVariable3") == false);
    }
  }

  SECTION("Can change variable type") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsBasedObject = SetupEventsBasedObject(project);
    auto &variant = eventsBasedObject.GetVariants().InsertVariant(
        eventsBasedObject.GetDefaultVariant(), 0);
    auto &object = eventsBasedObject.GetObjects().GetObject("MyChildObject");

    // Do the changes and launch the refactoring.
    object.GetVariables().Get("MyVariable").SetString("abc");
    gd::EventsBasedObjectVariantHelper::ComplyVariantsToEventsBasedObject(
        project, eventsBasedObject);

    REQUIRE(variant.GetObjects().HasObjectNamed("MyChildObject"));
    auto &variantObject = variant.GetObjects().GetObject("MyChildObject");
    REQUIRE(variantObject.GetVariables().Get("MyVariable").GetString() ==
            "abc");
    REQUIRE(variant.GetInitialInstances().HasInstancesOfObject("MyVariable") ==
            false);
  }
}
