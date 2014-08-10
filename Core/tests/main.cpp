/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
/**
 * @file File containing the tests for GDCore.
 */
#define CATCH_CONFIG_MAIN
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"

TEST_CASE( "Common tools", "[common]" ) {
    REQUIRE( gd::ToInt("1") == 1 );
    REQUIRE( gd::ToString(2) == "2" );
}

TEST_CASE( "Project", "[common]" ) {
	gd::Project project;
	project.SetName("myname");
    REQUIRE( project.GetName() == "myname" );
}

TEST_CASE( "EventsList", "[common][events]" ) {
	gd::EventsList list;
	gd::EmptyEvent event1;
	boost::shared_ptr<gd::BaseEvent> event2(new gd::EmptyEvent);
	list.InsertEvent(event1);
	list.InsertEvent(event2);
    REQUIRE( &list.GetEvent(0) != &event1 ); //First event inserted by copy
    REQUIRE( &list.GetEvent(1) == event2.get() ); //Second event not copied
}