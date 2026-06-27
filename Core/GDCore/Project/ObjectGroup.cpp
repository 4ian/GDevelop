/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ObjectGroup.h"

#include <algorithm>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

bool ObjectGroup::Find(const gd::String& name) const {
  return std::find(memberObjects.begin(), memberObjects.end(), name) !=
         memberObjects.end();
}

void ObjectGroup::AddObject(const gd::String& name) {
  if (!Find(name)) memberObjects.push_back(name);
}

void ObjectGroup::RemoveObject(const gd::String& name) {
  memberObjects.erase(
      std::remove(memberObjects.begin(), memberObjects.end(), name),
      memberObjects.end());
}

void ObjectGroup::RenameObject(const gd::String& oldName,
                               const gd::String& newName) {
  for (auto& object : memberObjects) {
    if (object == oldName) object = newName;
  }
}

bool ObjectGroup::HasRequiredBehavior(const gd::String& behaviorType) const {
  return std::find(requiredBehaviorTypes.begin(), requiredBehaviorTypes.end(),
                   behaviorType) != requiredBehaviorTypes.end();
}

void ObjectGroup::AddRequiredBehavior(const gd::String& behaviorType) {
  if (!behaviorType.empty() && !HasRequiredBehavior(behaviorType))
    requiredBehaviorTypes.push_back(behaviorType);
}

void ObjectGroup::RemoveRequiredBehavior(const gd::String& behaviorType) {
  requiredBehaviorTypes.erase(
      std::remove(requiredBehaviorTypes.begin(), requiredBehaviorTypes.end(),
                  behaviorType),
      requiredBehaviorTypes.end());
}

void ObjectGroup::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", GetName());

  SerializerElement& objectsElement = element.AddChild("objects");
  objectsElement.ConsiderAsArrayOf("object");
  for (auto& name : GetAllObjectsNames()) {
    objectsElement.AddChild("object").SetAttribute("name", name);
  }

  if (!requiredBehaviorTypes.empty()) {
    SerializerElement& requiredBehaviorsElement =
        element.AddChild("requiredBehaviors");
    requiredBehaviorsElement.ConsiderAsArrayOf("behavior");
    for (auto& behaviorType : GetAllRequiredBehaviorTypes()) {
      requiredBehaviorsElement.AddChild("behavior").SetAttribute(
          "type", behaviorType);
    }
  }
}

void ObjectGroup::UnserializeFrom(const SerializerElement& element) {
  SetName(element.GetStringAttribute("name", "", "nom"));
  memberObjects.clear();
  requiredBehaviorTypes.clear();

  // Compatibility with GD <= 3.3
  if (element.HasChild("Objet")) {
    for (std::size_t j = 0; j < element.GetChildrenCount("Objet"); ++j)
      AddObject(element.GetChild("Objet", j).GetStringAttribute("nom"));
  }
  // End of compatibility code
  else {
    SerializerElement& objectsElement = element.GetChild("objects");
    objectsElement.ConsiderAsArrayOf("object");
    for (std::size_t j = 0; j < objectsElement.GetChildrenCount(); ++j)
      AddObject(objectsElement.GetChild(j).GetStringAttribute("name"));
  }

  if (element.HasChild("requiredBehaviors")) {
    SerializerElement& requiredBehaviorsElement =
        element.GetChild("requiredBehaviors");
    requiredBehaviorsElement.ConsiderAsArrayOf("behavior");
    for (std::size_t j = 0; j < requiredBehaviorsElement.GetChildrenCount();
         ++j) {
      AddRequiredBehavior(
          requiredBehaviorsElement.GetChild(j).GetStringAttribute("type"));
    }
  }
}

}  // namespace gd
