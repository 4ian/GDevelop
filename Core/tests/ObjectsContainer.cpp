/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering gd::ObjectsContainer, in particular the lookup of
 * objects by name, which must stay correct whatever the way objects are
 * added, removed, moved or renamed.
 */
#include "GDCore/Project/ObjectsContainer.h"

#include <memory>

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

namespace {
gd::Object &InsertObject(gd::Project &project,
                         gd::ObjectsContainer &objectsContainer,
                         const gd::String &name) {
  return objectsContainer.InsertNewObject(
      project, "MyExtension::Sprite", name,
      objectsContainer.GetObjectsCount());
}
}  // namespace

TEST_CASE("ObjectsContainer", "[common]") {
  gd::Platform platform;
  gd::Project project;
  SetupProjectWithDummyPlatform(project, platform);
  gd::ObjectsContainer objectsContainer(gd::ObjectsContainer::Scene);

  SECTION("Objects can be found by name once inserted") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    gd::Object &object2 = InsertObject(project, objectsContainer, "Object2");

    REQUIRE(objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(objectsContainer.HasObjectNamed("Object2"));
    REQUIRE(!objectsContainer.HasObjectNamed("Object3"));
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);
    REQUIRE(&objectsContainer.GetObject("Object2") == &object2);

    // Insertion after a lookup is also found.
    gd::Object &object3 = InsertObject(project, objectsContainer, "Object3");
    REQUIRE(objectsContainer.HasObjectNamed("Object3"));
    REQUIRE(&objectsContainer.GetObject("Object3") == &object3);

    // Lookups on a const container work too.
    const gd::ObjectsContainer &constObjectsContainer = objectsContainer;
    REQUIRE(constObjectsContainer.HasObjectNamed("Object2"));
    REQUIRE(&constObjectsContainer.GetObject("Object2") == &object2);
  }

  SECTION("Objects renamed directly with gd::Object::SetName are found") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    gd::Object &object2 = InsertObject(project, objectsContainer, "Object2");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    object1.SetName("RenamedObject1");
    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(objectsContainer.HasObjectNamed("RenamedObject1"));
    REQUIRE(&objectsContainer.GetObject("RenamedObject1") == &object1);

    // Swap names between two objects.
    object2.SetName("Object1");
    object1.SetName("Object2");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object2);
    REQUIRE(&objectsContainer.GetObject("Object2") == &object1);
    REQUIRE(!objectsContainer.HasObjectNamed("RenamedObject1"));
  }

  SECTION("Objects renamed by unserialization are found") {
    gd::Object &object = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    gd::SerializerElement element;
    object.SerializeTo(element);
    element.SetAttribute("name", "RenamedObject1");
    object.UnserializeFrom(project, element);

    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(&objectsContainer.GetObject("RenamedObject1") == &object);
  }

  SECTION("Objects renamed by copy-assignment are found") {
    gd::Object &object = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    object = *project.CreateObject("MyExtension::Sprite", "RenamedObject1");

    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(&objectsContainer.GetObject("RenamedObject1") == &object);
  }

  SECTION("Removed objects are not found anymore") {
    InsertObject(project, objectsContainer, "Object1");
    InsertObject(project, objectsContainer, "Object2");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    objectsContainer.RemoveObject("Object1");
    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(objectsContainer.HasObjectNamed("Object2"));

    // Re-adding an object with the same name gives the new object.
    gd::Object &newObject1 = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(&objectsContainer.GetObject("Object1") == &newObject1);

    objectsContainer.Clear();
    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(!objectsContainer.HasObjectNamed("Object2"));
  }

  SECTION("Objects inserted by copy or in a folder are found") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    gd::Object &object2 = objectsContainer.InsertNewObjectInFolder(
        project, "MyExtension::Sprite", "Object2",
        objectsContainer.GetRootFolder(), 0);
    REQUIRE(&objectsContainer.GetObject("Object2") == &object2);

    std::unique_ptr<gd::Object> otherObject =
        project.CreateObject("MyExtension::Sprite", "Object3");
    gd::Object &object3 = objectsContainer.InsertObject(*otherObject, 0);
    REQUIRE(&objectsContainer.GetObject("Object3") == &object3);
    REQUIRE(&object3 != otherObject.get());
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);
  }

  SECTION("Moved objects are still found") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    gd::Object &object2 = InsertObject(project, objectsContainer, "Object2");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    objectsContainer.MoveObject(0, 1);
    REQUIRE(&objectsContainer.GetObject(0) == &object2);
    REQUIRE(&objectsContainer.GetObject(1) == &object1);
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);
    REQUIRE(&objectsContainer.GetObject("Object2") == &object2);
    REQUIRE(objectsContainer.GetObjectPosition("Object1") == 1);
  }

  SECTION("Objects moved to another container are found in it only") {
    gd::Object &object = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    gd::ObjectsContainer otherObjectsContainer(gd::ObjectsContainer::Scene);
    REQUIRE(!otherObjectsContainer.HasObjectNamed("Object1"));

    objectsContainer.MoveObjectFolderOrObjectToAnotherContainerInFolder(
        objectsContainer.GetRootFolder().GetObjectChild("Object1"),
        otherObjectsContainer, otherObjectsContainer.GetRootFolder(), 0);

    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(&otherObjectsContainer.GetObject("Object1") == &object);
  }

  SECTION("Copied containers have their own objects") {
    gd::Object &object = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    gd::ObjectsContainer copiedObjectsContainer(objectsContainer);
    REQUIRE(copiedObjectsContainer.HasObjectNamed("Object1"));
    REQUIRE(&copiedObjectsContainer.GetObject("Object1") != &object);

    gd::ObjectsContainer assignedObjectsContainer(gd::ObjectsContainer::Global);
    InsertObject(project, assignedObjectsContainer, "Object2");
    REQUIRE(assignedObjectsContainer.HasObjectNamed("Object2"));
    assignedObjectsContainer = objectsContainer;
    REQUIRE(!assignedObjectsContainer.HasObjectNamed("Object2"));
    REQUIRE(assignedObjectsContainer.HasObjectNamed("Object1"));
    REQUIRE(&assignedObjectsContainer.GetObject("Object1") != &object);

    // Renaming in a copy does not affect the original.
    copiedObjectsContainer.GetObject("Object1").SetName("RenamedObject1");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object);
    REQUIRE(!objectsContainer.HasObjectNamed("RenamedObject1"));
    REQUIRE(copiedObjectsContainer.HasObjectNamed("RenamedObject1"));
  }

  SECTION("Unserialized objects are found") {
    InsertObject(project, objectsContainer, "Object1");
    REQUIRE(objectsContainer.HasObjectNamed("Object1"));

    gd::SerializerElement element;
    objectsContainer.SerializeObjectsTo(element);
    element.GetChild(0).SetAttribute("name", "Object2");

    objectsContainer.UnserializeObjectsFrom(project, element);
    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(objectsContainer.HasObjectNamed("Object2"));
    REQUIRE(&objectsContainer.GetObject("Object2") ==
            &objectsContainer.GetObject(0));
  }

  SECTION("Empty container and empty names") {
    REQUIRE(!objectsContainer.HasObjectNamed("Object1"));
    REQUIRE(!objectsContainer.HasObjectNamed(""));

    InsertObject(project, objectsContainer, "Object1");
    REQUIRE(!objectsContainer.HasObjectNamed(""));

    gd::Object &unnamedObject = InsertObject(project, objectsContainer, "");
    REQUIRE(&objectsContainer.GetObject("") == &unnamedObject);
  }

  SECTION("Names with non-ASCII characters") {
    gd::Object &object = InsertObject(project, objectsContainer, "Objet_é_日本");
    REQUIRE(objectsContainer.HasObjectNamed("Objet_é_日本"));
    REQUIRE(&objectsContainer.GetObject("Objet_é_日本") == &object);
    REQUIRE(!objectsContainer.HasObjectNamed("Objet_e_日本"));

    object.SetName("Objet_è_日本");
    REQUIRE(!objectsContainer.HasObjectNamed("Objet_é_日本"));
    REQUIRE(&objectsContainer.GetObject("Objet_è_日本") == &object);
  }

  SECTION("References stay valid while other objects are changed") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    const gd::Object *found = &objectsContainer.GetObject("Object1");
    REQUIRE(found == &object1);

    // Enough insertions to force reallocations of the underlying vector.
    for (int i = 0; i < 100; ++i) {
      InsertObject(project, objectsContainer, "Other" + gd::String::From(i));
    }
    objectsContainer.RemoveObject("Other3");
    objectsContainer.MoveObject(0, 50);
    objectsContainer.GetObject("Other4").SetName("RenamedOther4");

    REQUIRE(&objectsContainer.GetObject("Object1") == found);
    REQUIRE(&objectsContainer.GetObject("Other99") ==
            &objectsContainer.GetObject(objectsContainer.GetObjectsCount() - 1));
    REQUIRE(!objectsContainer.HasObjectNamed("Other3"));
    REQUIRE(!objectsContainer.HasObjectNamed("Other4"));
    REQUIRE(objectsContainer.HasObjectNamed("RenamedOther4"));
  }

  SECTION("Duplicated object renamed afterwards (as done by the IDE)") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);

    // The IDE inserts a copy (which has the same name), then renames it.
    gd::Object &duplicatedObject =
        objectsContainer.InsertObject(objectsContainer.GetObject("Object1"), 0);
    REQUIRE(&objectsContainer.GetObject("Object1") == &duplicatedObject);

    duplicatedObject.SetName("Object1Copy");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);
    REQUIRE(&objectsContainer.GetObject("Object1Copy") == &duplicatedObject);
  }

  SECTION("A copied container outlives the original") {
    std::unique_ptr<gd::ObjectsContainer> copiedObjectsContainer;
    gd::ObjectsContainer assignedObjectsContainer(gd::ObjectsContainer::Global);
    InsertObject(project, assignedObjectsContainer, "OldObject");
    REQUIRE(assignedObjectsContainer.HasObjectNamed("OldObject"));
    {
      gd::ObjectsContainer originalObjectsContainer(
          gd::ObjectsContainer::Scene);
      InsertObject(project, originalObjectsContainer, "Object1");
      // Build the index of the original before copying it.
      REQUIRE(originalObjectsContainer.HasObjectNamed("Object1"));

      copiedObjectsContainer.reset(
          new gd::ObjectsContainer(originalObjectsContainer));
      assignedObjectsContainer = originalObjectsContainer;
    }

    REQUIRE(copiedObjectsContainer->HasObjectNamed("Object1"));
    REQUIRE(&copiedObjectsContainer->GetObject("Object1") ==
            &copiedObjectsContainer->GetObject(0));
    REQUIRE(!assignedObjectsContainer.HasObjectNamed("OldObject"));
    REQUIRE(&assignedObjectsContainer.GetObject("Object1") ==
            &assignedObjectsContainer.GetObject(0));
  }

  SECTION("Lookups through an ObjectsContainersList follow renames") {
    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &globalObject =
        InsertObject(project, project.GetObjects(), "GlobalObject");
    gd::Object &sceneObject =
        InsertObject(project, layout.GetObjects(), "SceneObject");
    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);
    // The variables container identifies which object was found.
    auto findVariables = [&](const gd::String &name) {
      return objectsContainersList.GetObjectOrGroupVariablesContainer(name);
    };

    REQUIRE(findVariables("GlobalObject") == &globalObject.GetVariables());
    REQUIRE(findVariables("SceneObject") == &sceneObject.GetVariables());
    REQUIRE(findVariables("UnknownObject") == nullptr);
    REQUIRE(!objectsContainersList.HasObjectNamed("UnknownObject"));

    sceneObject.SetName("RenamedSceneObject");
    globalObject.SetName("SceneObject");
    REQUIRE(!objectsContainersList.HasObjectNamed("GlobalObject"));
    REQUIRE(findVariables("RenamedSceneObject") == &sceneObject.GetVariables());
    REQUIRE(findVariables("SceneObject") == &globalObject.GetVariables());

    layout.GetObjects().RemoveObject("RenamedSceneObject");
    REQUIRE(!objectsContainersList.HasObjectNamed("RenamedSceneObject"));
    REQUIRE(findVariables("RenamedSceneObject") == nullptr);
  }

  SECTION("The first object wins when two objects have the same name") {
    gd::Object &object1 = InsertObject(project, objectsContainer, "Object1");
    gd::Object &object2 = InsertObject(project, objectsContainer, "Object2");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);

    object2.SetName("Object1");
    REQUIRE(&objectsContainer.GetObject("Object1") == &object1);

    objectsContainer.MoveObject(1, 0);
    REQUIRE(&objectsContainer.GetObject("Object1") == &object2);
  }
}
