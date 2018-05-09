/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include <memory>
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("Events", "[common][events]") {
  SECTION("InstructionsList") {
    gd::InstructionsList list;
    gd::Instruction instr("InstructionType");
    list.Insert(instr);
    list.Insert(instr);
    list.Insert(instr);

    REQUIRE(list.size() == 3);
    list[1].SetType("ChangedInstructionType");

    REQUIRE(list[0].GetType() == "InstructionType");
    REQUIRE(list[1].GetType() == "ChangedInstructionType");

    gd::InstructionsList list2 = list;
    REQUIRE(list2.size() == 3);
    list2[0].SetType("YetAnotherInstructionType");

    REQUIRE(list2[0].GetType() == "YetAnotherInstructionType");
    REQUIRE(list2[1].GetType() == "ChangedInstructionType");
    REQUIRE(list[0].GetType() == "InstructionType");
    REQUIRE(list[1].GetType() == "ChangedInstructionType");
  }

  SECTION("StandardEvent") {
    gd::Instruction instr("InstructionType");
    gd::StandardEvent event;
    event.GetActions().Insert(instr);

    // Ensuring cloning is working
    std::shared_ptr<gd::StandardEvent> cloned(event.Clone());
    REQUIRE(cloned->GetActions().size() == 1);
    REQUIRE(cloned->GetActions()[0].GetType() == "InstructionType");

    cloned->GetActions()[0].SetType("ChangedInstructionType");
    REQUIRE(cloned->GetActions()[0].GetType() == "ChangedInstructionType");
    REQUIRE(event.GetActions()[0].GetType() == "InstructionType");
  }

  SECTION("ForEachEvent") {
    gd::Instruction instr("InstructionType");
    gd::ForEachEvent event;
    event.GetActions().Insert(instr);
    event.SetObjectToPick("Object");

    // Ensuring cloning is working
    std::shared_ptr<gd::ForEachEvent> cloned(event.Clone());
    REQUIRE(cloned->GetActions().size() == 1);
    REQUIRE(cloned->GetActions()[0].GetType() == "InstructionType");
    REQUIRE(event.GetObjectToPick() == "Object");
  }

  SECTION("GroupEvent") {
    gd::GroupEvent event;
    event.SetName("EventName");
    event.SetBackgroundColor(1, 2, 3);

    // Ensuring cloning is working
    std::shared_ptr<gd::GroupEvent> cloned(event.Clone());
    REQUIRE(cloned->GetName() == "EventName");
    REQUIRE(cloned->GetBackgroundColorR() == 1);
    REQUIRE(cloned->GetBackgroundColorG() == 2);
    REQUIRE(cloned->GetBackgroundColorB() == 3);
  }
}
