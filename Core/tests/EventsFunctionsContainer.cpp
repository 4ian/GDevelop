/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/Project.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("EventsFunctionsContainer", "[common]") {
  SECTION("Sanity checks") {
    gd::EventsFunctionsContainer eventsFunctionContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer.InsertNewEventsFunction("Function1", 0);
    eventsFunctionContainer.InsertNewEventsFunction("Function2", 1);
    eventsFunctionContainer.InsertNewEventsFunction("Function3", 2);

    // Check that copy operator is working
    gd::EventsFunctionsContainer eventsFunctionContainer2 =
        eventsFunctionContainer;
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

    // Check that the copy has not somehow shared the same pointers
    // to the events functions.
    eventsFunctionContainer.GetEventsFunction(1).SetName("Function2.x");
    eventsFunctionContainer2.GetEventsFunction(0).SetName("Function1.y");
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(2).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionContainer.GetOwner() ==
            gd::EventsFunctionsContainer::FunctionOwner::Extension);
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

    // Check removal
    eventsFunctionContainer.RemoveEventsFunction("Function3");
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 2);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function2.x");
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1.y");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");
  }
  SECTION("Serialization") {
    gd::Project project;
    gd::EventsFunctionsContainer eventsFunctionContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer.InsertNewEventsFunction("Function1", 0);
    eventsFunctionContainer.InsertNewEventsFunction("Function2", 1);
    eventsFunctionContainer.InsertNewEventsFunction("Function3", 2);

    gd::SerializerElement element;
    eventsFunctionContainer.SerializeEventsFunctionsTo(element);

    eventsFunctionContainer.RemoveEventsFunction("Function2");

    gd::EventsFunctionsContainer eventsFunctionContainer2(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer2.UnserializeEventsFunctionsFrom(project, element);
    REQUIRE(eventsFunctionContainer.GetEventsFunctionsCount() == 2);
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(1).GetName() ==
            "Function3");
    REQUIRE(eventsFunctionContainer2.GetEventsFunctionsCount() == 3);
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(0).GetName() ==
            "Function1");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(1).GetName() ==
            "Function2");
    REQUIRE(eventsFunctionContainer2.GetEventsFunction(2).GetName() ==
            "Function3");

  }
  SECTION("Functions missing from the folders are added in their group folders") {
    gd::EventsFunctionsContainer eventsFunctionContainer(
        gd::EventsFunctionsContainer::FunctionOwner::Extension);
    eventsFunctionContainer.InsertNewEventsFunction("Function1", 0);
    eventsFunctionContainer.InsertNewEventsFunction("Function2", 1);
    eventsFunctionContainer.InsertNewEventsFunction("Function3", 2);

    // Forget the folders, like when a serialized folder structure is missing
    // some functions.
    eventsFunctionContainer.GetRootFolder().Clear();
    eventsFunctionContainer.GetEventsFunction(0).SetGroup("Folder/Sub-folder");
    eventsFunctionContainer.GetEventsFunction(1).SetGroup("Folder");
    eventsFunctionContainer.AddMissingFunctionsInRootFolder();

    auto &rootFolder = eventsFunctionContainer.GetRootFolder();
    REQUIRE(rootFolder.GetChildrenCount() == 2);
    auto &folder = rootFolder.GetChildAt(0);
    REQUIRE(folder.GetFolderName() == "Folder");
    REQUIRE(folder.GetChildrenCount() == 2);
    auto &subFolder = folder.GetChildAt(0);
    REQUIRE(subFolder.GetFolderName() == "Sub-folder");
    REQUIRE(subFolder.GetChildrenCount() == 1);
    REQUIRE(subFolder.GetChildAt(0).GetFunction().GetName() == "Function1");
    REQUIRE(folder.GetChildAt(1).GetFunction().GetName() == "Function2");
    REQUIRE(rootFolder.GetChildAt(1).GetFunction().GetName() == "Function3");
    REQUIRE(eventsFunctionContainer.GetEventsFunction(0).GetGroup() ==
            "Folder/Sub-folder");
  }
}
