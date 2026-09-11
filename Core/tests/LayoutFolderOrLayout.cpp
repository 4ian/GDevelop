/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering the folder structure used to organize the scenes.
 */
#include "GDCore/Project/LayoutFolderOrLayout.h"

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

TEST_CASE("LayoutFolderOrLayout", "[common]") {
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
    REQUIRE(rootFolder.HasLayoutNamed("Scene1"));
    REQUIRE(rootFolder.HasLayoutNamed("Scene2"));
    REQUIRE(rootFolder.GetChildAt(0).GetLayout().GetName() == "Scene1");
  }

  SECTION("Removing a layout removes it from the folder structure") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    rootFolder.MoveLayoutFolderOrLayoutToAnotherFolder(
        rootFolder.GetLayoutChild("Scene2"), folder, 0);
    REQUIRE(folder.HasLayoutNamed("Scene2"));

    project.RemoveLayout("Scene2");

    REQUIRE(!rootFolder.HasLayoutNamed("Scene2"));
    REQUIRE(folder.GetChildrenCount() == 0);
    REQUIRE(rootFolder.HasLayoutNamed("Scene1"));
  }

  SECTION("Layouts can be moved in and out of folders") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    REQUIRE(rootFolder.GetChildrenCount() == 3);

    auto& scene1Node = rootFolder.GetLayoutChild("Scene1");
    rootFolder.MoveLayoutFolderOrLayoutToAnotherFolder(scene1Node, folder, 0);

    REQUIRE(rootFolder.GetChildrenCount() == 2);
    REQUIRE(folder.GetChildrenCount() == 1);
    REQUIRE(folder.GetChildAt(0).GetLayout().GetName() == "Scene1");
    // The recursive search still finds it.
    REQUIRE(rootFolder.HasLayoutNamed("Scene1"));
    REQUIRE(rootFolder.GetLayoutNamed("Scene1").GetLayout().GetName() ==
            "Scene1");
  }

  SECTION("A folder can't be moved inside one of its own children") {
    gd::Project project;
    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& parentFolder = rootFolder.InsertNewFolder("Parent", 0);
    auto& childFolder = parentFolder.InsertNewFolder("Child", 0);

    rootFolder.MoveLayoutFolderOrLayoutToAnotherFolder(
        parentFolder, childFolder, 0);

    // Nothing moved.
    REQUIRE(rootFolder.GetChildrenCount() == 1);
    REQUIRE(childFolder.GetChildrenCount() == 0);
    REQUIRE(childFolder.IsADescendantOf(parentFolder));
  }

  SECTION("GetOrCreateFolderChild reuses an existing folder") {
    gd::Project project;
    auto& rootFolder = project.GetLayoutsRootFolder();

    auto& folder = rootFolder.GetOrCreateFolderChild("MyFolder");
    REQUIRE(rootFolder.GetChildrenCount() == 1);

    auto& sameFolder = rootFolder.GetOrCreateFolderChild("MyFolder");
    REQUIRE(&folder == &sameFolder);
    REQUIRE(rootFolder.GetChildrenCount() == 1);
  }

  SECTION("The folder structure is saved and loaded") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);
    auto& rootFolder = project.GetLayoutsRootFolder();
    auto& folder = rootFolder.InsertNewFolder("MyFolder", 0);
    rootFolder.MoveLayoutFolderOrLayoutToAnotherFolder(
        rootFolder.GetLayoutChild("Scene1"), folder, 0);

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
        loadedRootFolder.GetChildAt(0).GetChildAt(0).GetLayout().GetName() ==
        "Scene1");
    REQUIRE(loadedRootFolder.GetChildAt(1).GetLayout().GetName() == "Scene2");
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
    REQUIRE(loadedRootFolder.HasLayoutNamed("Scene1"));
    REQUIRE(loadedRootFolder.HasLayoutNamed("Scene2"));
  }

  SECTION("A copied project has all its layouts in the folder structure") {
    gd::Project project;
    project.InsertNewLayout("Scene1", 0);
    project.InsertNewLayout("Scene2", 1);

    gd::Project copiedProject = project;

    auto& copiedRootFolder = copiedProject.GetLayoutsRootFolder();
    REQUIRE(copiedRootFolder.GetChildrenCount() == 2);
    REQUIRE(copiedRootFolder.HasLayoutNamed("Scene1"));
    REQUIRE(copiedRootFolder.HasLayoutNamed("Scene2"));
    // The folders point to the layouts of the copy, not of the original.
    REQUIRE(&copiedRootFolder.GetLayoutNamed("Scene1").GetLayout() ==
            &copiedProject.GetLayout("Scene1"));
  }
}
