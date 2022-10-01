/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

// TODO: Add some tests on layouts and behavior shared data.

TEST_CASE("Project", "[common]") {
  SECTION("Basics") {
    gd::Project project;
    project.SetName("myname");
    REQUIRE(project.GetName() == "myname");
  }
}
TEST_CASE("EventsList", "[common][events]") {
  SECTION("Basics") {
    gd::EventsList list;
    gd::EmptyEvent event1;
    std::shared_ptr<gd::BaseEvent> event2(new gd::EmptyEvent);
    list.InsertEvent(event1);
    list.InsertEvent(event2);
    REQUIRE(&list.GetEvent(0) != &event1);       // First event inserted by copy
    REQUIRE(&list.GetEvent(1) == event2.get());  // Second event not copied
  }

  SECTION("Subevents") {
    gd::EventsList list;
    gd::StandardEvent stdEvent;
    list.InsertEvent(stdEvent, 0);

    // Create a lots of nested events
    gd::BaseEvent* lastEvent = &list.GetEvent(0);
    gd::BaseEvent* oneOfTheSubEvent = NULL;
    for (unsigned int i = 0; i < 100; ++i) {
      gd::StandardEvent subEvent;
      lastEvent = &lastEvent->GetSubEvents().InsertEvent(subEvent);
      if (i == 60) oneOfTheSubEvent = lastEvent;
    }

    // Check if Contains method can find the specified sub event.
    REQUIRE(list.Contains(*oneOfTheSubEvent) == true);
    REQUIRE(list.Contains(*oneOfTheSubEvent, false) == false);
  }

  SECTION("Memory consumption") {
    size_t startMemory = gd::SystemStats::GetUsedVirtualMemory();

    gd::EventsList list;
    gd::StandardEvent stdEvent;
    list.InsertEvent(stdEvent, 0);

    // Create a lots of nested events
    gd::BaseEvent* lastEvent = &list.GetEvent(0);
    for (unsigned int i = 0; i < 2000; ++i) {
      gd::StandardEvent subEvent;
      lastEvent = &lastEvent->GetSubEvents().InsertEvent(subEvent);
    }

    // Copy the result
    gd::EventsList copiedList = list;

    size_t endMemory = gd::SystemStats::GetUsedVirtualMemory();
    INFO("Memory used: " << endMemory - startMemory << "KB");
    #if defined(WINDOWS)
      REQUIRE(3000 >= endMemory - startMemory);
    #else
      REQUIRE(1500 >= endMemory - startMemory);
    #endif
  }
}

TEST_CASE("VersionWrapper", "[common]") {
  REQUIRE(gd::VersionWrapper::IsOlder(1, 9, 9, 9, 2, 0, 0, 0) == true);
  REQUIRE(gd::VersionWrapper::IsOlder(2, 0, 0, 0, 1, 9, 9, 9) == false);
  REQUIRE(gd::VersionWrapper::IsOlder(2, 1, 9, 9, 2, 1, 9, 9) == false);
  REQUIRE(gd::VersionWrapper::IsOlder(2, 1, 9, 9, 2, 2, 0, 0) == true);
  REQUIRE(gd::VersionWrapper::IsOlder(2, 1, 0, 9, 2, 2, 0, 9) == true);
  REQUIRE(gd::VersionWrapper::IsOlder(2, 1, 0, 9, 2, 1, 1, 0) == true);
  REQUIRE(gd::VersionWrapper::IsOlderOrEqual(2, 1, 9, 9, 2, 1, 9, 9) == true);
}
