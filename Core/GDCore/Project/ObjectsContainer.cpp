/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectsContainer.h"

#include <algorithm>

#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/FolderOrItem.h"  // GEÄNDERT: statt ObjectFolderOrObject.h
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/PolymorphicClone.h"

namespace gd {

// Lambda für GetName - wird mehrfach verwendet
static auto GetObjectName = [](const gd::Object& obj) { return obj.GetName(); };

ObjectsContainer::ObjectsContainer(
    const ObjectsContainer::SourceType sourceType_)
    : sourceType(sourceType_) {
  rootFolder = gd::make_unique<gd::FolderOrItem<gd::Object>>("__ROOT");  // GEÄNDERT
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
  // The objects folders are not copied.
  // It's not an issue because the UI uses the serialization for duplication.
  rootFolder = gd::make_unique<gd::FolderOrItem<gd::Object>>("__ROOT");  // GEÄNDERT
}

void ObjectsContainer::SerializeObjectsTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("object");
  for (std::size_t j = 0; j < initialObjects.size(); j++) {
    initialObjects[j]->SerializeTo(element.AddChild("object"));
  }
}

void ObjectsContainer::SerializeFoldersTo(SerializerElement& element) const {
  rootFolder->SerializeTo(element, GetObjectName);  // GEÄNDERT: Lambda hinzugefügt
}

void ObjectsContainer::UnserializeFoldersFrom(
    gd::Project& project, const SerializerElement& element) {
  // GEÄNDERT: Template-Methode mit Lambdas
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
  std::cout << "=== AddMissingObjectsInRootFolder ===" << std::endl;
  std::cout << "  Total objects: " << initialObjects.size() << std::endl;
  std::cout << "  RootFolder children: " << rootFolder->GetChildrenCount() << std::endl;
  
  for (std::size_t i = 0; i < initialObjects.size(); ++i) {
    const gd::String& objectName = initialObjects[i]->GetName();
    std::cout << "  Checking object " << i << ": '" << objectName << "'" << std::endl;
    
    if (!rootFolder->HasItemNamed(objectName, GetObjectName)) {
      std::cout << "    -> Adding to root folder" << std::endl;
      rootFolder->InsertItem(&(*initialObjects[i]));
    } else {
      std::cout << "    -> Already in root folder" << std::endl;
    }
  }
  
  std::cout << "  After adding, RootFolder children: " << rootFolder->GetChildrenCount() << std::endl;
}

void ObjectsContainer::UnserializeObjectsFrom(
    gd::Project& project, const SerializerElement& element) {
  Clear();
  element.ConsiderAsArrayOf("object", "Objet");
  
  std::cout << "=== UnserializeObjectsFrom: " << element.GetChildrenCount() << " objects ===" << std::endl;
  
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    const SerializerElement& objectElement = element.GetChild(i);

    gd::String type = objectElement.GetStringAttribute("type");
    gd::String name = objectElement.GetStringAttribute("name", "", "nom");
    
    std::cout << "  Object " << i << ": name='" << name << "', type='" << type << "'" << std::endl;

    std::unique_ptr<gd::Object> newObject = project.CreateObject(type, name);

    if (newObject) {
      std::cout << "    Created object, name='" << newObject->GetName() << "'" << std::endl;
      newObject->UnserializeFrom(project, objectElement);
      std::cout << "    After unserialize, name='" << newObject->GetName() << "'" << std::endl;
      initialObjects.push_back(std::move(newObject));
    } else {
      std::cout << "WARNING: Unknown object type \"" << type << "\"" << std::endl;
    }
  }
  
  std::cout << "=== Total objects loaded: " << initialObjects.size() << " ===" << std::endl;
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

  rootFolder->InsertItem(&newlyCreatedObject);  // GEÄNDERT: InsertObject -> InsertItem

  return newlyCreatedObject;
}

gd::Object& ObjectsContainer::InsertNewObjectInFolder(
    const gd::Project& project,
    const gd::String& objectType,
    const gd::String& name,
    gd::FolderOrItem<gd::Object>& folderOrItem,  // GEÄNDERT: Typ
    std::size_t position) {
  gd::Object& newlyCreatedObject = *(*(initialObjects.insert(
      initialObjects.end(), project.CreateObject(objectType, name))));

  folderOrItem.InsertItem(&newlyCreatedObject, position);  // GEÄNDERT: InsertObject -> InsertItem

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

  rootFolder->RemoveRecursivelyItemNamed(name, GetObjectName);  // GEÄNDERT: mit Lambda

  initialObjects.erase(objectIt);
}

void ObjectsContainer::Clear() {
  rootFolder->Clear();
  initialObjects.clear();
}

void ObjectsContainer::MoveObjectFolderOrObjectToAnotherContainerInFolder(
    gd::FolderOrItem<gd::Object>& folderOrItem,  // GEÄNDERT: Typ
    gd::ObjectsContainer& newContainer,
    gd::FolderOrItem<gd::Object>& newParentFolder,  // GEÄNDERT: Typ
    std::size_t newPosition) {
  if (folderOrItem.IsFolder() || !newParentFolder.IsFolder()) return;

  std::vector<std::unique_ptr<gd::Object>>::iterator objectIt = find_if(
      initialObjects.begin(),
      initialObjects.end(),
      [&folderOrItem](std::unique_ptr<gd::Object>& object) {
        return object->GetName() == folderOrItem.GetItem().GetName();  // GEÄNDERT: GetObject -> GetItem
      });
  if (objectIt == initialObjects.end()) return;

  std::unique_ptr<gd::Object> object = std::move(*objectIt);
  initialObjects.erase(objectIt);

  newContainer.initialObjects.push_back(std::move(object));

  folderOrItem.GetParent().MoveFolderOrItemToAnotherFolder(  // GEÄNDERT: Methodenname
      folderOrItem, newParentFolder, newPosition);
}

std::set<gd::String> ObjectsContainer::GetAllObjectNames() const {
  std::set<gd::String> names;
  for (const auto& object : initialObjects) {
    names.insert(object->GetName());
  }
  return names;
}

std::vector<const FolderOrItem<gd::Object>*>  // GEÄNDERT: Rückgabetyp
ObjectsContainer::GetAllObjectFolderOrObjects() const {
  std::vector<const FolderOrItem<gd::Object>*> results;  // GEÄNDERT: Typ

  std::function<void(const FolderOrItem<gd::Object>& folder)> addChildrenOfFolder =  // GEÄNDERT: Typ
      [&](const FolderOrItem<gd::Object>& folder) {  // GEÄNDERT: Typ
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