/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectFolderOrObject.h"

#include <memory>

#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

ObjectFolderOrObject ObjectFolderOrObject::badObjectFolderOrObject;

ObjectFolderOrObject::ObjectFolderOrObject()
    : folderName("__NULL"), object(nullptr) {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::String folderName_,
                                           ObjectFolderOrObject* parent_)
    : folderName(folderName_), parent(parent_), object(nullptr) {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::Object* object_,
                                           ObjectFolderOrObject* parent_)
    : object(object_), parent(parent_) {}
ObjectFolderOrObject::~ObjectFolderOrObject() {}

bool ObjectFolderOrObject::HasObjectNamed(const gd::String& name) {
  if (IsFolder()) {
    return std::any_of(
        children.begin(),
        children.end(),
        [&name](
            std::unique_ptr<gd::ObjectFolderOrObject>& objectFolderOrObject) {
          return objectFolderOrObject->HasObjectNamed(name);
        });
  }
  if (!object) return false;
  return object->GetName() == name;
}
ObjectFolderOrObject& ObjectFolderOrObject::GetObjectNamed(
    const gd::String& name) {
  if (object && object->GetName() == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      ObjectFolderOrObject& foundInChild = children[j]->GetObjectNamed(name);
      if (&(foundInChild) != &badObjectFolderOrObject) {
        return foundInChild;
      }
    }
  }
  return badObjectFolderOrObject;
}

void ObjectFolderOrObject::SetFolderName(const gd::String& name) {
  if (!IsFolder()) return;
  folderName = name;
}

ObjectFolderOrObject& ObjectFolderOrObject::GetChildAt(std::size_t index) {
  if (index >= children.size()) return badObjectFolderOrObject;
  return *children[index];
}
const ObjectFolderOrObject& ObjectFolderOrObject::GetChildAt(std::size_t index) const {
  if (index >= children.size()) return badObjectFolderOrObject;
  return *children[index];
}
ObjectFolderOrObject& ObjectFolderOrObject::GetObjectChild(
    const gd::String& name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (children[j]->GetObject().GetName() == name) return *children[j];
    };
  }
  return badObjectFolderOrObject;
}

void ObjectFolderOrObject::InsertObject(gd::Object* insertedObject,
                                        std::size_t position) {
  auto objectFolderOrObject =
      gd::make_unique<ObjectFolderOrObject>(insertedObject, this);
  if (position < children.size()) {
    children.insert(children.begin() + position,
                    std::move(objectFolderOrObject));
  } else {
    children.push_back(std::move(objectFolderOrObject));
  }
}

std::size_t ObjectFolderOrObject::GetChildPosition(
    const ObjectFolderOrObject& child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child) return j;
  }
  return gd::String::npos;
}

ObjectFolderOrObject& ObjectFolderOrObject::InsertNewFolder(
    const gd::String& newFolderName, std::size_t position) {
  auto newFolderPtr =
      gd::make_unique<ObjectFolderOrObject>(newFolderName, this);
  gd::ObjectFolderOrObject& newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
};

void ObjectFolderOrObject::RemoveRecursivelyObjectNamed(
    const gd::String& name) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(children.begin(),
                       children.end(),
                       [&name](std::unique_ptr<gd::ObjectFolderOrObject>&
                                   objectFolderOrObject) {
                         return !objectFolderOrObject->IsFolder() &&
                                objectFolderOrObject->GetObject().GetName() ==
                                    name;
                       }),
        children.end());
    for (auto& it : children) {
      it->RemoveRecursivelyObjectNamed(name);
    }
  }
};

bool ObjectFolderOrObject::IsADescendantOf(
    const ObjectFolderOrObject& otherObjectFolderOrObject) {
  if (parent == nullptr) return false;
  if (&(*parent) == &otherObjectFolderOrObject) return true;
  return parent->IsADescendantOf(otherObjectFolderOrObject);
}

void ObjectFolderOrObject::MoveChild(std::size_t oldIndex,
                                     std::size_t newIndex) {
  if (!IsFolder()) return;
  if (oldIndex >= children.size() || newIndex >= children.size()) return;

  std::unique_ptr<gd::ObjectFolderOrObject> objectFolderOrObject =
      std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex, std::move(objectFolderOrObject));
}

void ObjectFolderOrObject::RemoveFolderChild(
    const ObjectFolderOrObject& childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  std::vector<std::unique_ptr<gd::ObjectFolderOrObject>>::iterator it = find_if(
      children.begin(),
      children.end(),
      [&childToRemove](std::unique_ptr<gd::ObjectFolderOrObject>& child) {
        return child.get() == &childToRemove;
      });
  if (it == children.end()) return;

  children.erase(it);
}

void ObjectFolderOrObject::MoveObjectFolderOrObjectToAnotherFolder(
    gd::ObjectFolderOrObject& objectFolderOrObject,
    gd::ObjectFolderOrObject& newParentFolder,
    std::size_t newPosition) {
  if (!newParentFolder.IsFolder()) return;
  if (newParentFolder.IsADescendantOf(objectFolderOrObject)) return;

  std::vector<std::unique_ptr<gd::ObjectFolderOrObject>>::iterator it =
      find_if(children.begin(),
              children.end(),
              [&objectFolderOrObject](std::unique_ptr<gd::ObjectFolderOrObject>&
                                          childObjectFolderOrObject) {
                return childObjectFolderOrObject.get() == &objectFolderOrObject;
              });
  if (it == children.end()) return;

  std::unique_ptr<gd::ObjectFolderOrObject> objectFolderOrObjectPtr =
      std::move(*it);
  children.erase(it);

  objectFolderOrObjectPtr->parent = &newParentFolder;
  newParentFolder.children.insert(
      newPosition < newParentFolder.children.size()
          ? newParentFolder.children.begin() + newPosition
          : newParentFolder.children.end(),
      std::move(objectFolderOrObjectPtr));
}

void ObjectFolderOrObject::SerializeTo(SerializerElement& element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement& childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("objectFolderOrObject");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(
            childrenElement.AddChild("objectFolderOrObject"));
      }
    }
  } else {
    element.SetAttribute("objectName", GetObject().GetName());
  }
}

void ObjectFolderOrObject::UnserializeFrom(
    gd::Project& project,
    const SerializerElement& element,
    gd::ObjectsContainer& objectsContainer) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    object = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement& childrenElements =
          element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("objectFolderOrObject");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<ObjectFolderOrObject> childObjectFolderOrObject =
            make_unique<ObjectFolderOrObject>();
        childObjectFolderOrObject->UnserializeFrom(
            project, childrenElements.GetChild(i), objectsContainer);
        childObjectFolderOrObject->parent = this;
        children.push_back(std::move(childObjectFolderOrObject));
      }
    }
  } else {
    folderName = "";
    gd::String objectName = element.GetStringAttribute("objectName");
    if (objectsContainer.HasObjectNamed(objectName)) {
      object = &objectsContainer.GetObject(objectName);
    } else {
      gd::LogError("Object with name " + objectName +
                   " not found in objects container.");
      object = nullptr;
    }
  }
};

}  // namespace gd