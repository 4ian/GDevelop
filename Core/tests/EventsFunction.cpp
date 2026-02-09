/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering EventsFunction
 */
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/Project.h"
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
}

