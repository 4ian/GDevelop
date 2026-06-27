/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering EventsFunction
 */
#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("EventsFunction", "[common]") {
  SECTION("Basic properties") {
    gd::EventsFunction eventsFunction;

    eventsFunction.SetName("MyFunction");
    eventsFunction.SetFullName("My Function");
    eventsFunction.SetDescription("A test function");
    eventsFunction.SetGroup("Test Group");
    eventsFunction.SetSentence("Do something with _PARAM1_");

    REQUIRE(eventsFunction.GetName() == "MyFunction");
    REQUIRE(eventsFunction.GetFullName() == "My Function");
    REQUIRE(eventsFunction.GetDescription() == "A test function");
    REQUIRE(eventsFunction.GetGroup() == "Test Group");
    REQUIRE(eventsFunction.GetSentence() == "Do something with _PARAM1_");
  }

  SECTION("Help URL") {
    gd::EventsFunction eventsFunction;

    // Default should be empty
    REQUIRE(eventsFunction.GetHelpUrl() == "");

    // Can set a help URL
    eventsFunction.SetHelpUrl("https://example.com/help");
    REQUIRE(eventsFunction.GetHelpUrl() == "https://example.com/help");

    // Can clear the help URL
    eventsFunction.SetHelpUrl("");
    REQUIRE(eventsFunction.GetHelpUrl() == "");
  }

  SECTION("Serialization with help URL") {
    gd::Project project;

    gd::EventsFunction eventsFunction;
    eventsFunction.SetName("MyFunction");
    eventsFunction.SetFullName("My Function");
    eventsFunction.SetDescription("A test function");
    eventsFunction.SetHelpUrl("https://example.com/custom-help");

    gd::SerializerElement element;
    eventsFunction.SerializeTo(element);

    gd::EventsFunction eventsFunction2;
    eventsFunction2.UnserializeFrom(project, element);

    REQUIRE(eventsFunction2.GetName() == "MyFunction");
    REQUIRE(eventsFunction2.GetFullName() == "My Function");
    REQUIRE(eventsFunction2.GetDescription() == "A test function");
    REQUIRE(eventsFunction2.GetHelpUrl() == "https://example.com/custom-help");
  }

  SECTION("Serialization without help URL") {
    gd::Project project;

    gd::EventsFunction eventsFunction;
    eventsFunction.SetName("MyFunction");
    eventsFunction.SetFullName("My Function");
    eventsFunction.SetDescription("A test function");
    // No help URL set

    gd::SerializerElement element;
    eventsFunction.SerializeTo(element);

    gd::EventsFunction eventsFunction2;
    eventsFunction2.UnserializeFrom(project, element);

    REQUIRE(eventsFunction2.GetName() == "MyFunction");
    REQUIRE(eventsFunction2.GetFullName() == "My Function");
    REQUIRE(eventsFunction2.GetDescription() == "A test function");
    REQUIRE(eventsFunction2.GetHelpUrl() == "");
  }

  SECTION("Object events function scope keeps inherited prefab behaviors") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
        "MyEventsBasedObject", 0);
    eventsBasedObject.AddNewBehavior(project, "MyExtension::MyBehavior",
                                     "MyPrefabBehavior");

    auto &eventsFunction =
        eventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyObjectEventsFunction", 0);
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        eventsExtension, eventsBasedObject);

    gd::ObjectsContainer objectsContainer(gd::ObjectsContainer::Function);
    gd::EventsFunctionTools::ObjectEventsFunctionToObjectsContainer(
        project, eventsBasedObject, eventsFunction, objectsContainer);

    REQUIRE(objectsContainer.HasObjectNamed("Object"));
    auto &object = objectsContainer.GetObject("Object");
    REQUIRE(object.GetType() == "MyEventsExtension::MyEventsBasedObject");
    REQUIRE(object.HasBehaviorNamed("MyPrefabBehavior"));
    REQUIRE(object.GetBehavior("MyPrefabBehavior").GetTypeName() ==
            "MyExtension::MyBehavior");
    REQUIRE(
        object.GetBehavior("MyPrefabBehavior").IsInheritedFromObjectType());
  }

  SECTION("Choice properties are exposed as enum variables") {
    gd::PropertiesContainer properties(
        gd::EventsFunctionsContainer::FunctionOwner::Behavior);
    auto &property = properties.InsertNew("State", 0);
    property.SetType("Choice").SetValue("Idle");
    property.AddChoice("Idle", "Idle");
    property.AddChoice("Running", "Running");
    // Older extensions can still store choices in extra info.
    property.AddExtraInfo("Attacking");

    gd::VariablesContainer variablesContainer(
        gd::VariablesContainer::SourceType::Properties);
    gd::EventsFunctionTools::PropertiesToVariablesContainer(
        properties, variablesContainer);

    REQUIRE(variablesContainer.Has("State"));
    const auto &variable = variablesContainer.Get("State");
    REQUIRE(variable.GetType() == gd::Variable::Type::Enum);
    REQUIRE(variable.GetString() == "Idle");
    REQUIRE(variable.GetEnumValues().size() == 3);
    REQUIRE(variable.GetEnumValues()[0] == "Idle");
    REQUIRE(variable.GetEnumValues()[1] == "Running");
    REQUIRE(variable.GetEnumValues()[2] == "Attacking");
  }
}

