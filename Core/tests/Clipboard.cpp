/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
/**
 * @file Tests covering the clipboard provided by GDCore.
 */
#include "catch.hpp"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/IDE/Clipboard.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Builtin/StandardEvent.h"

TEST_CASE( "Clipboard", "[common][ide]" ) {
	gd::Clipboard & clipboard = *gd::Clipboard::Get();
	REQUIRE(clipboard.HasExternalEvents() == false);
	REQUIRE(clipboard.HasExternalLayout() == false);
	REQUIRE(clipboard.HasLayout() == false);
	REQUIRE(clipboard.HasObject() == false);
	REQUIRE(clipboard.HasEvents() == false);

    SECTION("Is a singleton") {
    	REQUIRE(&clipboard == gd::Clipboard::Get());
    }
    SECTION("Properly store objects") {
    	gd::ExternalEvents ev;
    	ev.SetName("MyExternalEvents");
    	clipboard.SetExternalEvents(ev);
    	REQUIRE(clipboard.HasExternalEvents() == true);
    	REQUIRE(clipboard.GetExternalEvents().GetName() == "MyExternalEvents");

    	gd::ExternalLayout el;
    	el.SetName("MyExternalLayout");
    	clipboard.SetExternalLayout(el);
    	REQUIRE(clipboard.HasExternalLayout() == true);
    	REQUIRE(clipboard.GetExternalLayout().GetName() == "MyExternalLayout");

    	gd::EventsList eList;
    	gd::StandardEvent evt;
    	eList.InsertEvent(evt);
    	eList.InsertEvent(evt);
    	clipboard.SetEvents(eList);
    	REQUIRE(clipboard.HasEvents() == true);
    	REQUIRE(clipboard.GetEvents().GetEventsCount() == 2);
    }
}
