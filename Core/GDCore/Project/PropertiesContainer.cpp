/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/NamedPropertyDescriptor.h"

namespace gd {

PropertiesContainer::PropertiesContainer(
    EventsFunctionsContainer::FunctionOwner owner)
    : SerializableWithNameList<NamedPropertyDescriptor>(), owner(owner) {
  rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");
}

PropertiesContainer::PropertiesContainer(const PropertiesContainer &other)
    : SerializableWithNameList<NamedPropertyDescriptor>(other),
      owner(other.owner) {
  // The properties folders are not copied.
  // It's not an issue because the UI uses the serialization for duplication.
  rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");
}

PropertiesContainer &
PropertiesContainer::operator=(const PropertiesContainer &other) {
  if (this != &other) {
    SerializableWithNameList<NamedPropertyDescriptor>::operator=(other);
    owner = other.owner;
    // The properties folders are not copied.
    // It's not an issue because the UI uses the serialization for duplication.
    rootFolder = gd::make_unique<gd::PropertyFolderOrProperty>("__ROOT");
  }
  return *this;
}

gd::NamedPropertyDescriptor &PropertiesContainer::InsertNewPropertyInFolder(
    const gd::String &name,
    gd::PropertyFolderOrProperty &propertyFolderOrProperty,
    std::size_t position) {
  gd::NamedPropertyDescriptor &newlyCreatedProperty =
      InsertNew(name, GetCount());
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
  for (std::size_t i = 0; i < GetCount(); ++i) {
    auto &property = Get(i);
    if (!rootFolder->HasPropertyNamed(property.GetName())) {
      const gd::String &group = property.GetGroup();
      auto &folder = !group.empty() ? rootFolder->GetOrCreateChildFolder(group)
                                    : *rootFolder;
      folder.InsertProperty(&property);
    }
  }
}

void PropertiesContainer::SerializeFoldersTo(SerializerElement &element) const {
  rootFolder->SerializeTo(element);
}

void PropertiesContainer::UnserializeFoldersFrom(
    gd::Project &project, const SerializerElement &element) {
  rootFolder->UnserializeFrom(project, element, *this);
}

} // namespace gd