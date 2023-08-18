#include "ObjectsContainersList.h"

#include <vector>

#include "GDCore/Tools/Log.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

gd::Variable ObjectsContainersList::badVariable;

ObjectsContainersList
ObjectsContainersList::MakeNewObjectsContainersListForProjectAndLayout(
    const gd::Project& project, const gd::Layout& layout) {
  ObjectsContainersList objectsContainersList;
  objectsContainersList.Add(project);
  objectsContainersList.Add(layout);
  return objectsContainersList;
}

ObjectsContainersList
ObjectsContainersList::MakeNewObjectsContainersListForContainers(
    const gd::ObjectsContainer& globalObjectsContainer,
    const gd::ObjectsContainer& objectsContainer) {
  ObjectsContainersList objectsContainersList;
  objectsContainersList.Add(globalObjectsContainer);
  objectsContainersList.Add(objectsContainer);
  return objectsContainersList;
}

bool ObjectsContainersList::HasObjectOrGroupNamed(
    const gd::String& name) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(name) || (*it)->GetObjectGroups().Has(name))
      return true;
  }

  return false;
}

bool ObjectsContainersList::HasObjectNamed(
    const gd::String& name) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(name))
      return true;
  }

  return false;
}

bool ObjectsContainersList::HasObjectOrGroupWithVariableNamed(
  const gd::String& objectOrGroupName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      return variables.Has(variableName);
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // TODO: much like behaviors or object types, handle variables that are
      // common between objects in a group (and maybe we should require the
      // group to declare them?)
    }
  }

  return false;
}

const gd::Variable& ObjectsContainersList::GetObjectOrGroupVariable(
  const gd::String& objectOrGroupName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      if (variables.Has(variableName)) {
        return variables.Get(variableName);
      }

      return badVariable;
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // TODO: much like behaviors or object types, handle variables that are
      // common between objects in a group (and maybe we should require the
      // group to declare them?)
    }
  }

  return badVariable;
}

std::vector<gd::String> ObjectsContainersList::ExpandObjectName(const gd::String& objectOrGroupName) const {
  std::vector<gd::String> realObjects;

  // Check progressively each object container to find the object or the group with the specified name.
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {

    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      // We found the object, it's a single object with this name.
      realObjects.push_back(objectOrGroupName);
      break;
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // We found a group with this name, expand the object names inside of it.
      realObjects = (*it)->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();
      break;
    }
  }

  // Ensure that all returned objects actually exists (i.e: if some groups have
  // names refering to non existing objects, don't return them).
  for (std::size_t i = 0; i < realObjects.size();) {
    if (!HasObjectNamed(realObjects[i]))
      realObjects.erase(realObjects.begin() + i);
    else
      ++i;
  }

  return realObjects;
}

gd::String ObjectsContainersList::GetTypeOfObject(
    const gd::String& objectName) const {
  if (objectsContainers.size() != 2) {
    std::cout << this << std::endl;
    std::cout << objectsContainers.size() << std::endl;
    // TODO: rework forwarded methods so they can work with any number of containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }
  return gd::GetTypeOfObject(
      *objectsContainers[0], *objectsContainers[1], objectName, true);
}

bool ObjectsContainersList::HasBehaviorInObjectOrGroup(
    const gd::String& objectOrGroupName, const gd::String& behaviorName) const {
  if (objectsContainers.size() != 2) {
    // TODO: rework forwarded methods so they can work with any number of containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }
  return gd::HasBehaviorInObjectOrGroup(*objectsContainers[0],
                                        *objectsContainers[1],
                                        objectOrGroupName,
                                        behaviorName,
                                        true);
}

gd::String ObjectsContainersList::GetTypeOfBehavior(
    const gd::String& behaviorName) const {
  if (objectsContainers.size() != 2) {
    // TODO: rework forwarded methods so they can work with any number of containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }
  return gd::GetTypeOfBehavior(
      *objectsContainers[0], *objectsContainers[1], behaviorName, true);
}

}  // namespace gd