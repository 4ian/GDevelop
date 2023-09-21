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

using namespace std;

namespace gd {

ObjectFolderOrObject ObjectFolderOrObject::badObjectFolderOrObject;

ObjectFolderOrObject::ObjectFolderOrObject() : folderName("__NULL") {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::String folderName_,
                                           ObjectFolderOrObject* parent_)
    : folderName(folderName_), parent(parent_) {}
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
          return objectFolderOrObject.get()->HasObjectNamed(name);
        });
  }
  return object->GetName() == name;
}

ObjectFolderOrObject& ObjectFolderOrObject::GetChild(std::size_t index) {
  return *children[index];
}

void ObjectFolderOrObject::InsertObject(gd::Object* insertedObject) {
  auto objectFolderOrObject =
      gd::make_unique<ObjectFolderOrObject>(insertedObject, this);
  children.push_back(std::move(objectFolderOrObject));
}

ObjectFolderOrObject& ObjectFolderOrObject::InsertNewFolder(
    const gd::String newFolderName, std::size_t position) {
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
        std::remove_if(
            children.begin(),
            children.end(),
            [&name](std::unique_ptr<gd::ObjectFolderOrObject>&
                        objectFolderOrObject) {
              return objectFolderOrObject.get()->GetObject().GetName() == name;
            }),
        children.end());
  }
  for (auto& it : children) {
    it.get()->RemoveRecursivelyObjectNamed(name);
  }
};

void ObjectFolderOrObject::SerializeTo(SerializerElement& element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement& childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("objectFolderOrObjet");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(
            childrenElement.AddChild("objectFolderOrObjet"));
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
  if (element.HasAttribute("folderName")) {
    object = nullptr;
    folderName = element.GetStringAttribute("folderName", "");

    if (element.HasChild("children")) {
      SerializerElement& childrenElements = element.GetChild("children");
      childrenElements.ConsiderAsArrayOf("objectFolderOrObjet");

      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<ObjectFolderOrObject> childObjectFolderOrObject =
            make_unique<ObjectFolderOrObject>();
        childObjectFolderOrObject->UnserializeFrom(
            project, childrenElements.GetChild(i), objectsContainer);
        children.push_back(std::move(childObjectFolderOrObject));
      }
    }
  } else {
    folderName = "";
    object =
        &objectsContainer.GetObject(element.GetStringAttribute("objectName"));
  }
};

}  // namespace gd