/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ObjectGroupsContainer.h"

#include <memory>

#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {
gd::ObjectGroup ObjectGroupsContainer::badGroup;

ObjectGroupsContainer::ObjectGroupsContainer() {}

ObjectGroupsContainer::ObjectGroupsContainer(
    const ObjectGroupsContainer& other) {
  Init(other);
}

ObjectGroupsContainer& ObjectGroupsContainer::operator=(
    const ObjectGroupsContainer& other) {
  if (this != &other) Init(other);

  return *this;
}

void ObjectGroupsContainer::Init(const ObjectGroupsContainer& other) {
  objectGroups.clear();
  for (auto& it : other.objectGroups) {
    objectGroups.push_back(gd::make_unique<gd::ObjectGroup>(*it));
  }
}

void ObjectGroupsContainer::SerializeTo(SerializerElement& element) const {
  element.ConsiderAsArrayOf("group");
  for (std::size_t i = 0; i < objectGroups.size(); ++i) {
    objectGroups[i]->SerializeTo(element.AddChild("group"));
  }
}

void ObjectGroupsContainer::UnserializeFrom(const SerializerElement& element) {
  objectGroups.clear();
  element.ConsiderAsArrayOf("group", "Groupe");
  for (std::size_t i = 0; i < element.GetChildrenCount(); ++i) {
    const SerializerElement& groupElement = element.GetChild(i);
    gd::ObjectGroup& objectGroup =
        InsertNew(element.GetStringAttribute("name", "", "nom"), -1);
    objectGroup.UnserializeFrom(groupElement);
  }
}

bool ObjectGroupsContainer::Has(const gd::String& name) const {
  auto i = std::find_if(objectGroups.begin(),
                        objectGroups.end(),
                        [&name](const std::unique_ptr<gd::ObjectGroup>& group) {
                          return group->GetName() == name;
                        });
  return (i != objectGroups.end());
}

ObjectGroup& ObjectGroupsContainer::Get(std::size_t index) {
  if (index < objectGroups.size()) return *objectGroups[index];

  return badGroup;
}

const ObjectGroup& ObjectGroupsContainer::Get(std::size_t index) const {
  if (index < objectGroups.size()) return *objectGroups[index];

  return badGroup;
}

ObjectGroup& ObjectGroupsContainer::Get(const gd::String& name) {
  auto i = std::find_if(objectGroups.begin(),
                        objectGroups.end(),
                        [&name](const std::unique_ptr<gd::ObjectGroup>& group) {
                          return group->GetName() == name;
                        });
  if (i != objectGroups.end()) return **i;

  return badGroup;
}

const ObjectGroup& ObjectGroupsContainer::Get(const gd::String& name) const {
  auto i = std::find_if(objectGroups.begin(),
                        objectGroups.end(),
                        [&name](const std::unique_ptr<gd::ObjectGroup>& group) {
                          return group->GetName() == name;
                        });
  if (i != objectGroups.end()) return **i;

  return badGroup;
}

void ObjectGroupsContainer::Remove(const gd::String& name) {
  objectGroups.erase(
      std::remove_if(objectGroups.begin(),
                     objectGroups.end(),
                     [&name](const std::unique_ptr<gd::ObjectGroup>& group) {
                       return group->GetName() == name;
                     }),
      objectGroups.end());
}

std::size_t ObjectGroupsContainer::GetPosition(const gd::String& name) const {
  for (std::size_t i = 0; i < objectGroups.size(); ++i) {
    if (objectGroups[i]->GetName() == name) return i;
  }

  return gd::String::npos;
}

ObjectGroup& ObjectGroupsContainer::InsertNew(const gd::String& name,
                                              std::size_t position) {
  gd::ObjectGroup& newlyInsertedGroup = *(*(objectGroups.insert(
      position < objectGroups.size() ? objectGroups.begin() + position
                                     : objectGroups.end(),
      gd::make_unique<gd::ObjectGroup>())));
  newlyInsertedGroup.SetName(name);
  return newlyInsertedGroup;
}

ObjectGroup& ObjectGroupsContainer::Insert(const gd::ObjectGroup& group,
                                           std::size_t position) {
  gd::ObjectGroup& newlyInsertedGroup = *(*(objectGroups.insert(
      position < objectGroups.size() ? objectGroups.begin() + position
                                     : objectGroups.end(),
      gd::make_unique<gd::ObjectGroup>(group))));
  return newlyInsertedGroup;
}

bool ObjectGroupsContainer::Rename(const gd::String& oldName,
                                   const gd::String& newName) {
  if (Has(newName)) return false;

  auto i =
      std::find_if(objectGroups.begin(),
                   objectGroups.end(),
                   [&oldName](const std::unique_ptr<gd::ObjectGroup>& group) {
                     return group->GetName() == oldName;
                   });
  if (i != objectGroups.end()) {
    (*i)->SetName(newName);
  }

  return true;
}

void ObjectGroupsContainer::Move(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= objectGroups.size() || newIndex >= objectGroups.size())
    return;

  std::unique_ptr<gd::ObjectGroup> objectGroup =
      std::move(objectGroups[oldIndex]);
  objectGroups.erase(objectGroups.begin() + oldIndex);
  objectGroups.insert(objectGroups.begin() + newIndex, std::move(objectGroup));
}

void ObjectGroupsContainer::ForEachNameMatchingSearch(
    const gd::String& search,
    std::function<void(const gd::String& name)> fn) const {
  for (const auto& objectGroup : objectGroups) {
    if (objectGroup->GetName().FindCaseInsensitive(search) != gd::String::npos)
      fn(objectGroup->GetName());
  }
}

}  // namespace gd
