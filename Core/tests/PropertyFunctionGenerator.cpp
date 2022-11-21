/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/PropertyFunctionGenerator.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "catch.hpp"

namespace {

gd::EventsBasedBehavior &
CreateBehavior(gd::EventsFunctionsExtension &eventsExtension) {
  eventsExtension.SetName("MyEventsExtension");

  auto &eventsBasedBehavior =
      eventsExtension.GetEventsBasedBehaviors().InsertNew(
          "MyEventsBasedBehavior", 0);
  eventsBasedBehavior.SetFullName("My events based behavior");
  eventsBasedBehavior.SetDescription("An events based behavior for test");
  eventsBasedBehavior.SetObjectType("");
  return eventsBasedBehavior;
};
} // namespace

TEST_CASE("PropertyFunctionGenerator", "[common]") {
  SECTION("Can generate function for a number property") {
    gd::EventsFunctionsExtension extension;
    auto &behavior = CreateBehavior(extension);

    behavior.GetPropertyDescriptors()
        .InsertNew("MovementAngle", 0)
        .SetType("Number")
        .SetLabel("Movement angle")
        .SetDescription("The angle of the trajectory direction.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateGetterAndSetter(extension, behavior,
                                                           "MovementAngle");

    REQUIRE(
        behavior.GetEventsFunctions().HasEventsFunctionNamed("MovementAngle"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed(
        "SetMovementAngle"));

    auto &getter =
        behavior.GetEventsFunctions().GetEventsFunction("MovementAngle");

    REQUIRE(getter.GetFunctionType() ==
            gd::EventsFunction::ExpressionAndCondition);
    REQUIRE(getter.GetExpressionType().GetName() == "expression");
    REQUIRE(getter.GetFullName() == "Movement angle");
    REQUIRE(getter.GetGroup() ==
            "My events based behavior movement configuration");
    REQUIRE(getter.GetDescription() == "the movement angle of the object. The "
                                       "angle of the trajectory direction.");
    REQUIRE(getter.GetSentence() == "the movement angle");
    REQUIRE(getter.GetParameters().size() == 0);
  }
}
