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
                  bind2nd(gd::ObjectHasName(), name)) != initialObjects.end());
}
gd::Object& ObjectsContainer::GetObject(const gd::String& name) {
  return *(*find_if(initialObjects.begin(),
                    initialObjects.end(),
                    bind2nd(gd::ObjectHasName(), name)));
}
const gd::Object& ObjectsContainer::GetObject(const gd::String& name) const {
  return *(*find_if(initialObjects.begin(),
                    initialObjects.end(),
                    bind2nd(gd::ObjectHasName(), name)));
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

void ObjectsContainer::SwapObjects(std::size_t firstObjectIndex,
                                   std::size_t secondObjectIndex) {
  if (firstObjectIndex >= initialObjects.size() ||
      secondObjectIndex >= initialObjects.size())
    return;

  std::iter_swap(initialObjects.begin() + firstObjectIndex,
                 initialObjects.begin() + secondObjectIndex);
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
              bind2nd(ObjectHasName(), name));
  if (objectIt == initialObjects.end()) return;

  initialObjects.erase(objectIt);
}

void ObjectsContainer::MoveObjectToAnotherContainer(
    const gd::String& name,
    gd::ObjectsContainer& newContainer,
    std::size_t newPosition) {
  std::vector<std::unique_ptr<gd::Object>>::iterator objectIt =
      find_if(initialObjects.begin(),
              initialObjects.end(),
              bind2nd(ObjectHasName(), name));
  if (objectIt == initialObjects.end()) return;

  std::unique_ptr<gd::Object> object = std::move(*objectIt);
  initialObjects.erase(objectIt);

  newContainer.initialObjects.insert(
      newPosition < newContainer.initialObjects.size()
          ? newContainer.initialObjects.begin() + newPosition
          : newContainer.initialObjects.end(),
      std::move(object));
}

}  // namespace gd
