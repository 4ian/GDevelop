/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("EventsFunctionsContainer", "[common]") {
  SECTION("Sanity checks") {
    gd::EventsFunctionsContainer eventsFunctionContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer.InsertNewEventsFunction("Function1", 0);
    eventsFunctionContainer.InsertNewEventsFunction("Function2", 1);
    eventsFunctionContainer.InsertNewEventsFunction("Function3", 2);

    // Check that copy operator is working
    gd::EventsFunctionsContainer eventsFunctionContainer2 =
        eventsFunctionContainer;
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

    // Check that the copy has not somehow shared the same pointers
    // to the events functions.
    eventsFunctionContainer.GetEventsFunction(1).SetName("Function2.x");
    eventsFunctionContainer2.GetEventsFunction(0).SetName("Function1.y");
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(2).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

    // Check removal
    eventsFunctionContainer.RemoveEventsFunction("Function3");
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 2);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");
  }
  SECTION("Serialization") {
    gd::Project project;
    gd::EventsFunctionsContainer eventsFunctionContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer.InsertNewEventsFunction("Function1", 0);
    eventsFunctionContainer.InsertNewEventsFunction("Function2", 1);
    eventsFunctionContainer.InsertNewEventsFunction("Function3", 2);

    gd::SerializerElement element;
    eventsFunctionContainer.SerializeEventsFunctionsTo(element);

    eventsFunctionContainer.RemoveEventsFunction("Function2");

    gd::EventsFunctionsContainer eventsFunctionContainer2(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer2.UnserializeEventsFunctionsFrom(project, element);
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 2);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

  }
}
