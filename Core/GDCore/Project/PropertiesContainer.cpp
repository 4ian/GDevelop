/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/PropertiesContainer.h"

#include <unordered_set>

#include "GDCore/Project/NamedPropertyDescriptor.h"

namespace gd {

PropertiesContainer::PropertiesContainer(
    EventsFunctionsContainer::FunctionOwner owner)
    : properties(), owner(owner) {
  rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");
}

PropertiesContainer::PropertiesContainer(const PropertiesContainer &other)
    : properties(other.properties), owner(other.owner) {
  // The properties folders are not copied.
  // It's not an issue because the UI uses the serialization for duplication.
  rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");;
}

PropertiesContainer &
PropertiesContainer::operator=(const PropertiesContainer &other) {
  if (this != &other) {
    properties = other.properties;
    owner = other.owner;
    // The properties folders are not copied.
    // It's not an issue because the UI uses the serialization for duplication.
    rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");
  }
  return *this;
}

NamedPropertyDescriptor &
PropertiesContainer::Insert(const NamedPropertyDescriptor &property,
                            size_t position) {
  auto &newProperty = properties.Insert(property, position);
  rootFolder->InsertProperty(&newProperty);
  return newProperty;
}

NamedPropertyDescriptor &PropertiesContainer::InsertNew(const gd::String &name,
                                                        size_t position) {

  auto &newlyCreatedProperty = properties.InsertNew(name, position);
  rootFolder->InsertProperty(&newlyCreatedProperty);
  return newlyCreatedProperty;
}

bool PropertiesContainer::Has(const gd::String &name) const {
  return properties.Has(name);
}

NamedPropertyDescriptor &PropertiesContainer::Get(const gd::String &name) {
  return properties.Get(name);
}

const NamedPropertyDescriptor &
PropertiesContainer::Get(const gd::String &name) const {
  return properties.Get(name);
}

NamedPropertyDescriptor &PropertiesContainer::Get(size_t index) {
  return properties.Get(index);
}

const NamedPropertyDescriptor &PropertiesContainer::Get(size_t index) const {
  return properties.Get(index);
}

void PropertiesContainer::Remove(const gd::String &name) {
  rootFolder->RemoveRecursivelyPropertyNamed(name);
  properties.Remove(name);
}

void PropertiesContainer::Move(std::size_t oldIndex, std::size_t newIndex) {
  properties.Move(oldIndex, newIndex);
}

bool PropertiesContainer::IsEmpty() const { return properties.IsEmpty(); };

size_t PropertiesContainer::GetCount() const { return properties.GetCount(); }

std::size_t
PropertiesContainer::GetPosition(const NamedPropertyDescriptor &element) const {
  return properties.GetPosition(element);
}

const std::vector<std::unique_ptr<NamedPropertyDescriptor>> &
PropertiesContainer::GetInternalVector() const {
  return properties.GetInternalVector();
};

std::vector<std::unique_ptr<NamedPropertyDescriptor>> &
PropertiesContainer::GetInternalVector() {
  return properties.GetInternalVector();
};

gd::NamedPropertyDescriptor &PropertiesContainer::InsertNewPropertyInFolder(
    const gd::String &name,
    gd::PropertyFolderOrProperty &propertyFolderOrProperty,
    std::size_t position) {
  gd::NamedPropertyDescriptor &newlyCreatedProperty =
      properties.InsertNew(name, properties.GetCount());
  propertyFolderOrProperty.InsertProperty(&newlyCreatedProperty, position);
  return newlyCreatedProperty;
}

std::vector<const PropertyFolderOrProperty *>
PropertiesContainer::GetAllPropertyFolderOrProperty() const {
  std::vector<const PropertyFolderOrProperty *> results;

  std::function<void(const PropertyFolderOrProperty &folder)>
      addChildrenOfFolder = [&](const PropertyFolderOrProperty &folder) {
        for (size_t i = 0; i < folder.GetChildrenCount(); ++i) {
          const auto &child = folder.GetChildAt(i);
          results.push_back(&child);

          if (child.IsFolder()) {
            addChildrenOfFolder(child);
          }
        }
      };

  addChildrenOfFolder(*rootFolder);

  return results;
}

void PropertiesContainer::AddMissingPropertiesInRootFolder() {
  // Get the names of the properties already in the folders once: searching
  // the folders for each property would be O(number of properties^2).
  std::unordered_set<gd::String> propertyNamesInFolders;
  rootFolder->AddPropertyNamesTo(propertyNamesInFolders);

  for (std::size_t i = 0; i < properties.GetCount(); ++i) {
    auto &property = properties.Get(i);
    if (propertyNamesInFolders.find(property.GetName()) ==
        propertyNamesInFolders.end()) {
      const gd::String &group = property.GetGroup();
      auto &folder = !group.empty() ? rootFolder->GetOrCreateChildFolder(group)
                                    : *rootFolder;
      folder.InsertProperty(&property);
      // The property is now in the folders (unless the root is not a folder,
      // which only happens with an invalid serialized folder structure).
      if (rootFolder->IsFolder())
        propertyNamesInFolders.insert(property.GetName());
    }
  }
}

void PropertiesContainer::SerializeElementsTo(
    const gd::String &elementName, SerializerElement &element) const {
  properties.SerializeElementsTo(elementName, element);
}

void PropertiesContainer::UnserializeElementsFrom(
    const gd::String &elementName, const SerializerElement &element) {
  properties.UnserializeElementsFrom(elementName, element);
}

void PropertiesContainer::SerializeFoldersTo(SerializerElement &element) const {
  rootFolder->SerializeTo(element);
}

void PropertiesContainer::UnserializeFoldersFrom(
    gd::Project &project, const SerializerElement &element) {
  rootFolder->UnserializeFrom(project, element, *this);
  rootFolder->UpdateGroupNameOfAllProperties();
}

} // namespace gd