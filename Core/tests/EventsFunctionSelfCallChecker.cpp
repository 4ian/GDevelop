/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <memory>

#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/EventsFunctionSelfCallChecker.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

namespace {

void SetupProjectWithAdvancedExtension(gd::Project &project,
                                       gd::Platform &platform) {
  project.AddPlatform(platform);

  auto advancedExtension = std::make_shared<gd::PlatformExtension>();
  gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(
      *advancedExtension);
  platform.AddExtension(advancedExtension);
}

gd::EventsFunction &AddObjectExpressionFunction(
    gd::EventsBasedObject &eventsBasedObject,
    const gd::String &functionName,
    const gd::String &returnExpression) {
  auto &eventsFunction =
      eventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
          functionName, 0);
  eventsFunction.SetFunctionType(gd::EventsFunction::Expression);

  auto &standardEvent = dynamic_cast<gd::StandardEvent &>(
      eventsFunction.GetEvents().InsertEvent(gd::StandardEvent()));
  gd::Instruction returnAction("SetReturnNumber");
  returnAction.AddParameter(returnExpression);
  standardEvent.GetActions().Insert(returnAction);

  return eventsFunction;
}

} // namespace

TEST_CASE("EventsFunctionSelfCallChecker", "[common]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithAdvancedExtension(project, platform);

  auto &eventsFunctionsExtension =
      project.InsertNewEventsFunctionsExtension("MyExtension", 0);
  auto &eventsBasedObject =
      eventsFunctionsExtension.GetEventsBasedObjects().InsertNew("MyObject", 0);

  SECTION("Object expression functions detect direct self calls") {
    const auto selfCallFullType =
        gd::PlatformExtension::GetObjectEventsFunctionFullType(
            eventsFunctionsExtension.GetName(), eventsBasedObject.GetName(),
            "GetValue");
    auto &eventsFunction = AddObjectExpressionFunction(
        eventsBasedObject, "GetValue", selfCallFullType + "()");

    REQUIRE(gd::EventsFunctionSelfCallChecker::
                IsObjectFunctionOnlyCallingItself(project,
                                                  eventsFunctionsExtension,
                                                  eventsBasedObject,
                                                  eventsFunction));
  }

  SECTION("Object expression functions tolerate malformed return expressions") {
    auto &eventsFunction = AddObjectExpressionFunction(
        eventsBasedObject, "GetBrokenValue", "-");

    REQUIRE_FALSE(gd::EventsFunctionSelfCallChecker::
                      IsObjectFunctionOnlyCallingItself(project,
                                                        eventsFunctionsExtension,
                                                        eventsBasedObject,
                                                        eventsFunction));
  }
}
