/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/InstructionsCountEvaluator.h"

#include <algorithm>

#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

namespace {

TEST_CASE("InstructionsCountEvaluator", "[events]") {

  SECTION("Can count 1 action in a layout") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &layout1 = project.InsertNewLayout("Layout1", 0);

    // Add an event with an action.
    gd::StandardEvent event;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::DoSomething");
    instruction.SetParametersCount(1);
    event.GetActions().Insert(instruction);
    layout1.GetEvents().InsertEvent(event);

    REQUIRE(gd::InstructionsCountEvaluator::ScanProject(project) == 1);
  }
}

} // namespace