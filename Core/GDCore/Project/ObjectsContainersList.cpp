#include "ObjectsContainersList.h"

#include <vector>

#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

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

bool ObjectsContainersList::HasObjectNamed(const gd::String& name) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(name)) return true;
  }

  return false;
}

ObjectsContainersList::VariableExistence
ObjectsContainersList::HasObjectOrGroupWithVariableNamed(
    const gd::String& objectOrGroupName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      return variables.Has(variableName) ? VariableExistence::Exists
                                         : VariableExistence::DoesNotExist;
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // This could be adapted if objects groups have variables in the future.

      // Currently, a group is considered as the "intersection" of all of its
      // objects. Search "groups is the intersection of its objects" in the
      // codebase. Consider that a group has a variable if all objects of the
      // group have it:
      const auto& objectGroup = (*it)->GetObjectGroups().Get(objectOrGroupName);
      const auto& objectNames = objectGroup.GetAllObjectsNames();
      if (objectNames.empty()) return VariableExistence::GroupIsEmpty;

      bool existsOnAtLeastOneObject = false;
      bool missingOnAtLeastOneObject = false;
      for (const auto& objectName : objectNames) {
        if (!HasObjectWithVariableNamed(objectName, variableName)) {
          missingOnAtLeastOneObject = true;
          if (existsOnAtLeastOneObject) {
            return VariableExistence::ExistsOnlyOnSomeObjectsOfTheGroup;
          }
        } else {
          existsOnAtLeastOneObject = true;
          if (missingOnAtLeastOneObject) {
            return VariableExistence::ExistsOnlyOnSomeObjectsOfTheGroup;
          }
        }
      }

      if (missingOnAtLeastOneObject) {
        return VariableExistence::DoesNotExist;
      }

      return VariableExistence::Exists;
    }
  }

  return VariableExistence::DoesNotExist;
}

bool ObjectsContainersList::HasObjectWithVariableNamed(
    const gd::String& objectName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectName)) {
      const auto& variables = (*it)->GetObject(objectName).GetVariables();
      return variables.Has(variableName);
    }
  }

  return false;
}

bool ObjectsContainersList::HasObjectOrGroupVariablesContainer(
    const gd::String& objectOrGroupName,
    const gd::VariablesContainer& variablesContainer) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      return &variablesContainer ==
             &(*it)->GetObject(objectOrGroupName).GetVariables();
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // For groups, we consider that the first object of the group defines the
      // variables available for this group. Note that this is slightly
      // different than other methods where a group is considered as the
      // "intersection" of all of its objects.
      const auto& objectNames =
          (*it)->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

      if (!objectNames.empty()) {
        return HasObjectVariablesContainer(objectNames[0], variablesContainer);
      }
      return false;
    }
  }

  return false;
}

bool ObjectsContainersList::HasObjectVariablesContainer(
    const gd::String& objectName,
    const gd::VariablesContainer& variablesContainer) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectName)) {
      return &variablesContainer ==
             &(*it)->GetObject(objectName).GetVariables();
    }
  }

  return false;
}

const gd::VariablesContainer*
ObjectsContainersList::GetObjectOrGroupVariablesContainer(
    const gd::String& objectOrGroupName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      return &(*it)->GetObject(objectOrGroupName).GetVariables();
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // For groups, we consider that the first object of the group defines the
      // variables available for this group. Note that this is slightly
      // different than other methods where a group is considered as the
      // "intersection" of all of its objects.
      const auto& objectNames =
          (*it)->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();

      if (!objectNames.empty()) {
        return GetObjectVariablesContainer(objectNames[0]);
      }
      return nullptr;
    }
  }

  return nullptr;
}

const gd::VariablesContainer*
ObjectsContainersList::GetObjectVariablesContainer(
    const gd::String& objectName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectName)) {
      return &(*it)->GetObject(objectName).GetVariables();
    }
  }

  return nullptr;
}

gd::Variable::Type ObjectsContainersList::GetTypeOfObjectOrGroupVariable(
    const gd::String& objectOrGroupName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();

      return variables.Get(variableName).GetType();
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // This could be adapted if objects groups have variables in the future.

      // Currently, a group is considered as the "intersection" of all of its
      // objects. Search "groups is the intersection of its objects" in the
      // codebase. Consider that the first object having the variable will
      // define its type.
      const auto& objectGroup = (*it)->GetObjectGroups().Get(objectOrGroupName);
      const auto& objectNames = objectGroup.GetAllObjectsNames();

      for (const auto& objectName : objectNames) {
        if (HasObjectWithVariableNamed(objectName, variableName)) {
          return GetTypeOfObjectVariable(objectName, variableName);
        }
      }

      return Variable::Type::Number;
    }
  }

  return Variable::Type::Number;
}

gd::Variable::Type ObjectsContainersList::GetTypeOfObjectVariable(
    const gd::String& objectName, const gd::String& variableName) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectName)) {
      const auto& variables = (*it)->GetObject(objectName).GetVariables();

      return variables.Get(variableName).GetType();
    }
  }

  return Variable::Type::Number;
}

void ObjectsContainersList::ForEachObjectOrGroupVariableMatchingSearch(
    const gd::String& objectOrGroupName,
    const gd::String& search,
    std::function<void(const gd::String& variableName,
                       const gd::Variable& variable)> fn) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      variables.ForEachVariableMatchingSearch(search, fn);
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // This could be adapted if objects groups have variables in the future.

      // Currently, a group is considered as the "intersection" of all of its
      // objects. Search "groups is the intersection of its objects" in the
      // codebase. Consider that a group has a variable if all objects of the
      // group have it:
      const auto& objectGroup = (*it)->GetObjectGroups().Get(objectOrGroupName);
      const auto& objectNames = objectGroup.GetAllObjectsNames();

      if (objectNames.empty()) return;
      const auto& firstObjectName = objectNames.front();
      ForEachObjectVariableMatchingSearch(
          firstObjectName,
          search,
          [&](const gd::String& variableName, const gd::Variable& variable) {
            for (const auto& objectName : objectGroup.GetAllObjectsNames()) {
              if (!HasObjectWithVariableNamed(objectName, variableName)) {
                return;  // This variable is not shared by all objects of the
                         // group.
              }
            }

            // This variable is shared by all objects in the group. Note that
            // other objects can have it with a different type - we allow this.
            fn(variableName, variable);
          });
    }
  }
}

void ObjectsContainersList::ForEachObjectVariableMatchingSearch(
    const gd::String& objectOrGroupName,
    const gd::String& search,
    std::function<void(const gd::String& variableName,
                       const gd::Variable& variable)> fn) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      const auto& variables =
          (*it)->GetObject(objectOrGroupName).GetVariables();
      variables.ForEachVariableMatchingSearch(search, fn);
    }
  }
}

void ObjectsContainersList::ForEachNameMatchingSearch(
    const gd::String& search,
    std::function<void(const gd::String& name,
                       const gd::ObjectConfiguration* objectConfiguration)> fn)
    const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    for (const auto& object : (*it)->GetObjects()) {
      if (object->GetName().FindCaseInsensitive(search) != gd::String::npos)
        fn(object->GetName(), &object->GetConfiguration());
    }
    (*it)->GetObjectGroups().ForEachNameMatchingSearch(
        search, [&](const gd::String& name) { fn(name, nullptr); });
  }
}

std::vector<gd::String> ObjectsContainersList::ExpandObjectName(
    const gd::String& objectOrGroupName,
    const gd::String& onlyObjectToSelectIfPresent) const {
  std::vector<gd::String> realObjects;

  // Check progressively each object container to find the object or the group
  // with the specified name.
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    if ((*it)->HasObjectNamed(objectOrGroupName)) {
      // We found the object, it's a single object with this name.
      realObjects.push_back(objectOrGroupName);
      break;
    }
    if ((*it)->GetObjectGroups().Has(objectOrGroupName)) {
      // We found a group with this name, expand the object names inside of it.
      realObjects =
          (*it)->GetObjectGroups().Get(objectOrGroupName).GetAllObjectsNames();
      break;
    }
  }

  // If the "current object" is present, use it and only it.
  if (!onlyObjectToSelectIfPresent.empty() &&
      find(realObjects.begin(),
           realObjects.end(),
           onlyObjectToSelectIfPresent) != realObjects.end()) {
    realObjects.clear();
    realObjects.push_back(onlyObjectToSelectIfPresent);
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

void ObjectsContainersList::ForEachObject(
    std::function<void(const gd::Object& object)> fn) const {
  for (auto it = objectsContainers.rbegin(); it != objectsContainers.rend();
       ++it) {
    const auto& objectsContainer = **it;
    for (const auto& object : objectsContainer.GetObjects()) {
      fn(*object);
    }
  }
}

gd::String ObjectsContainersList::GetTypeOfObject(
    const gd::String& objectName) const {
  if (objectsContainers.size() != 2) {
    std::cout << this << std::endl;
    std::cout << objectsContainers.size() << std::endl;
    // TODO: rework forwarded methods so they can work with any number of
    // containers.
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
    // TODO: rework forwarded methods so they can work with any number of
    // containers.
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

gd::String ObjectsContainersList::GetTypeOfBehaviorInObjectOrGroup(
    const gd::String& objectOrGroupName,
    const gd::String& behaviorName,
    bool searchInGroups) const {
  if (objectsContainers.size() != 2) {
    // TODO: rework forwarded methods so they can work with any number of
    // containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }
  return gd::GetTypeOfBehaviorInObjectOrGroup(*objectsContainers[0],
                                              *objectsContainers[1],
                                              objectOrGroupName,
                                              behaviorName,
                                              searchInGroups);
}

gd::String ObjectsContainersList::GetTypeOfBehavior(
    const gd::String& behaviorName, bool searchInGroups) const {
  if (objectsContainers.size() != 2) {
    // TODO: rework forwarded methods so they can work with any number of
    // containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }
  return gd::GetTypeOfBehavior(*objectsContainers[0],
                               *objectsContainers[1],
                               behaviorName,
                               searchInGroups);
}

std::vector<gd::String> ObjectsContainersList::GetBehaviorsOfObject(
    const gd::String& objectName, bool searchInGroups) const {
  if (objectsContainers.size() != 2) {
    // TODO: rework forwarded methods so they can work with any number of
    // containers.
    gd::LogFatalError(
        "ObjectsContainersList::GetTypeOfObject called with objectsContainers "
        "not being exactly 2. This is a logical error and will crash.");
  }

  return gd::GetBehaviorsOfObject(
      *objectsContainers[0], *objectsContainers[1], objectName, searchInGroups);
}

}  // namespace gd