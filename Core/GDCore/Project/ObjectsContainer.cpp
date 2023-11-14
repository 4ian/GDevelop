/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectsContainer.h"

#include <algorithm>

#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectFolderOrObject.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

ObjectsContainer::ObjectsContainer() {
  rootFolder = gd::make_unique<gd::ObjectFolderOrObject>("__ROOT");
}

ObjectsContainer::~ObjectsContainer() {}

void ObjectsContainer::SerializeObjectsTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("object");
  for (std::size_t j = 0; j < initialObjects.size(); j++) {
    initialObjects[j]->SerializeTo(element.AddChild("object"));
  }
}
void ObjectsContainer::SerializeFoldersTo(SerializerElement& element) const {
  rootFolder->SerializeTo(element);
}

void ObjectsContainer::UnserializeFoldersFrom(
    gd::Project& project, const SerializerElement& element) {
  rootFolder->UnserializeFrom(project, element, *this);
}

void ObjectsContainer::AddMissingObjectsInRootFolder() {
  for (std::size_t i = 0; i < initialObjects.size(); ++i) {
    if (!rootFolder->HasObjectNamed(initialObjects[i]->GetName())) {
      rootFolder->InsertObject(&(*initialObjects[i]));
    }
  }
}

void ObjectsContainer::UnserializeObjectsFrom(
    gd::Project& project, const SerializerElement& element) {
  initialObjects.clear();
  element.ConsiderAsArrayOf("object", "Objet");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    const SerializerElement& objectElement = element.GetChild(i);

    gd::String type = objectElement.GetStringAttribute("type");
    std::unique_ptr<gd::Object> newObject = project.CreateObject(
        type, objectElement.GetStringAttribute("name", "", "nom"));

    if (newObject) {
      newObject->UnserializeFrom(project, objectElement);
      initialObjects.push_back(std::move(newObject));
    } else
      std::cout << "WARNING: Unknown object type \"" << type << "\""
                << std::endl;
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

  rootFolder->InsertObject(&newlyCreatedObject);

  return newlyCreatedObject;
}

gd::Object& ObjectsContainer::InsertNewObjectInFolder(
    const gd::Project& project,
    const gd::String& objectType,
    const gd::String& name,
    gd::ObjectFolderOrObject& objectFolderOrObject,
    std::size_t position) {
  gd::Object& newlyCreatedObject = *(*(initialObjects.insert(
      initialObjects.end(), project.CreateObject(objectType, name))));

  objectFolderOrObject.InsertObject(&newlyCreatedObject, position);

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

  rootFolder->RemoveRecursivelyObjectNamed(name);

  initialObjects.erase(objectIt);
}

void ObjectsContainer::MoveObjectFolderOrObjectToAnotherContainerInFolder(
    gd::ObjectFolderOrObject& objectFolderOrObject,
    gd::ObjectsContainer& newContainer,
    gd::ObjectFolderOrObject& newParentFolder,
    std::size_t newPosition) {
  if (objectFolderOrObject.IsFolder() || !newParentFolder.IsFolder()) return;

  std::vector<std::unique_ptr<gd::Object>>::iterator objectIt = find_if(
      initialObjects.begin(),
      initialObjects.end(),
      [&objectFolderOrObject](std::unique_ptr<gd::Object>& object) {
        return object->GetName() == objectFolderOrObject.GetObject().GetName();
      });
  if (objectIt == initialObjects.end()) return;

  std::unique_ptr<gd::Object> object = std::move(*objectIt);
  initialObjects.erase(objectIt);

  newContainer.initialObjects.push_back(std::move(object));

  objectFolderOrObject.GetParent().MoveObjectFolderOrObjectToAnotherFolder(
      objectFolderOrObject, newParentFolder, newPosition);
}

std::vector<const ObjectFolderOrObject*>
ObjectsContainer::GetAllObjectFolderOrObjects() const {
  std::vector<const ObjectFolderOrObject*> results;

  std::function<void(const ObjectFolderOrObject& folder)> addChildrenOfFolder =
      [&](const ObjectFolderOrObject& folder) {
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
