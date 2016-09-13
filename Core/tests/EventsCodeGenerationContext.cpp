/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering events of GDevelop Core.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include <memory>

TEST_CASE( "EventsCodeGenerationContext", "[common][events]" ) {
    /**
     * Generate a tree of contexts with declared objects as below:
     *                   c1 -> c1.object1, c1.object2, c1.empty1 (empty list request)
     *                  /  \
     *  c2.object1 <- c2   c3 -> c3.object1, c1.object2
     *               /  \
     *              c4  c5 -> c5.object1, c5.empty1 (empty list request), c1.object2
     */

    unsigned int maxDepth = 0;
    gd::EventsCodeGenerationContext c1(&maxDepth);
    c1.ObjectsListNeeded("c1.object1");
    c1.ObjectsListNeeded("c1.object2");
    c1.EmptyObjectsListNeeded("c1.empty1");

    gd::EventsCodeGenerationContext c2;
    c2.InheritsFrom(c1);
    c2.ObjectsListNeeded("c2.object1");

    gd::EventsCodeGenerationContext c3;
    c3.InheritsFrom(c1);
    c3.ObjectsListNeeded("c3.object1");
    c3.ObjectsListNeeded("c1.object2");

    gd::EventsCodeGenerationContext c4;
    c4.InheritsFrom(c2);

    gd::EventsCodeGenerationContext c5;
    c5.InheritsFrom(c2);
    c5.EmptyObjectsListNeeded("c5.empty1");
    c5.ObjectsListNeeded("c5.object1");
    c5.ObjectsListNeeded("c1.object2");

    SECTION("Parenting") {
        REQUIRE( c2.GetParentContext() == &c1 );
        REQUIRE( c3.GetParentContext() == &c1 );
        REQUIRE( c4.GetParentContext() == &c2 );
        REQUIRE( c5.GetParentContext() == &c2 );
    }

    SECTION("Depth") {
        REQUIRE( maxDepth == 2 );

        REQUIRE( c1.GetContextDepth() == 0 );
        REQUIRE( c2.GetContextDepth() == 1 );
        REQUIRE( c3.GetContextDepth() == 1 );
        REQUIRE( c4.GetContextDepth() == 2 );
        REQUIRE( c5.GetContextDepth() == 2 );
    }

    SECTION("Object list needed") {
        REQUIRE( c1.GetObjectsListsAlreadyDeclared() == std::set<gd::String>() );
        REQUIRE( c1.GetObjectsListsToBeDeclared() == std::set<gd::String>({"c1.object1", "c1.object2"}) );
        REQUIRE( c1.GetObjectsListsToBeDeclaredEmpty() == std::set<gd::String>({"c1.empty1"}) );
        REQUIRE( c1.GetAllObjectsToBeDeclared() == std::set<gd::String>({"c1.object1", "c1.object2", "c1.empty1"}) );

        REQUIRE( c2.GetObjectsListsAlreadyDeclared() == std::set<gd::String>({"c1.object1", "c1.object2", "c1.empty1"}) );
        REQUIRE( c2.GetObjectsListsToBeDeclared() == std::set<gd::String>({"c2.object1"}) );
        REQUIRE( c2.GetObjectsListsToBeDeclaredEmpty() == std::set<gd::String>() );
        REQUIRE( c2.GetAllObjectsToBeDeclared() == std::set<gd::String>({"c2.object1"}) );

        REQUIRE( c3.GetObjectsListsAlreadyDeclared() == std::set<gd::String>({"c1.object1", "c1.object2", "c1.empty1"}) );
        REQUIRE( c3.GetObjectsListsToBeDeclared() == std::set<gd::String>({"c3.object1", "c1.object2"}) );
        REQUIRE( c3.GetObjectsListsToBeDeclaredEmpty() == std::set<gd::String>() );
        REQUIRE( c3.GetAllObjectsToBeDeclared() == std::set<gd::String>({"c3.object1", "c1.object2"}) );

        REQUIRE( c5.GetObjectsListsAlreadyDeclared() == std::set<gd::String>({"c1.object1", "c1.object2", "c1.empty1", "c2.object1"}) );
        REQUIRE( c5.GetObjectsListsToBeDeclared() == std::set<gd::String>({"c5.object1", "c1.object2"}) );
        REQUIRE( c5.GetObjectsListsToBeDeclaredEmpty() == std::set<gd::String>({"c5.empty1"}) );
        REQUIRE( c5.GetAllObjectsToBeDeclared() == std::set<gd::String>({"c5.object1", "c5.empty1", "c1.object2"}) );
    }

    SECTION("ObjectAlreadyDeclared") {
        REQUIRE( c1.ObjectAlreadyDeclared("c1.object1") == false );
        REQUIRE( c2.ObjectAlreadyDeclared("c1.object1") == true );
        REQUIRE( c3.ObjectAlreadyDeclared("c1.object1") == true );
        REQUIRE( c4.ObjectAlreadyDeclared("c1.object1") == true );
        REQUIRE( c5.ObjectAlreadyDeclared("c1.object1") == true );

        REQUIRE( c2.ObjectAlreadyDeclared("c2.object1") == false );
        REQUIRE( c1.ObjectAlreadyDeclared("c2.object1") == false );
        REQUIRE( c3.ObjectAlreadyDeclared("c2.object1") == false );
        REQUIRE( c4.ObjectAlreadyDeclared("c2.object1") == true );
        REQUIRE( c5.ObjectAlreadyDeclared("c2.object1") == true );

        REQUIRE( c3.ObjectAlreadyDeclared("some object") == false );
        c3.SetObjectDeclared("some object");
        REQUIRE( c3.ObjectAlreadyDeclared("some object") == true );
    }

    SECTION("Object list last depth") {
        REQUIRE( c1.GetLastDepthObjectListWasNeeded("c1.object1") == 0 );
        REQUIRE( c2.GetLastDepthObjectListWasNeeded("c2.object1") == 1 );
        REQUIRE( c3.GetLastDepthObjectListWasNeeded("c3.object1") == 1 );
        REQUIRE( c4.GetLastDepthObjectListWasNeeded("c2.object1") == 1 );
        REQUIRE( c5.GetLastDepthObjectListWasNeeded("c1.object2") == 2 );
        REQUIRE( c5.GetLastDepthObjectListWasNeeded("c2.object1") == 1 );
        REQUIRE( c5.GetLastDepthObjectListWasNeeded("c5.object1") == 2 );
    }

    SECTION("SetCurrentObject") {
        REQUIRE( c3.GetCurrentObject() == "" );
        c3.SetCurrentObject("current object");
        REQUIRE( c3.GetCurrentObject() == "current object" );
        c3.SetNoCurrentObject();
        REQUIRE( c3.GetCurrentObject() == "" );
    }
}
