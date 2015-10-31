/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/Serializer.h"

TEST_CASE( "Project", "[common]" ) {
    SECTION("Basics") {
        gd::Project project;
        project.SetName("myname");
        REQUIRE( project.GetName() == "myname" );
    }
}

TEST_CASE( "Variable", "[common]" ) {
    SECTION("Basics") {
        gd::Variable variable;
        variable.SetValue(50);
        REQUIRE( variable.GetValue() == 50 );
        REQUIRE( variable == 50 );
        REQUIRE( variable.IsNumber() == true );
        REQUIRE( variable.IsStructure() == false );

        variable.SetString("MyString");
        REQUIRE( variable.GetString() == "MyString" );
        REQUIRE( variable == "MyString" );
        REQUIRE( variable.IsNumber() == false );
        REQUIRE( variable.IsStructure() == false );
    }
    SECTION("Conversions") {
        gd::Variable variable;
        variable.SetValue(50);
        REQUIRE( variable.GetString() == "50" ); //Used as a string...
        REQUIRE( variable.IsNumber() == false ); //...so consider as a string

        variable.SetString("MyString");
        REQUIRE( variable.GetValue() == 0 ); //Used as a number...
        REQUIRE( variable.IsNumber() == true ); //...so consider as a number
    }
    SECTION("Use with int and string like semantics") {
        gd::Variable variable;
        variable = 50;
        REQUIRE( variable.GetValue() == 50 );
        REQUIRE( variable.IsNumber() == true );

        variable = "MyString";
        REQUIRE( variable.GetString() == "MyString" );
        REQUIRE( variable.IsNumber() == false );

        variable = "MyRealStdString";
        REQUIRE( variable.GetString() == "MyRealStdString" );
        REQUIRE( variable.IsNumber() == false );
    }
}

TEST_CASE( "EventsList", "[common][events]" ) {
    SECTION("Basics") {
        gd::EventsList list;
        gd::EmptyEvent event1;
        std::shared_ptr<gd::BaseEvent> event2(new gd::EmptyEvent);
        list.InsertEvent(event1);
        list.InsertEvent(event2);
        REQUIRE( &list.GetEvent(0) != &event1 ); //First event inserted by copy
        REQUIRE( &list.GetEvent(1) == event2.get() ); //Second event not copied
    }

    SECTION("Subevents") {
        gd::EventsList list;
        gd::StandardEvent stdEvent;
        list.InsertEvent(stdEvent, 0);

        //Create a lots of nested events
        gd::BaseEvent * lastEvent = &list.GetEvent(0);
        gd::BaseEvent * oneOfTheSubEvent = NULL;
        for(unsigned int i=0;i<100;++i) {
            gd::StandardEvent subEvent;
            lastEvent = &lastEvent->GetSubEvents().InsertEvent(subEvent);
            if ( i == 60 ) oneOfTheSubEvent = lastEvent;
        }

        //Check if Contains method can find the specified sub event.
        REQUIRE(list.Contains(*oneOfTheSubEvent) == true);
        REQUIRE(list.Contains(*oneOfTheSubEvent, false) == false);
    }

    SECTION("Memory consumption") {
        size_t startMemory = gd::SystemStats::GetUsedVirtualMemory();

        gd::EventsList list;
        gd::StandardEvent stdEvent;
        list.InsertEvent(stdEvent, 0);

        //Create a lots of nested events
        gd::BaseEvent * lastEvent = &list.GetEvent(0);
        for(unsigned int i=0;i<2000;++i) {
            gd::StandardEvent subEvent;
            lastEvent = &lastEvent->GetSubEvents().InsertEvent(subEvent);
        }

        //Copy the result
        gd::EventsList copiedList = list;

        size_t endMemory = gd::SystemStats::GetUsedVirtualMemory();
        INFO("Memory used: " << endMemory-startMemory << "KB");
        REQUIRE(1500 >= endMemory-startMemory);
    }

}

TEST_CASE( "VersionWrapper", "[common]" ) {
    REQUIRE( gd::VersionWrapper::IsOlder(1,9,9,9,2,0,0,0) == true );
    REQUIRE( gd::VersionWrapper::IsOlder(2,0,0,0,1,9,9,9) == false );
    REQUIRE( gd::VersionWrapper::IsOlder(2,1,9,9,2,1,9,9) == false );
    REQUIRE( gd::VersionWrapper::IsOlder(2,1,9,9,2,2,0,0) == true );
    REQUIRE( gd::VersionWrapper::IsOlder(2,1,0,9,2,2,0,9) == true );
    REQUIRE( gd::VersionWrapper::IsOlder(2,1,0,9,2,1,1,0) == true );
    REQUIRE( gd::VersionWrapper::IsOlderOrEqual(2,1,9,9,2,1,9,9) == true );
}
