/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/PropertyFolderOrProperty.h"

#include <memory>

#include "GDCore/Project/NamedPropertyDescriptor.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

PropertyFolderOrProperty PropertyFolderOrProperty::badPropertyFolderOrProperty;
gd::String PropertyFolderOrProperty::emptyGroupName;

PropertyFolderOrProperty::PropertyFolderOrProperty()
    : folderName("__NULL"), property(nullptr) {}
PropertyFolderOrProperty::PropertyFolderOrProperty(
    gd::String folderName_, PropertyFolderOrProperty *parent_)
    : folderName(folderName_), parent(parent_), property(nullptr) {}
PropertyFolderOrProperty::PropertyFolderOrProperty(
    gd::NamedPropertyDescriptor *property_, PropertyFolderOrProperty *parent_)
    : property(property_), parent(parent_) {}
PropertyFolderOrProperty::~PropertyFolderOrProperty() {}

bool PropertyFolderOrProperty::HasPropertyNamed(const gd::String &name) {
  if (IsFolder()) {
    return std::any_of(children.begin(), children.end(),
                       [&name](std::unique_ptr<gd::PropertyFolderOrProperty>
                                   &propertyFolderOrProperty) {
                         return propertyFolderOrProperty->HasPropertyNamed(
                             name);
                       });
  }
  if (!property)
    return false;
  return property->GetName() == name;
}

PropertyFolderOrProperty &
PropertyFolderOrProperty::GetOrCreateChildFolder(const gd::String &name) {
  if (!IsFolder()) {
    LogError("Try to create of a folder '" + name + "' inside a property");
    return gd::PropertyFolderOrProperty::badPropertyFolderOrProperty;
  }
  for (auto &&child : children) {
    if (child->IsFolder() && child->folderName == name) {
      return *child;
    }
  }
  return InsertNewFolder(name, GetChildrenCount());
}

PropertyFolderOrProperty &
PropertyFolderOrProperty::GetPropertyNamed(const gd::String &name) {
  if (property && property->GetName() == name) {
    return *this;
  }
  if (IsFolder()) {
    for (std::size_t j = 0; j < children.size(); j++) {
      PropertyFolderOrProperty &foundInChild =
          children[j]->GetPropertyNamed(name);
      if (&(foundInChild) != &badPropertyFolderOrProperty) {
        return foundInChild;
      }
    }
  }
  return badPropertyFolderOrProperty;
}

void PropertyFolderOrProperty::SetFolderName(const gd::String &name) {
  if (!IsFolder())
    return;
  folderName = name;
  if (parent && !parent->parent) {
    SetGroupNameOfAllProperties(name);
  }
}

void PropertyFolderOrProperty::SetGroupNameOfAllProperties(
    const gd::String &groupName) {
  if (IsFolder()) {
    for (auto &&child : children) {
      child->SetGroupNameOfAllProperties(groupName);
    }
  } else {
    property->SetGroup(groupName);
  }
}

const gd::String &PropertyFolderOrProperty::GetGroupName() {
  auto *groupFolder = this;
  auto *rootFolder = parent;
  if (!rootFolder) {
    return gd::PropertyFolderOrProperty::emptyGroupName;
  }
  while (rootFolder->parent) {
    groupFolder = rootFolder;
    rootFolder = rootFolder->parent;
  }
  return groupFolder->GetFolderName();
}

PropertyFolderOrProperty &
PropertyFolderOrProperty::GetChildAt(std::size_t index) {
  if (index >= children.size())
    return badPropertyFolderOrProperty;
  return *children[index];
}
const PropertyFolderOrProperty &
PropertyFolderOrProperty::GetChildAt(std::size_t index) const {
  if (index >= children.size())
    return badPropertyFolderOrProperty;
  return *children[index];
}
PropertyFolderOrProperty &
PropertyFolderOrProperty::GetPropertyChild(const gd::String &name) {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (!children[j]->IsFolder()) {
      if (children[j]->GetProperty().GetName() == name)
        return *children[j];
    };
  }
  return badPropertyFolderOrProperty;
}

void PropertyFolderOrProperty::InsertProperty(
    gd::NamedPropertyDescriptor *insertedProperty, std::size_t position) {
  auto propertyFolderOrProperty =
      gd::make_unique<PropertyFolderOrProperty>(insertedProperty, this);
  propertyFolderOrProperty->GetProperty().SetGroup(GetGroupName());
  if (position < children.size()) {
    children.insert(children.begin() + position,
                    std::move(propertyFolderOrProperty));
  } else {
    children.push_back(std::move(propertyFolderOrProperty));
  }
}

std::size_t PropertyFolderOrProperty::GetChildPosition(
    const PropertyFolderOrProperty &child) const {
  for (std::size_t j = 0; j < children.size(); j++) {
    if (children[j].get() == &child)
      return j;
  }
  return gd::String::npos;
}

PropertyFolderOrProperty &
PropertyFolderOrProperty::InsertNewFolder(const gd::String &newFolderName,
                                          std::size_t position) {
  auto newFolderPtr =
      gd::make_unique<PropertyFolderOrProperty>(newFolderName, this);
  gd::PropertyFolderOrProperty &newFolder = *(*(children.insert(
      position < children.size() ? children.begin() + position : children.end(),
      std::move(newFolderPtr))));
  return newFolder;
};

void PropertyFolderOrProperty::RemoveRecursivelyPropertyNamed(
    const gd::String &name) {
  if (IsFolder()) {
    children.erase(
        std::remove_if(
            children.begin(), children.end(),
            [&name](std::unique_ptr<gd::PropertyFolderOrProperty>
                        &propertyFolderOrProperty) {
              return !propertyFolderOrProperty->IsFolder() &&
                     propertyFolderOrProperty->GetProperty().GetName() == name;
            }),
        children.end());
    for (auto &it : children) {
      it->RemoveRecursivelyPropertyNamed(name);
    }
  }
};

void PropertyFolderOrProperty::Clear() {
  if (IsFolder()) {
    for (auto &it : children) {
      it->Clear();
    }
    children.clear();
  }
};

bool PropertyFolderOrProperty::IsADescendantOf(
    const PropertyFolderOrProperty &otherPropertyFolderOrProperty) {
  if (parent == nullptr)
    return false;
  if (&(*parent) == &otherPropertyFolderOrProperty)
    return true;
  return parent->IsADescendantOf(otherPropertyFolderOrProperty);
}

void PropertyFolderOrProperty::MoveChild(std::size_t oldIndex,
                                         std::size_t newIndex) {
  if (!IsFolder())
    return;
  if (oldIndex >= children.size() || newIndex >= children.size())
    return;

  std::unique_ptr<gd::PropertyFolderOrProperty> propertyFolderOrProperty =
      std::move(children[oldIndex]);
  children.erase(children.begin() + oldIndex);
  children.insert(children.begin() + newIndex,
                  std::move(propertyFolderOrProperty));
}

void PropertyFolderOrProperty::RemoveFolderChild(
    const PropertyFolderOrProperty &childToRemove) {
  if (!IsFolder() || !childToRemove.IsFolder() ||
      childToRemove.GetChildrenCount() > 0) {
    return;
  }
  std::vector<std::unique_ptr<gd::PropertyFolderOrProperty>>::iterator it =
      find_if(children.begin(), children.end(),
              [&childToRemove](
                  std::unique_ptr<gd::PropertyFolderOrProperty> &child) {
                return child.get() == &childToRemove;
              });
  if (it == children.end())
    return;

  children.erase(it);
}

void PropertyFolderOrProperty::MovePropertyFolderOrPropertyToAnotherFolder(
    gd::PropertyFolderOrProperty &propertyFolderOrProperty,
    gd::PropertyFolderOrProperty &newParentFolder, std::size_t newPosition) {
  if (!newParentFolder.IsFolder())
    return;
  if (newParentFolder.IsADescendantOf(propertyFolderOrProperty))
    return;

  std::vector<std::unique_ptr<gd::PropertyFolderOrProperty>>::iterator it =
      find_if(children.begin(), children.end(),
              [&propertyFolderOrProperty](
                  std::unique_ptr<gd::PropertyFolderOrProperty>
                      &childPropertyFolderOrProperty) {
                return childPropertyFolderOrProperty.get() ==
                       &propertyFolderOrProperty;
              });
  if (it == children.end())
    return;

  std::unique_ptr<gd::PropertyFolderOrProperty> propertyFolderOrPropertyPtr =
      std::move(*it);
  children.erase(it);

  propertyFolderOrPropertyPtr->parent = &newParentFolder;
  propertyFolderOrPropertyPtr->SetGroupNameOfAllProperties(
      newParentFolder.GetGroupName());
  newParentFolder.children.insert(newPosition < newParentFolder.children.size()
                                      ? newParentFolder.children.begin() +
                                            newPosition
                                      : newParentFolder.children.end(),
                                  std::move(propertyFolderOrPropertyPtr));
}

void PropertyFolderOrProperty::SerializeTo(SerializerElement &element) const {
  if (IsFolder()) {
    element.SetAttribute("folderName", GetFolderName());
    if (children.size() > 0) {
      SerializerElement &childrenElement = element.AddChild("children");
      childrenElement.ConsiderAsArrayOf("propertyFolderOrProperty");
      for (std::size_t j = 0; j < children.size(); j++) {
        children[j]->SerializeTo(
            childrenElement.AddChild("propertyFolderOrProperty"));
      }
    }
  } else {
    element.SetAttribute("propertyName", GetProperty().GetName());
  }
}

void PropertyFolderOrProperty::UnserializeFrom(
    gd::Project &project, const SerializerElement &element,
    gd::PropertiesContainer &propertiesContainer) {
  children.clear();
  gd::String potentialFolderName = element.GetStringAttribute("folderName", "");

  if (!potentialFolderName.empty()) {
    property = nullptr;
    folderName = potentialFolderName;

    if (element.HasChild("children")) {
      const SerializerElement &childrenElements =
          element.GetChild("children", 0);
      childrenElements.ConsiderAsArrayOf("propertyFolderOrProperty");
      for (std::size_t i = 0; i < childrenElements.GetChildrenCount(); ++i) {
        std::unique_ptr<PropertyFolderOrProperty>
            childPropertyFolderOrProperty =
                make_unique<PropertyFolderOrProperty>();
        childPropertyFolderOrProperty->UnserializeFrom(
            project, childrenElements.GetChild(i), propertiesContainer);
        childPropertyFolderOrProperty->parent = this;
        children.push_back(std::move(childPropertyFolderOrProperty));
      }
    }
  } else {
    folderName = "";
    gd::String propertyName = element.GetStringAttribute("propertyName");
    if (propertiesContainer.Has(propertyName)) {
      property = &propertiesContainer.Get(propertyName);
    } else {
      gd::LogError("Property with name " + propertyName +
                   " not found in properties container.");
      property = nullptr;
    }
  }
};

} // namespace gd