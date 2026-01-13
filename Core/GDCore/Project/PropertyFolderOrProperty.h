/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/String.h"
#include "GDCore/Project/QuickCustomization.h"

namespace gd {
class Project;
class NamedPropertyDescriptor;
class SerializerElement;
class PropertiesContainer;
}  // namespace gd

namespace gd {

/**
 * \brief Class representing a folder structure in order to organize properties
 * in folders (to be used with a PropertiesContainer.)
 *
 * \see gd::PropertiesContainer
 */
class GD_CORE_API PropertyFolderOrProperty {
 public:
  /**
   * \brief Default constructor creating an empty instance. Useful for the null
   * property pattern.
   */
  PropertyFolderOrProperty();

  virtual ~PropertyFolderOrProperty();

  /**
   * \brief Constructor for creating an instance representing a folder.
   */
  PropertyFolderOrProperty(gd::String folderName_,
                       PropertyFolderOrProperty* parent_ = nullptr);

  /**
   * \brief Constructor for creating an instance representing a property.
   */
  PropertyFolderOrProperty(gd::NamedPropertyDescriptor* property_,
                       PropertyFolderOrProperty* parent_ = nullptr);

  /**
   * \brief Returns the property behind the instance.
   */
  gd::NamedPropertyDescriptor& GetProperty() const { return *property; }

  /**
   * \brief Returns true if the instance represents a folder.
   */
  bool IsFolder() const { return !folderName.empty(); }

  /**
   * \brief Returns the name of the folder.
   */
  const gd::String& GetFolderName() const { return folderName; }

  /**
   * \brief Set the folder name. Does nothing if called on an instance not
   * representing a folder.
   */
  void SetFolderName(const gd::String& name);

  /**
   * \brief Returns true if the instance represents the property with the given
   * name or if any of the children does (recursive search).
   */
  bool HasPropertyNamed(const gd::String& name);

  /**
   * \brief Returns the child instance holding the property with the given name
   * (recursive search).
   */
  PropertyFolderOrProperty& GetPropertyNamed(const gd::String& name);

  /**
   * \brief Returns the number of children. Returns 0 if the instance represents
   * a property.
   */
  std::size_t GetChildrenCount() const {
    if (IsFolder()) return children.size();
    return 0;
  }

  /**
   * \brief Returns the child PropertyFolderOrProperty at the given index.
   */
  PropertyFolderOrProperty& GetChildAt(std::size_t index);

  /**
   * \brief Returns the child PropertyFolderOrProperty at the given index.
   */
  const PropertyFolderOrProperty& GetChildAt(std::size_t index) const;

  /**
   * \brief Returns the child PropertyFolderOrProperty that represents the property
   * with the given name. To use only if sure that the instance holds the property
   * in its direct children (no recursive search).
   */
  PropertyFolderOrProperty& GetPropertyChild(const gd::String& name);

  /**
   * \brief Returns the first direct child that represents a folder
   * with the given name or create one.
   */
  PropertyFolderOrProperty& GetOrCreateChildFolder(const gd::String& name);

  /**
   * \brief Returns the parent of the instance. If the instance has no parent
   * (root folder), the null property is returned.
   */
  PropertyFolderOrProperty& GetParent() {
    if (parent == nullptr) {
      return badPropertyFolderOrProperty;
    }
    return *parent;
  };

  /**
   * \brief Returns true if the instance is a root folder (that's to say it
   * has no parent).
   */
  bool IsRootFolder() { return !property && !parent; }

  /**
   * \brief Moves a child from a position to a new one.
   */
  void MoveChild(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Removes the given child from the instance's children. If the given
   * child contains children of its own, does nothing.
   */
  void RemoveFolderChild(const PropertyFolderOrProperty& childToRemove);

  /**
   * \brief Removes the child representing the property with the given name from
   * the instance children and recursively does it for every folder children.
   */
  void RemoveRecursivelyPropertyNamed(const gd::String& name);

  /**
   * \brief Clears all children
   */
  void Clear();

  /**
   * \brief Inserts an instance representing the given property at the given
   * position.
   */
  void InsertProperty(gd::NamedPropertyDescriptor* insertedProperty,
                    std::size_t position = (size_t)-1);

  /**
   * \brief Inserts an instance representing a folder with the given name at the
   * given position.
   */
  PropertyFolderOrProperty& InsertNewFolder(const gd::String& newFolderName,
                                        std::size_t position);

  /**
   * \brief Returns true if the instance is a descendant of the given instance
   * of PropertyFolderOrProperty.
   */
  bool IsADescendantOf(const PropertyFolderOrProperty& otherPropertyFolderOrProperty);

  /**
   * \brief Returns the position of the given instance of PropertyFolderOrProperty
   * in the instance's children.
   */
  std::size_t GetChildPosition(const PropertyFolderOrProperty& child) const;

  /**
   * \brief Moves the given child PropertyFolderOrProperty to the given folder at
   * the given position.
   */
  void MovePropertyFolderOrPropertyToAnotherFolder(
      gd::PropertyFolderOrProperty& propertyFolderOrProperty,
      gd::PropertyFolderOrProperty& newParentFolder,
      std::size_t newPosition);

  /** \name Saving and loading
   * Members functions related to saving and loading the properties of the class.
   */
  ///@{
  /**
   * \brief Serialize the PropertyFolderOrProperty instance.
   */
  void SerializeTo(SerializerElement& element) const;

  /**
   * \brief Unserialize the PropertyFolderOrProperty instance.
   */
  void UnserializeFrom(gd::Project& project,
                       const SerializerElement& element,
                       PropertiesContainer& propertiesContainer);
  ///@}

  void UpdateGroupNameOfAllProperties();

 private:
  void SetGroupNameOfAllProperties(const gd::String& groupName);
  const gd::String &GetGroupName();

  static gd::PropertyFolderOrProperty badPropertyFolderOrProperty;
  static gd::String emptyGroupName;

  gd::PropertyFolderOrProperty*
      parent = nullptr;  // nullptr if root folder, points to the parent folder otherwise.

  // Representing a property:
  gd::NamedPropertyDescriptor* property;  // nullptr if folderName is set.

  // or representing a folder:
  gd::String folderName;  // Empty if property is set.

  std::vector<std::unique_ptr<PropertyFolderOrProperty>>
      children;  // Folder children.
};

}  // namespace gd
