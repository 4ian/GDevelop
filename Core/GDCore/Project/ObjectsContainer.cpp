/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectsContainer.h"

#include <algorithm>

#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/FolderOrItem.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/PolymorphicClone.h"

namespace gd {

static auto GetObjectName = [](const gd::Object& obj) { return obj.GetName(); };

ObjectsContainer::ObjectsContainer(
    const ObjectsContainer::SourceType sourceType_)
    : sourceType(sourceType_) {
  rootFolder = gd::make_unique<gd::FolderOrItem<gd::Object>>("__ROOT");
}

ObjectsContainer::~ObjectsContainer() {}

ObjectsContainer::ObjectsContainer(const ObjectsContainer& other) {
  Init(other);
}

ObjectsContainer& ObjectsContainer::operator=(const ObjectsContainer& other) {
  if (this != &other) Init(other);

  return *this;
}

void ObjectsContainer::Init(const gd::ObjectsContainer& other) {
  sourceType = other.sourceType;
  initialObjects = gd::Clone(other.initialObjects);
  objectGroups = other.objectGroups;
  rootFolder = gd::make_unique<gd::FolderOrItem<gd::Object>>("__ROOT");
}

void ObjectsContainer::SerializeObjectsTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("object");
  for (std::size_t j = 0; j < initialObjects.size(); j++) {
    initialObjects[j]->SerializeTo(element.AddChild("object"));
  }
}

void ObjectsContainer::SerializeFoldersTo(SerializerElement& element) const {
  rootFolder->SerializeTo(element, GetObjectName);
}

void ObjectsContainer::UnserializeFoldersFrom(
    gd::Project& project, const SerializerElement& element) {
  rootFolder->UnserializeFrom(
      project,
      element,
      *this,
      [](ObjectsContainer& container, const gd::String& name) -> gd::Object* {
        if (container.HasObjectNamed(name)) {
          return &container.GetObject(name);
        }
        gd::LogError("Object with name " + name + " not found.");
        return nullptr;
      });
}

void ObjectsContainer::AddMissingObjectsInRootFolder() {
  for (std::size_t i = 0; i < initialObjects.size(); ++i) {
    const gd::String& objectName = initialObjects[i]->GetName();

    if (!rootFolder->HasItemNamed(objectName, GetObjectName)) {
      rootFolder->InsertItem(&(*initialObjects[i]));
    }
  }
}

void ObjectsContainer::UnserializeObjectsFrom(
    gd::Project& project, const SerializerElement& element) {
  Clear();
  element.ConsiderAsArrayOf("object", "Objet");

  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    const SerializerElement& objectElement = element.GetChild(i);

    gd::String type = objectElement.GetStringAttribute("type");
    gd::String name = objectElement.GetStringAttribute("name", "", "nom");

    std::unique_ptr<gd::Object> newObject = project.CreateObject(type, name);

    if (newObject) {
      newObject->UnserializeFrom(project, objectElement);
      initialObjects.push_back(std::move(newObject));
    }
  }
}

bool ObjectsContainer::HasObjectNamed(const gd::String& name) const {
  return (find_if(initialObjects.begin(),
                  initialObjects.end(),
                  [&](const std::unique_ptr<gd::Object>& object) {
                    return object->GetName() == name;
                  }) != initialObjects.end());
}

gd::Object& ObjectsContainer::GetObject(const gd::String& name) {
  return *(*find_if(initialObjects.begin(),
                    initialObjects.end(),
                    [&](const std::unique_ptr<gd::Object>& object) {
                      return object->GetName() == name;
                    }));
}

const gd::Object& ObjectsContainer::GetObject(const gd::String& name) const {
  return *(*find_if(initialObjects.begin(),
                    initialObjects.end(),
                    [&](const std::unique_ptr<gd::Object>& object) {
                      return object->GetName() == name;
                    }));
}

gd::Object& ObjectsContainer::GetObject(std::size_t index) {
  return *initialObjects[index];
}

const gd::Object& ObjectsContainer::GetObject(std::size_t index) const {
  return *initialObjects[index];
}

std::size_t ObjectsContainer::GetObjectPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < initialObjects.size(); ++i) {
    if (initialObjects[i]->GetName() == name) return i;
  }
  return gd::String::npos;
}

std::size_t ObjectsContainer::GetObjectsCount() const {
  return initialObjects.size();
}

gd::Object& ObjectsContainer::InsertNewObject(const gd::Project& project,
                                              const gd::String& objectType,
                                              const gd::String& name,
                                              std::size_t position) {
  gd::Object& newlyCreatedObject = *(*(initialObjects.insert(
      position < initialObjects.size() ? initialObjects.begin() + position
                                       : initialObjects.end(),
      project.CreateObject(objectType, name))));

  rootFolder->InsertItem(&newlyCreatedObject);

  return newlyCreatedObject;
}

gd::Object& ObjectsContainer::InsertNewObjectInFolder(
    const gd::Project& project,
    const gd::String& objectType,
    const gd::String& name,
    gd::FolderOrItem<gd::Object>& folderOrItem,
    std::size_t position) {
  gd::Object& newlyCreatedObject = *(*(initialObjects.insert(
      initialObjects.end(), project.CreateObject(objectType, name))));

  folderOrItem.InsertItem(&newlyCreatedObject, position);

  return newlyCreatedObject;
}

gd::Object& ObjectsContainer::InsertObject(const gd::Object& object,
                                           std::size_t position) {
  gd::Object& newlyCreatedObject = *(*(initialObjects.insert(
      position < initialObjects.size() ? initialObjects.begin() + position
                                       : initialObjects.end(),
      std::unique_ptr<gd::Object>(object.Clone()))));

  return newlyCreatedObject;
}

void ObjectsContainer::MoveObject(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= initialObjects.size() || newIndex >= initialObjects.size())
    return;

  std::unique_ptr<gd::Object> object = std::move(initialObjects[oldIndex]);
  initialObjects.erase(initialObjects.begin() + oldIndex);
  initialObjects.insert(initialObjects.begin() + newIndex, std::move(object));
}

void ObjectsContainer::RemoveObject(const gd::String& name) {
  std::vector<std::unique_ptr<gd::Object>>::iterator objectIt =
      find_if(initialObjects.begin(),
              initialObjects.end(),
              [&](const std::unique_ptr<gd::Object>& object) {
                return object->GetName() == name;
              });
  if (objectIt == initialObjects.end()) return;

  rootFolder->RemoveRecursivelyItemNamed(name, GetObjectName);

  initialObjects.erase(objectIt);
}

void ObjectsContainer::Clear() {
  rootFolder->Clear();
  initialObjects.clear();
}

void ObjectsContainer::MoveObjectFolderOrObjectToAnotherContainerInFolder(
    gd::FolderOrItem<gd::Object>& folderOrItem,
    gd::ObjectsContainer& newContainer,
    gd::FolderOrItem<gd::Object>& newParentFolder,
    std::size_t newPosition) {
  if (folderOrItem.IsFolder() || !newParentFolder.IsFolder()) return;

  std::vector<std::unique_ptr<gd::Object>>::iterator objectIt =
      find_if(initialObjects.begin(),
              initialObjects.end(),
              [&folderOrItem](std::unique_ptr<gd::Object>& object) {
                return object->GetName() == folderOrItem.GetItem().GetName();
              });
  if (objectIt == initialObjects.end()) return;

  std::unique_ptr<gd::Object> object = std::move(*objectIt);
  initialObjects.erase(objectIt);

  newContainer.initialObjects.push_back(std::move(object));

  folderOrItem.GetParent().MoveFolderOrItemToAnotherFolder(
      folderOrItem, newParentFolder, newPosition);
}

std::set<gd::String> ObjectsContainer::GetAllObjectNames() const {
  std::set<gd::String> names;
  for (const auto& object : initialObjects) {
    names.insert(object->GetName());
  }
  return names;
}

std::vector<const FolderOrItem<gd::Object>*>
ObjectsContainer::GetAllObjectFolderOrObjects() const {
  std::vector<const FolderOrItem<gd::Object>*> results;

  std::function<void(const FolderOrItem<gd::Object>& folder)>
      addChildrenOfFolder = [&](const FolderOrItem<gd::Object>& folder) {
        for (size_t i = 0; i < folder.GetChildrenCount(); ++i) {
          const auto& child = folder.GetChildAt(i);
          results.push_back(&child);

          if (child.IsFolder()) {
            addChildrenOfFolder(child);
          }
        }
      };

  addChildrenOfFolder(*rootFolder);

  return results;
}

}  // namespace gd