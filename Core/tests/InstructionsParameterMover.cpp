/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Events/InstructionsParameterMover.h"

#include <string>

#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Project/ProjectResourcesAdder.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("InstructionsParameterMover", "[common][events]") {
  gd::Platform platform;
  gd::Project project;
  SetupProjectWithDummyPlatform(project, platform);

  auto& layout = project.InsertNewLayout("Scene", 0);

  gd::StandardEvent standardEvent;
  gd::Instruction instruction;
  instruction.SetType("MyExtension::DoSomething");
  instruction.SetParametersCount(3);
  instruction.SetParameter(0, "Param1");
  instruction.SetParameter(1, "Param2");
  instruction.SetParameter(2, "Param3");
  standardEvent.GetActions().Insert(instruction);
  layout.GetEvents().InsertEvent(standardEvent);

  gd::Instruction& insertedInstruction =
      dynamic_cast<gd::StandardEvent&>(layout.GetEvents().GetEvent(0))
          .GetActions()
          .Get(0);

  SECTION("Move a parameter from one valid index to another") {
    gd::InstructionsParameterMover mover(
        project, "MyExtension::DoSomething", 0, 2);

    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
    REQUIRE(insertedInstruction.GetParameter(0).GetPlainString() == "Param2");
    REQUIRE(insertedInstruction.GetParameter(1).GetPlainString() == "Param3");
    REQUIRE(insertedInstruction.GetParameter(2).GetPlainString() == "Param1");
  }
  SECTION("Move a parameter to an out of bound new index") {
    gd::InstructionsParameterMover mover(
        project, "MyExtension::DoSomething", 0, 99);

    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
    REQUIRE(insertedInstruction.GetParameter(0).GetPlainString() == "Param2");
    REQUIRE(insertedInstruction.GetParameter(1).GetPlainString() == "Param3");
    REQUIRE(insertedInstruction.GetParameter(2).GetPlainString() == "Param1");
  }
  SECTION("Don't move a parameter if out of bound old index") {
    gd::InstructionsParameterMover mover(
        project, "MyExtension::DoSomething", 99, 2);

    gd::ProjectBrowserHelper::ExposeProjectEvents(project, mover);
    REQUIRE(insertedInstruction.GetParameter(0).GetPlainString() == "Param1");
    REQUIRE(insertedInstruction.GetParameter(1).GetPlainString() == "Param2");
    REQUIRE(insertedInstruction.GetParameter(2).GetPlainString() == "Param3");
  }
}
