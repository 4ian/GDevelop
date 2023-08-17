#include "ObjectsContainersList.h"

#include <optional>
#include <vector>

#include "GDCore/Tools/Log.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

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

std::optional<Variable::Type> ObjectsContainersList::HasObjectWithVariableNamed(
    const gd::String& objectOrGroupName, const gd::String& variableName) const {
  if (variableName.empty()) return {};
  if (objectOrGroupName.empty()) return {};

  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      if (variables.Has(variableName)) {
        return variables.Get(variableName).GetType();
      } else {
        return {};
      }
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // TODO: much like behaviors or object types, handle variables that are
      // common between objects in a group (and maybe we should require the
      // group to declare them?)
    }
  }

  return {};
}

gd::String ObjectsContainersList::GetTypeOfObject(
    const gd::String& objectName) const {
  if (objectsContainers.size() != 2) {
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