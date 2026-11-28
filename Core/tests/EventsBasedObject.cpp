/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/EventsBasedObject.h"

#include "catch.hpp"

TEST_CASE("EventsBasedObject", "[common]") {
  SECTION("Recognizes the lifecycle functions of objects") {
    REQUIRE(
        gd::EventsBasedObject::IsObjectLifecycleEventsFunction("onCreated"));
    REQUIRE(gd::EventsBasedObject::IsObjectLifecycleEventsFunction(
        "doStepPreEvents"));
    REQUIRE(gd::EventsBasedObject::IsObjectLifecycleEventsFunction(
        "doStepPostEvents"));
    REQUIRE(
        gd::EventsBasedObject::IsObjectLifecycleEventsFunction("onDestroy"));
    REQUIRE(gd::EventsBasedObject::IsObjectLifecycleEventsFunction(
        "onHotReloading"));

    // Only behaviors are activated and deactivated.
    REQUIRE_FALSE(
        gd::EventsBasedObject::IsObjectLifecycleEventsFunction("onActivate"));
    REQUIRE_FALSE(
        gd::EventsBasedObject::IsObjectLifecycleEventsFunction("MyFunction"));
  }
}
