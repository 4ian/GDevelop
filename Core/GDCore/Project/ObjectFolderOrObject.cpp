/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/ObjectFolderOrObject.h"

#include <memory>

#include "GDCore/Project/Object.h"
using namespace std;

namespace gd {

ObjectFolderOrObject::ObjectFolderOrObject() {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::String folderName_)
    : folderName(folderName_) {}
ObjectFolderOrObject::ObjectFolderOrObject(gd::Object* object_)
    : object(object_) {}
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

void ObjectFolderOrObject::InsertObject(gd::Object* insertedObject) {
  auto objectFolderOrObject =
      gd::make_unique<ObjectFolderOrObject>(insertedObject);
  children.push_back(std::move(objectFolderOrObject));
}

ObjectFolderOrObject& ObjectFolderOrObject::InsertNewFolder(
    const gd::String newFolderName, std::size_t position) {
  auto newFolderPtr = gd::make_unique<ObjectFolderOrObject>(newFolderName);
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

}  // namespace gd