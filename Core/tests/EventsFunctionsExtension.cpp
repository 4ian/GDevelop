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
    auto &freeEventsFunctions = eventsFunctionExtension.GetEventsFunctions();
    freeEventsFunctions.InsertNewEventsFunction("Function1", 0);
    freeEventsFunctions.InsertNewEventsFunction("Function2", 1);
    freeEventsFunctions.InsertNewEventsFunction("Function3", 2);
    eventsFunctionExtension.GetEventsBasedBehaviors().InsertNew("MyBehavior",
                                                                0);
    eventsFunctionExtension.GetEventsBasedBehaviors().InsertNew("MyBehavior2",
                                                                1);

    // Check that copy operator is working
    gd::EventsFunctionsExtension eventsFunctionExtension2 =
        eventsFunctionExtension;
    auto &freeEventsFunctions2 = eventsFunctionExtension2.GetEventsFunctions();
    REQUIRE(freeEventsFunctions2.GetEventsFunctionsCount() == 3);
    REQUIRE(freeEventsFunctions2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(freeEventsFunctions2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(freeEventsFunctions2.GetEventsFunction(2).GetName() ==
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
    freeEventsFunctions.GetEventsFunction(1).SetName("Function2.x");
    freeEventsFunctions2.GetEventsFunction(0).SetName("Function1.y");
    REQUIRE(freeEventsFunctions.GetEventsFunctionsCount() == 3);
    REQUIRE(freeEventsFunctions.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(freeEventsFunctions.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(freeEventsFunctions.GetEventsFunction(2).GetName() ==
            "Function3");
    REQUIRE(freeEventsFunctions2.GetEventsFunctionsCount() == 3);
    REQUIRE(freeEventsFunctions2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(freeEventsFunctions2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(freeEventsFunctions2.GetEventsFunction(2).GetName() ==
            "Function3");
  }
}
