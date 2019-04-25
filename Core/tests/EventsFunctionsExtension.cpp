/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("EventsFunctionsExtension", "[common]") {
  SECTION("Sanity checks") {
    gd::EventsFunctionsExtension eventsFunctionExtension;
    eventsFunctionExtension.InsertNewEventsFunction("Function1", 0);
    eventsFunctionExtension.InsertNewEventsFunction("Function2", 1);
    eventsFunctionExtension.InsertNewEventsFunction("Function3", 2);
    eventsFunctionExtension.GetEventsBasedBehaviors().InsertNew("MyBehavior",
                                                                0);
    eventsFunctionExtension.GetEventsBasedBehaviors().InsertNew("MyBehavior2",
                                                                1);

    // Check that copy operator is working
    gd::EventsFunctionsExtension eventsFunctionExtension2 =
        eventsFunctionExtension;
    REQUIRE(eventsFunctionExtension2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(2).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionExtension2.GetEventsBasedBehaviors().GetCount() == 2);
    REQUIRE(
        eventsFunctionExtension2.GetEventsBasedBehaviors().Get(0).GetName() ==
        "MyBehavior");
    REQUIRE(
        eventsFunctionExtension2.GetEventsBasedBehaviors().Get(1).GetName() ==
        "MyBehavior2");

    // Check that the copy has not somehow shared the same pointers
    // to the events functions.
    eventsFunctionExtension.GetEventsFunction(1).SetName("Function2.x");
    eventsFunctionExtension2.GetEventsFunction(0).SetName("Function1.y");
    REQUIRE(eventsFunctionExtension.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionExtension.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionExtension.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(eventsFunctionExtension.GetEventsFunction(2).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionExtension2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionExtension2.GetEventsFunction(2).GetName() ==
            "Function3");
  }
}
