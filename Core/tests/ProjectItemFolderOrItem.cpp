/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering the folder structures used to organize the scenes,
 * external layouts, external events and tests.
 */
#include "GDCore/Project/ProjectItemFolderOrItem.h"

#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("ProjectItemFolderOrItem", "[common]") {
  SECTION("A new project has an empty root folder") {
    gd::Project project;
    auto& rootFolder = project.GetLayoutsRootFolder();

    REQUIRE(rootFolder.IsFolder());
    REQUIRE(rootFolder.IsRootFolder());
    REQUIRE(rootFolder.GetChildrenCount() == 0);
  }

  SECTION("Inserting a layout adds it to the root folder") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    auto& rootFolder = project.GetLayoutsRootFolder();
    REQUIRE(rootFolder.GetChildrenCount() == 2);
    REQUIRE(rootFolder.HasItemNamed("Scene1"));
    REQUIRE(rootFolder.HasItemNamed("Scene2"));
    REQUIRE(rootFolder.GetChildAt(0).GetItem().GetName() == "Scene1");
  }

  SECTION("Removing a layout removes it from the folder structure") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    rootFolder.MoveFolderOrItemToAnotherFolder(
        rootFolder.GetItemChild("Scene2"), folder, 0);
    REQUIRE(folder.HasItemNamed("Scene2"));

    project.RemoveLayout("Scene2");

    REQUIRE(!rootFolder.HasItemNamed("Scene2"));
    REQUIRE(folder.GetChildrenCount() == 0);
    REQUIRE(rootFolder.HasItemNamed("Scene1"));
  }

  SECTION("Layouts can be moved in and out of folders") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    REQUIRE(rootFolder.GetChildrenCount() == 3);

    auto& scene1Node = rootFolder.GetItemChild("Scene1");
    rootFolder.MoveFolderOrItemToAnotherFolder(scene1Node, folder, 0);

    REQUIRE(rootFolder.GetChildrenCount() == 2);
    REQUIRE(folder.GetChildrenCount() == 1);
    REQUIRE(folder.GetChildAt(0).GetItem().GetName() == "Scene1");
    // The recursive search still finds it.
    REQUIRE(rootFolder.HasItemNamed("Scene1"));
    REQUIRE(rootFolder.GetItemNamed("Scene1").GetItem().GetName() ==
            "Scene1");
  }

  SECTION("A folder can't be moved inside one of its own children") {
    gd::Project project;
    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& parentFolder = rootFolder.InsertNewFolder("Parent", 0);
    auto& childFolder = parentFolder.InsertNewFolder("Child", 0);

    rootFolder.MoveFolderOrItemToAnotherFolder(
        parentFolder, childFolder, 0);

    // Nothing moved.
    REQUIRE(rootFolder.GetChildrenCount() == 1);
    REQUIRE(childFolder.GetChildrenCount() == 0);
    REQUIRE(childFolder.IsADescendantOf(parentFolder));
  }

  SECTION("External layouts, external events and tests have folders") {
    gd::Project project;
    project.InsertNewExternalLayout("ExternalLayout1", 0);
    project.InsertNewExternalEvents("ExternalEvents1", 0);
    project.GetTests().InsertNewTest("Test1", 0);

    auto& externalLayoutsRootFolder = project.GetExternalLayoutsRootFolder();
    auto& externalEventsRootFolder = project.GetExternalEventsRootFolder();
    auto& testsRootFolder = project.GetTests().GetRootFolder();
    REQUIRE(externalLayoutsRootFolder.HasItemNamed("ExternalLayout1"));
    REQUIRE(externalEventsRootFolder.HasItemNamed("ExternalEvents1"));
    REQUIRE(testsRootFolder.HasItemNamed("Test1"));

    externalLayoutsRootFolder.MoveFolderOrItemToAnotherFolder(
        externalLayoutsRootFolder.GetItemChild("ExternalLayout1"),
        externalLayoutsRootFolder.InsertNewFolder("Folder", 0),
        0);
    externalEventsRootFolder.MoveFolderOrItemToAnotherFolder(
        externalEventsRootFolder.GetItemChild("ExternalEvents1"),
        externalEventsRootFolder.InsertNewFolder("Folder", 0),
        0);
    testsRootFolder.MoveFolderOrItemToAnotherFolder(
        testsRootFolder.GetItemChild("Test1"),
        testsRootFolder.InsertNewFolder("Folder", 0),
        0);

    gd::SerializerElement element;
    project.SerializeTo(element);
    gd::Project loadedProject;
    loadedProject.UnserializeFrom(element);

    REQUIRE(loadedProject.GetExternalLayoutsRootFolder()
                .GetChildAt(0)
                .GetChildAt(0)
                .GetItem()
                .GetName() == "ExternalLayout1");
    REQUIRE(loadedProject.GetExternalEventsRootFolder()
                .GetChildAt(0)
                .GetChildAt(0)
                .GetItem()
                .GetName() == "ExternalEvents1");
    REQUIRE(loadedProject.GetTests()
                .GetRootFolder()
                .GetChildAt(0)
                .GetChildAt(0)
                .GetItem()
                .GetName() == "Test1");

    loadedProject.RemoveExternalLayout("ExternalLayout1");
    loadedProject.RemoveExternalEvents("ExternalEvents1");
    loadedProject.GetTests().RemoveTest("Test1");
    REQUIRE(!loadedProject.GetExternalLayoutsRootFolder().HasItemNamed(
        "ExternalLayout1"));
    REQUIRE(!loadedProject.GetExternalEventsRootFolder().HasItemNamed(
        "ExternalEvents1"));
    REQUIRE(!loadedProject.GetTests().GetRootFolder().HasItemNamed("Test1"));
  }

  SECTION("The folder structure is saved and loaded") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);
    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    rootFolder.MoveFolderOrItemToAnotherFolder(
        rootFolder.GetItemChild("Scene1"), folder, 0);

    gd::SerializerElement element;
    project.SerializeTo(element);

    gd::Project loadedProject;
    loadedProject.UnserializeFrom(element);

    auto& loadedRootFolder = loadedProject.GetLayoutsRootFolder();
    REQUIRE(loadedRootFolder.GetChildrenCount() == 2);
    REQUIRE(loadedRootFolder.GetChildAt(0).IsFolder());
    REQUIRE(loadedRootFolder.GetChildAt(0).GetFolderName() == "MyFolder");
    REQUIRE(loadedRootFolder.GetChildAt(0).GetChildrenCount() == 1);
    REQUIRE(
        loadedRootFolder.GetChildAt(0).GetChildAt(0).GetItem().GetName() ==
        "Scene1");
    REQUIRE(loadedRootFolder.GetChildAt(1).GetItem().GetName() == "Scene2");
  }

  SECTION("Layouts missing from a saved folder structure are added back") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    gd::SerializerElement element;
    project.SerializeTo(element);

    // Simulate a project saved before the folder structure existed.
    element.RemoveChild("layoutsFolderStructure");

    gd::Project loadedProject;
    loadedProject.UnserializeFrom(element);

    auto& loadedRootFolder = loadedProject.GetLayoutsRootFolder();
    REQUIRE(loadedRootFolder.GetChildrenCount() == 2);
    REQUIRE(loadedRootFolder.HasItemNamed("Scene1"));
    REQUIRE(loadedRootFolder.HasItemNamed("Scene2"));
  }

  SECTION("The other folder structures are saved, loaded and rebuilt") {
    gd::Project project;
    project.InsertNewExternalLayout("ExternalLayout1", 0);
    project.InsertNewExternalEvents("ExternalEvents1", 0);
    project.GetTests().InsertNewTest("Test1", 0);
    project.GetExternalLayoutsRootFolder().InsertNewFolder("LayoutsFolder", 0);
    project.GetExternalEventsRootFolder().InsertNewFolder("EventsFolder", 0);
    project.GetTests().GetRootFolder().InsertNewFolder("TestsFolder", 0);

    gd::SerializerElement element;
    project.SerializeTo(element);

    gd::Project loadedProject;
    loadedProject.UnserializeFrom(element);
    REQUIRE(loadedProject.GetExternalLayoutsRootFolder().GetChildrenCount() ==
            2);
    REQUIRE(loadedProject.GetExternalLayoutsRootFolder()
                .GetChildAt(0)
                .GetFolderName() == "LayoutsFolder");
    REQUIRE(loadedProject.GetExternalEventsRootFolder()
                .GetChildAt(0)
                .GetFolderName() == "EventsFolder");
    REQUIRE(loadedProject.GetTests().GetRootFolder().GetChildAt(0)
                .GetFolderName() == "TestsFolder");
    REQUIRE(loadedProject.GetTests().GetRootFolder().HasItemNamed("Test1"));

    // Saved before the folder structures existed: every item is at the root.
    element.RemoveChild("externalLayoutsFolderStructure");
    element.RemoveChild("externalEventsFolderStructure");
    element.RemoveChild("testsFolderStructure");
    gd::Project oldProject;
    oldProject.UnserializeFrom(element);
    REQUIRE(oldProject.GetExternalLayoutsRootFolder().GetChildrenCount() == 1);
    REQUIRE(oldProject.GetExternalLayoutsRootFolder().HasItemNamed(
        "ExternalLayout1"));
    REQUIRE(oldProject.GetExternalEventsRootFolder().GetChildrenCount() == 1);
    REQUIRE(oldProject.GetExternalEventsRootFolder().HasItemNamed(
        "ExternalEvents1"));
    REQUIRE(oldProject.GetTests().GetRootFolder().GetChildrenCount() == 1);
    REQUIRE(oldProject.GetTests().GetRootFolder().HasItemNamed("Test1"));
  }

  SECTION("A copied project has all its layouts in the folder structure") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    gd::Project copiedProject = project;

    auto& copiedRootFolder = copiedProject.GetLayoutsRootFolder();
    REQUIRE(copiedRootFolder.GetChildrenCount() == 2);
    REQUIRE(copiedRootFolder.HasItemNamed("Scene1"));
    REQUIRE(copiedRootFolder.HasItemNamed("Scene2"));
    // The folders point to the layouts of the copy, not of the original.
    REQUIRE(&copiedRootFolder.GetItemNamed("Scene1").GetItem() ==
            &copiedProject.GetLayout("Scene1"));
  }
}
