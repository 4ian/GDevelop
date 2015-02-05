/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Variable.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/GroupEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include <boost/shared_ptr.hpp>

TEST_CASE( "Events", "[common][events]" ) {
    SECTION("StandardEvent") {
        gd::Instruction instr("InstructionType");
        gd::StandardEvent event;
        event.GetActions().push_back(instr);

        //Ensuring cloning is working
        boost::shared_ptr<gd::StandardEvent> cloned(event.Clone());
        REQUIRE( cloned->GetActions().size() == 1 );
        REQUIRE( cloned->GetActions()[0].GetType() == "InstructionType" );
    }

    SECTION("ForEachEvent") {
        gd::Instruction instr("InstructionType");
        gd::ForEachEvent event;
        event.GetActions().push_back(instr);
        event.SetObjectToPick("Object");

        //Ensuring cloning is working
        boost::shared_ptr<gd::ForEachEvent> cloned(event.Clone());
        REQUIRE( cloned->GetActions().size() == 1 );
        REQUIRE( cloned->GetActions()[0].GetType() == "InstructionType" );
        REQUIRE( event.GetObjectToPick() == "Object" );
    }

    SECTION("GroupEvent") {
        gd::GroupEvent event;
        event.SetName("EventName");
        event.SetBackgroundColor(1,2,3);

        //Ensuring cloning is working
        boost::shared_ptr<gd::GroupEvent> cloned(event.Clone());
        REQUIRE( cloned->GetName() == "EventName" );
        REQUIRE( cloned->GetBackgroundColorR() == 1 );
        REQUIRE( cloned->GetBackgroundColorG() == 2 );
        REQUIRE( cloned->GetBackgroundColorB() == 3 );
    }

}
